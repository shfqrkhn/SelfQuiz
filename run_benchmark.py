import asyncio
import os
import subprocess
import time
import requests
from playwright.async_api import async_playwright

async def run_benchmark():
    # Start python http server in background
    server_process = subprocess.Popen(["python3", "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Wait for server to be up
    for _ in range(10):
        try:
            requests.get("http://localhost:8000")
            break
        except:
            time.sleep(0.5)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()

            # Go to benchmark page
            await page.goto("http://localhost:8000/benchmark.html")

            # Wait for results to be populated
            await page.wait_for_function("document.getElementById('results').textContent.length > 0")

            # Wait a bit more for all tests to finish (since they run sequentially)
            # The script updates results array and writes to textContent at the end.
            # But wait, my script updates textContent at the very end.
            # So waiting for textContent > 0 is enough.

            results = await page.eval_on_selector("#results", "el => el.textContent")
            print(results)

            await browser.close()
    finally:
        server_process.terminate()

if __name__ == "__main__":
    asyncio.run(run_benchmark())
