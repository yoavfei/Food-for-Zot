from .utils import fetch_html
import requests
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os

load_dotenv()
API_BASE = "https://openpricengine.com/api/v1/stores/products/names/plan"
API_KEY = os.getenv('OPEN_PRICE_API_KEY')
USA_STORES = ['traderjoes', 'aldi', 'tj']


def get_food_prices(product_name, currency="Default"):
    url = 'https://openpricengine.com/api/v1/multiple_stores/prices/query'
    headers = {
        'accept': 'application/json',
        'Authorization': API_KEY
    }
    
    results = {}

    for store in USA_STORES:
        params = {
            'stores': [store],
            'productname': product_name,
            'start_date': '2025-11-05',
            'end_date': '2025-11-06',
            'currency': currency
        }

        response = requests.get(url, headers=headers, params=params)
        data = response.json()

        if data:
            results[store] = data[:3]

    return results




def get_walmart_prices(item: str):
    query = item.replace(" ", "+")
    url = f"https://www.walmart.com/search?q={query}"

    soup = fetch_html(url)
    results = []

    for product in soup.select("div.mb1"):
        title = product.select_one("a.w_iUH7").get_text(strip=True) if product.select_one("a.w_iUH7") else None
        price = product.select_one("span.price-group")
        price_text = price.get_text(strip=True) if price else None

        if title and price_text:
            results.append({"name": title, "price": price_text})

        if len(results) >= 5:
            break

    return results


def get_target_prices(item: str):
    query = item.replace(" ", "+")
    url = f"https://www.target.com/s?searchTerm={query}"

    soup = fetch_html(url)
    results = []

    for product in soup.select("div[data-test='product-title']"):
        title = product.get_text(strip=True)
        price_el = soup.select_one("span[data-test='current-price']")
        price_text = price_el.get_text(strip=True) if price_el else None

        if title and price_text:
            results.append({"name": title, "price": price_text})

        if len(results) >= 5:
            break

    return results


def get_kroger_prices(item: str):
    query = item.replace(" ", "-")
    url = f"https://www.kroger.com/search?query={query}"
    soup = fetch_html(url)
    results = []

    for product in soup.select("div.AutoGrid-cell"):
        title = product.select_one("h3.ProductName").get_text(strip=True) if product.select_one("h3.ProductName") else None
        price_el = product.select_one("data[data-qa='ProductPrice']")
        price = price_el.get_text(strip=True) if price_el else None

        if title and price:
            results.append({"name": title, "price": price})

        if len(results) >= 5:
            break

    return results


