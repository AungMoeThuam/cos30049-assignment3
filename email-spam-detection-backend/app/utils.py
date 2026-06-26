"""Feature extraction utilities for email spam detection."""

import string
import numpy as np
import pandas as pd
import emoji
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

from html import unescape
import re
from html.parser import HTMLParser

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Run once to download required NLTK data
nltk.download("stopwords")
nltk.download("wordnet")

NUM_COLS = [
    "num_urls", "num_exclamation", "num_question", "num_dollar",
    "num_all_caps", "num_numbers", "word_count", "capital_ratio",
    "emoji_count"
]

"""Text preprocessing utilities for email spam detection."""

class TextPreprocessor:
    def __init__(self, text=""):
        self.text = text

    def strip_html_tags(self):
        self.text = re.sub(r"<[^>]+>", "", self.text)
        return self

    def replace_phone_numbers(self):
        phone_re = r"\+?[\d]{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}"
        self.text = re.sub(phone_re, " [PhoneNumber] ", self.text)
        return self

    def replace_urls(self):
        self.text = re.sub(r"http[s]?://\S+", " [URL] ", self.text)
        return self

    def normalize_whitespace(self):
        self.text = re.sub(r"\s+", " ", self.text).strip()
        return self

    def to_lowercase(self):
        self.text = self.text.lower()
        return self

    def remove_special_characters(self):
        self.text = re.sub(r"[:?,.*]", "", self.text)
        return self

    def replace_emojis(self):
        self.text = re.sub(
            r":([a-z0-9_]+):",
            lambda m: "[" + "".join(w.capitalize() for w in m.group(1).split("_")) + "EMOJI]",
            emoji.demojize(self.text),
        )
        return self

    def replace_emails(self):
        email_re = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        self.text = re.sub(email_re, " [EMAIL] ", self.text)
        return self

    def replace_percentages(self):
        self.text = re.sub(r"\b\d+(?:\.\d+)?\s?%", " [PERCENTAGE] ", self.text)
        return self

    def replace_numbers(self):
        self.text = re.sub(r"\b\d+\b", " [NUMBER] ", self.text)
        return self

    def remove_stopwords(self):
        stop_words = set(stopwords.words("english"))
        # Preserve custom tokens like [URL], [EMAIL], etc.
        tokens = self.text.split()
        self.text = " ".join(w for w in tokens if w.lower() not in stop_words or w.startswith("["))
        return self

    def lemmatize(self):
        lemmatizer = WordNetLemmatizer()
        tokens = self.text.split()
        self.text = " ".join(lemmatizer.lemmatize(w) for w in tokens)
        return self

    def get_text(self):
        return self.text


class HTMLTextExtractor(HTMLParser):
    """Strip HTML tags, skip style/script blocks, extract visible text only."""

    def __init__(self):
        super().__init__()
        self.text_parts = []
        self._skip = False

    def handle_starttag(self, tag, attrs):
        if tag.lower() in ("style", "script"):
            self._skip = True

    def handle_endtag(self, tag):
        if tag.lower() in ("style", "script"):
            self._skip = False

    def handle_data(self, data):
        if self._skip:
            return
        stripped = data.strip()
        if stripped:
            self.text_parts.append(stripped)

    def get_text(self):
        return " ".join(self.text_parts)


def parse_eml(filepath):
    """Parse .eml email file and extract subject and body.

    Args:
        filepath: Path to .eml file

    Returns:
        tuple: (subject, body)
    """
    import email
    from email.header import decode_header, make_header

    with open(filepath, "rb") as f:
        msg = email.message_from_bytes(f.read())

    subject_header = msg.get("Subject", "")
    if subject_header:
        try:
            subject = str(make_header(decode_header(subject_header)))
        except Exception:
            subject = str(subject_header)
    else:
        subject = ""

    plain_body = ""
    html_body = ""

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            payload = part.get_payload(decode=True)
            if not payload:
                continue
            decoded = payload.decode("utf-8", errors="ignore")
            if content_type == "text/plain" and not plain_body:
                plain_body = decoded
            elif content_type == "text/html" and not html_body:
                html_body = decoded
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            content_type = msg.get_content_type()
            decoded = payload.decode("utf-8", errors="ignore")
            if content_type == "text/html":
                html_body = decoded
            else:
                plain_body = decoded

    if html_body.strip():
        extractor = HTMLTextExtractor()
        extractor.feed(html_body)
        body = extractor.get_text()
    elif plain_body.strip():
        body = plain_body
    else:
        body = ""

    body = re.sub(r"\s+", " ", body).strip()
    return subject, body


