from .utils import fetch_html

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