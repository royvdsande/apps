from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:8000")

    # Wait for the search input to be visible
    page.wait_for_selector(".search input")

    # Take a screenshot of the search area
    search_area = page.locator(".apps-bar")
    search_area.screenshot(path="verification/search_hint.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