def prepare_email_text(subject, body):
    """Combine subject and body for model prediction.

    Args:
        subject: Email subject
        body: Email body

    Returns:
        Combined text string ready for prediction
    """
    eml_text = str(subject) + " " + str(body)
    eml_text = re.sub(r"\s+", " ", eml_text).strip()
    return eml_text


def clean_text(text):
    """Full preprocessing pipeline for a single text string.

    Args:
        text: The raw text string.

    Returns:
        The cleaned text string.
    """
    if not isinstance(text, str):
        text = str(text)
    tp = TextPreprocessor(text)
    return (
        tp.strip_html_tags()
        .replace_urls()
        .replace_emails()
        .replace_phone_numbers()
        .replace_numbers()
        .replace_percentages()
        .replace_emojis()
        .remove_special_characters()
        .normalize_whitespace()
        .to_lowercase()
        .get_text()
    )


def clean_db_text(text):
    """Clean email text with bracket removal and additional URL normalization."""
    tp = TextPreprocessor(text)
    tp.strip_html_tags()
    tp.text = re.sub(r'[\[\]]', ' ', tp.text)
    tp.text = re.sub(r'http\S+|www\.\S+', ' [URL] ', tp.text)
    tp.replace_emails()
    tp.replace_phone_numbers()
    tp.replace_numbers()
    tp.replace_percentages()
    tp.replace_emojis()
    tp.remove_special_characters()
    tp.normalize_whitespace()
    tp.to_lowercase()
    tp.text = unescape(tp.text)
    tp.text = re.sub(r'=[0-9a-fA-F]{2,}', ' ', tp.text)  # hex only
    tp.text = re.sub(r'\b[a-z0-9]{15,}\b', ' ', tp.text)  # only very long random strings
    tp.normalize_whitespace()
    return tp.get_text()


def process_text_advanced(text):
    """Apply stemming, stopword removal, punctuation filtering, and whitespace normalization."""
    import string
    from nltk.stem import PorterStemmer
    ps = PorterStemmer()
    stop_words = set(stopwords.words("english"))
    tokens = text.split()
    tokens = [
        ps.stem(t) for t in tokens
        if t.lower() not in stop_words and t not in string.punctuation
    ]
    result = " ".join(tokens)
    result = re.sub(r'[(),;]', ' ', result)
    result = re.sub(r'\s+', ' ', result).strip()
    return result


def extract_features(email):
    """Extract numeric features and preprocessed text from a Series of raw emails."""
    db = pd.DataFrame()
    db["num_urls"]        = email.str.findall(r'https?://\S+|www\.\S+').str.len()
    db["num_exclamation"] = email.str.count(r'!')
    db["num_question"]    = email.str.count(r'\?')
    db["num_dollar"]      = email.str.count(r'\$')
    db["num_all_caps"]    = email.str.findall(r'\b[A-Z]{2,}\b').str.len()
    db["num_numbers"]     = email.str.findall(r'\d+').str.len()
    db["word_count"]      = email.str.split().str.len()
    caps   = email.str.findall(r'[A-Z]').str.len()
    letters = email.str.findall(r'[A-Za-z]').str.len()
    db["capital_ratio"]   = np.where(letters > 0, caps / letters, 0)
    db["emoji_count"]     = email.apply(emoji.emoji_count)
    db["text"] = email.apply(clean_db_text)
    db["text"] = db["text"].apply(process_text_advanced)
    return db


