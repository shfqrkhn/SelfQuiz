from playwright.sync_api import sync_playwright, expect
import sys
import json

def verify_review_ux(page):
    # Mock data
    def handle_route(route):
        route.fulfill(
            status=200,
            content_type='application/json',
            body=json.dumps({
                "topic": "UX Test",
                "questions": [
                    {
                        "questionText": "Q1",
                        "choices": ["A (Correct)", "B (Wrong)"],
                        "correctAnswer": 0,
                        "explanation": "Exp"
                    }
                ]
            })
        )

    page.route('**/*.json', handle_route)

    # --- CASE A: Correct Answer ---
    print("Testing Case A: Correct Answer...")
    page.goto('http://localhost:8000/index.html')
    page.locator('#questionBankSelect').select_option(index=1)
    page.click('#startFromSelectBtn')
    expect(page.locator('#questionTextLabel')).to_have_text('Q1')

    page.on("dialog", lambda dialog: dialog.accept())

    # Click Correct (index 0)
    page.click('button[data-index="0"]')
    page.click('#finishQuizBtn')
    page.click('#reviewBtn')

    review_container = page.locator('#reviewQuestionsContainer')
    if review_container.locator('p', has_text="Correct answer:").count() > 0:
        print("FAIL: 'Correct answer:' displayed for correct answer (Redundant).")
        case_a_passed = False
    else:
        print("PASS: 'Correct answer:' hidden for correct answer.")
        case_a_passed = True

    page.screenshot(path='/home/jules/verification/review_case_a_correct.png')

    # --- CASE B: Incorrect Answer ---
    print("Testing Case B: Incorrect Answer...")
    page.click('#restartQuizBtnReview')

    page.locator('#questionBankSelect').select_option(index=1)
    page.click('#startFromSelectBtn')

    # Incorrect Answer (index 1)
    page.click('button[data-index="1"]')
    page.click('#finishQuizBtn')
    page.click('#reviewBtn')

    correct_p = review_container.locator('p', has_text="Correct answer:")
    if correct_p.count() == 0:
        print("FAIL: 'Correct answer:' missing for incorrect answer.")
        sys.exit(1)

    class_attr = correct_p.get_attribute("class")
    print(f"DEBUG: Class attribute seen: '{class_attr}'")

    if "text-success" in class_attr:
        print("PASS: Correct answer has 'text-success' class.")
        case_b_passed = True
    else:
        print(f"FAIL: Correct answer has class '{class_attr}' (Expected 'text-success').")
        case_b_passed = False

    page.screenshot(path='/home/jules/verification/review_case_b_incorrect.png')

    if not case_a_passed or not case_b_passed:
        print("OVERALL FAILURE")
        sys.exit(1)
    else:
        print("OVERALL SUCCESS")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_review_ux(page)
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)
        finally:
            browser.close()
