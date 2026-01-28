import asyncio
from playwright.async_api import async_playwright
import subprocess
import time
import requests

async def main():
    server_process = subprocess.Popen(["python3", "-m", "http.server", "8001"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        messages = []
        page.on("console", lambda msg: messages.append(msg.text))

        try:
            await page.goto("http://localhost:8001/test_error_propagation.html")
            await page.wait_for_timeout(1000)
            print("Console logs:")
            for m in messages:
                print(m)
        finally:
            server_process.terminate()
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
