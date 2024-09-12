from bs4 import BeautifulSoup
from urllib.parse import urlparse
from settings import *

def get_page_content(row):
    soup = BeautifulSoup(row["html"])
    text = soup_get_text()
    return text

class Filter():
    def __init__(self, results):
        self.filered = results.copy()

    def content_filter(self):
        page_content = self.filtered.apply(get_page_content, axis=1)
        word_count = page_content.apply(lambda x: lem(x.split(" ")))
        word_count /= word_count.median()


    def filter(self):
        self.content_filter()
        self.filtered - self.filtered.sort_values("rank", ascending=True)
        self.filtered["rank"] = self.filtered["rank"].round()