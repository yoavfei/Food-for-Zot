from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
import time

def scrape_walmart_prices(search_query, max_results=10):
    """
    Scrape Walmart product prices using Selenium.

    Args:
        search_query (str): The search term (e.g., 'laptop').
        max_results (int): Maximum number of prices to scrape.

    Returns:
        List of prices as strings.
    """

    # Configure Chrome options
    options = Options()
    options.add_argument("--start-maximized")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.get("https://www.walmart.com")

    try:
        # Open Walmart search page
        query = search_query.replace(" ", "+")
        url = f"https://www.walmart.com/search/?query={query}"
        driver.get(url)

        # Wait for the page to load fully (adjust if needed)
        time.sleep(5)

        # Scroll down a bit to load more products
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight / 2);")
        time.sleep(2)

        # Find all price elements
        # Walmart uses 'span[data-tl-id="ProductPrice"]' for price spans
        price_elements = driver.find_elements(By.CSS_SELECTOR, "span[data-tl-id='ProductPrice']")
        print(price_elements)

        prices = []
        for elem in price_elements[:max_results]:
            price_text = elem.text.strip()
            if price_text:
                prices.append(price_text)

        return prices

    finally:
        driver.quit()


# Example usage
if __name__ == "__main__":
    results = scrape_walmart_prices("laptop", max_results=5)
    print("Prices found:", results)
