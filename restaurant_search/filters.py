from bs4 import BeautifulSoup
from nltk.stem import WordNetLemmatizer
from django.conf import settings  # For Django settings access

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

def get_page_content(row):
    soup = BeautifulSoup(row["html"], 'html.parser')
    text = soup.get_text()  # Extract text from the HTML
    return text

def lemmatize_text(text):
    words = text.split()
    return ' '.join([lemmatizer.lemmatize(word) for word in words])

class Filter:
    def __init__(self, df):
        self.filtered = df.copy()

    def content_filter(self):
        # Apply text extraction and lemmatization
        self.filtered['lemmatized_content'] = self.filtered.apply(lambda row: lemmatize_text(get_page_content(row)), axis=1)

    def filter(self):
        self.content_filter()
        self.filtered = self.filtered.sort_values("rank", ascending=True)
        self.filtered["rank"] = self.filtered["rank"].round()