def extract_features_for_text(text: str) -> pd.DataFrame:
    """Wrapper to extract features from a single raw text string.

    Args:
        text: The raw email text or split sentence.

    Returns:
        pd.DataFrame: A DataFrame containing the preprocessed text and the 9 NUM_COLS fields.
    """
    if not isinstance(text, str):
        text = str(text)
    series = pd.Series([text])
    return extract_features(series)


def parse_csv_emails(file_content: bytes) -> list[dict]:
    """Parse CSV content and extract subject and body fields.

    Args:
        file_content: The raw bytes of the uploaded CSV file.

    Returns:
        list[dict]: A list of dicts with keys 'subject' and 'body'.

    Raises:
        ValueError: If 'body' column is missing or if the CSV is malformed.
    """
    import csv
    import io

    try:
        decoded_content = file_content.decode("utf-8-sig", errors="ignore")
    except Exception as e:
        raise ValueError(f"Failed to decode CSV file: {str(e)}")

    csv_reader = csv.DictReader(io.StringIO(decoded_content))
    
    # Check if header exists
    if not csv_reader.fieldnames:
        raise ValueError("CSV file is empty or has no header row.")
        
    # Standardize column names to lowercase to be case-insensitive
    fieldnames_lower = [field.lower().strip() for field in csv_reader.fieldnames]
    
    # Verify body column is present
    if "body" not in fieldnames_lower:
        raise ValueError("CSV file is missing the required 'body' column.")
        
    # Create mapping of original field names to lowercase names
    field_map = {field.lower().strip(): field for field in csv_reader.fieldnames}
    body_field = field_map["body"]
    subject_field = field_map.get("subject")

    emails = []
    for row in csv_reader:
        body_val = row.get(body_field)
        body_val = body_val.strip() if body_val else ""
        
        # Skip empty rows (where body is blank)
        if not body_val:
            continue
            
        subject_val = ""
        if subject_field:
            subj = row.get(subject_field)
            subject_val = subj.strip() if subj else ""

        emails.append({
            "subject": subject_val,
            "body": body_val
        })
        
    return emails


def extract_top_spam_words(spam_texts: list[str], top_n: int = 10) -> list[dict]:
    """Extract top N spam trigger words and their occurrence percentage/count.

    Args:
        spam_texts: A list of email body texts that were classified as spam.
        top_n: Number of top words to return (default: 10).

    Returns:
        list[dict]: List of dicts containing 'word', 'percentage', and 'count'.
                    Sorted by count/percentage in descending order.
    """
    from collections import Counter
    import string

    if not spam_texts:
        return []

    stop_words = set(stopwords.words("english"))
    total_spam_emails = len(spam_texts)
    word_document_counts = Counter()

    for text in spam_texts:
        if not isinstance(text, str):
            text = str(text)
        
        # Lowercase and replace punctuation with space (to separate words)
        cleaned_text = text.lower()
        translation_table = str.maketrans(string.punctuation, " " * len(string.punctuation))
        cleaned_text = cleaned_text.translate(translation_table)
        
        # Split into words
        words = cleaned_text.split()
        
        # Filter out stopwords, numbers, and short tokens, and keep unique words per email
        unique_words_in_email = set(
            word for word in words 
            if word not in stop_words 
            and not word.isdigit() 
            and len(word) > 1
        )
        
        for word in unique_words_in_email:
            word_document_counts[word] += 1

    # Sort by count descending, and by word alphabetically for tie-breaking
    sorted_words = sorted(
        word_document_counts.items(),
        key=lambda item: (-item[1], item[0])
    )

    top_words = []
    for word, count in sorted_words[:top_n]:
        percentage = round((count / total_spam_emails) * 100, 1)
        top_words.append({
            "word": word,
            "percentage": percentage,
            "count": count
        })

    return top_words