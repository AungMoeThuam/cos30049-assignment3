import unittest
import tempfile
import os
import shutil
from email.header import decode_header, make_header
from app.utils import parse_eml


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


if __name__ == "__main__":
    unittest.main()
