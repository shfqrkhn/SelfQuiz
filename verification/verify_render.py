from playwright.sync_api import sync_playwright, expect
import json

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Intercept fetch to return a mock question bank
        mock_data = {
            "topic": "Frontend Verification Quiz",
            "questions": [
                {
                    "questionText": "What is the capital of France?",
                    "choices": ["London", "Berlin", "Paris", "Madrid"],
                    "correctAnswer": 2,
                    "explanation": "Paris is the capital of France.",
                    "time": 60
                }
            ]
        }

        def handle_route(route):
            print(f"Intercepted: {route.request.url}")
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(mock_data)
            )

        page.route("**/*.json", handle_route)

        page.goto("http://localhost:8000/index.html")

        # Wait for the select to have options populated
        page.wait_for_function("document.getElementById('questionBankSelect').options.length > 1")

        # Select the second option (index 1)
        page.select_option("#questionBankSelect", index=1)

        page.click("#startFromSelectBtn")

        # Wait for quiz interface
        expect(page.locator("#quizInterface")).to_be_visible()
        expect(page.locator("#questionTextLabel")).to_have_text("What is the capital of France?")

        # Take screenshot
        page.screenshot(path="/home/jules/verification/verification.png")
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    run()
