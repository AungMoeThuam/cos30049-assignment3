import unittest
import tempfile
import os
import shutil
import pandas as pd
from app.utils import parse_eml, extract_features_for_text, parse_csv_emails, extract_top_spam_words


class TestParseEml(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory to store test .eml files
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        # Remove the temporary directory
        shutil.rmtree(self.test_dir)

    def write_eml(self, filename, content):
        filepath = os.path.join(self.test_dir, filename)
        with open(filepath, "wb") as f:
            f.write(content)
        return filepath

    def test_plain_text_email(self):
        # Simple plain text email
        eml_content = (
            b"Subject: Test Plain Text Email\n"
            b"From: sender@example.com\n"
            b"To: receiver@example.com\n"
            b"Content-Type: text/plain; charset=utf-8\n\n"
            b"Hello, this is a plain text email body."
        )
        filepath = self.write_eml("plain.eml", eml_content)
        subject, body = parse_eml(filepath)
        self.assertEqual(subject, "Test Plain Text Email")
        self.assertEqual(body, "Hello, this is a plain text email body.")

    def test_multipart_email_text_and_html(self):
        # Multipart email containing both text and html parts
        eml_content = (
            b"Subject: Test Multipart Email\n"
            b"MIME-Version: 1.0\n"
            b'Content-Type: multipart/alternative; boundary="boundary-string"\n\n'
            b"--boundary-string\n"
            b"Content-Type: text/plain; charset=utf-8\n\n"
            b"Hello, this is plain text version.\n"
            b"--boundary-string\n"
            b"Content-Type: text/html; charset=utf-8\n\n"
            b"<html><body><p>Hello, this is <b>html</b> version.</p></body></html>\n"
            b"--boundary-string--"
        )
        filepath = self.write_eml("multipart.eml", eml_content)
        subject, body = parse_eml(filepath)
        self.assertEqual(subject, "Test Multipart Email")
        self.assertEqual(body, "Hello, this is html version.")

    def test_html_only_email(self):
        # Email containing only HTML part
        eml_content = (
            b"Subject: Test HTML Only Email\n"
            b"Content-Type: text/html; charset=utf-8\n\n"
            b"<html><body><h1>Hello HTML</h1><p>Test body</p></body></html>"
        )
        filepath = self.write_eml("html_only.eml", eml_content)
        subject, body = parse_eml(filepath)
        self.assertEqual(subject, "Test HTML Only Email")
        self.assertEqual(body, "Hello HTML Test body")

    def test_empty_email(self):
        # Email with no body
        eml_content = b"Subject: Empty Email\n\n"
        filepath = self.write_eml("empty.eml", eml_content)
        subject, body = parse_eml(filepath)
        self.assertEqual(subject, "Empty Email")
        self.assertEqual(body, "")

    def test_missing_subject(self):
        # Email with no subject header
        eml_content = b"From: sender@example.com\n\n" b"Body without subject."
        filepath = self.write_eml("no_subject.eml", eml_content)
        subject, body = parse_eml(filepath)
        self.assertEqual(subject, "")
        self.assertEqual(body, "Body without subject.")

    def test_encoded_subject(self):
        # Email with RFC 2047 encoded subject header
        eml_content = (
            b"Subject: =?utf-8?B?VGVzdCBTdWJqZWN0?=\n"
            b"Content-Type: text/plain; charset=utf-8\n\n"
            b"Hello World"
        )
        filepath = self.write_eml("encoded_subject.eml", eml_content)
        subject, body = parse_eml(filepath)
        self.assertEqual(subject, "Test Subject")
        self.assertEqual(body, "Hello World")


class TestExtractFeatures(unittest.TestCase):
    def test_extract_features_for_text(self):
        text = "Congratulations! You won $1000 cash. Click http://win.com now! 🎁"
        df = extract_features_for_text(text)
        
        # Verify it returns a DataFrame
        self.assertIsInstance(df, pd.DataFrame)
        self.assertEqual(len(df), 1)
        
        # Check that the 9 numeric columns and the text column exist
        expected_cols = [
            "num_urls", "num_exclamation", "num_question", "num_dollar",
            "num_all_caps", "num_numbers", "word_count", "capital_ratio",
            "emoji_count", "text"
        ]
        for col in expected_cols:
            self.assertIn(col, df.columns)
            
        # Verify specific feature counts
        self.assertEqual(df["num_urls"].iloc[0], 1)
        self.assertEqual(df["num_exclamation"].iloc[0], 2)
        self.assertEqual(df["num_dollar"].iloc[0], 1)
        self.assertEqual(df["num_numbers"].iloc[0], 1) # "1000"
        self.assertEqual(df["emoji_count"].iloc[0], 1)


class TestParseCsv(unittest.TestCase):
    def test_valid_csv(self):
        csv_content = (
            b"subject,body\n"
            b"Hello,Congratulations you won a lottery\n"
            b"Meeting,Please confirm our 2 PM appointment\n"
            b",Only body here"
        )
        emails = parse_csv_emails(csv_content)
        self.assertEqual(len(emails), 3)
        self.assertEqual(emails[0], {"subject": "Hello", "body": "Congratulations you won a lottery"})
        self.assertEqual(emails[1], {"subject": "Meeting", "body": "Please confirm our 2 PM appointment"})
        self.assertEqual(emails[2], {"subject": "", "body": "Only body here"})

    def test_case_insensitive_headers(self):
        csv_content = (
            b"SubJect,BODY\n"
            b"Hello,World"
        )
        emails = parse_csv_emails(csv_content)
        self.assertEqual(len(emails), 1)
        self.assertEqual(emails[0], {"subject": "Hello", "body": "World"})

    def test_missing_body_column(self):
        csv_content = (
            b"subject,from\n"
            b"Hello,sender@example.com"
        )
        with self.assertRaises(ValueError) as context:
            parse_csv_emails(csv_content)
        self.assertIn("missing the required 'body' column", str(context.exception))

    def test_empty_rows_skipped(self):
        csv_content = (
            b"subject,body\n"
            b"Hello, \n"
            b"Test,Actual Body"
        )
        emails = parse_csv_emails(csv_content)
        self.assertEqual(len(emails), 1)
        self.assertEqual(emails[0], {"subject": "Test", "body": "Actual Body"})

    def test_empty_csv(self):
        csv_content = b""
        with self.assertRaises(ValueError) as context:
            parse_csv_emails(csv_content)
        self.assertIn("empty or has no header row", str(context.exception))


class TestExtractTopSpamWords(unittest.TestCase):
    def test_basic_word_frequency(self):
        spam_emails = [
            "Get free cash prize today!",
            "Claim your free gift now",
            "Urgent: prize winner announcement"
        ]
        # Total spam emails = 3
        # Frequencies:
        # 'free': 2 (66.7%)
        # 'prize': 2 (66.7%)
        # others: 1 (33.3%)
        
        top_words = extract_top_spam_words(spam_emails, top_n=2)
        self.assertEqual(len(top_words), 2)
        
        # Verify sorting (alphabetical tie breaker: 'free' before 'prize')
        self.assertEqual(top_words[0]["word"], "free")
        self.assertEqual(top_words[0]["count"], 2)
        self.assertEqual(top_words[0]["percentage"], 66.7)
        
        self.assertEqual(top_words[1]["word"], "prize")
        self.assertEqual(top_words[1]["count"], 2)
        self.assertEqual(top_words[1]["percentage"], 66.7)

    def test_empty_input(self):
        self.assertEqual(extract_top_spam_words([]), [])

    def test_punctuation_and_stopwords_removed(self):
        spam_emails = [
            "The quick brown fox!!!",
            "A quick brown dog..."
        ]
        top_words = extract_top_spam_words(spam_emails, top_n=5)
        words = [w["word"] for w in top_words]
        self.assertIn("quick", words)
        self.assertIn("brown", words)
        self.assertNotIn("the", words)
        self.assertNotIn("a", words)


if __name__ == "__main__":
    unittest.main()

