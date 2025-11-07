import requests
from bs4 import BeautifulSoup

def fetch_html(url: str) -> BeautifulSoup:
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; GroceryScraper/1.0)"
    }
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")