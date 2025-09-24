import re
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This function verifies the new features in the TaskPopup component.
    """
    # 1. Arrange: Go to the login page and log in.
    page.goto("http://localhost:5174/login", timeout=60000)
    page.wait_for_load_state()
    print(f"Page title: {page.title()}")
    page.screenshot(path="jules-scratch/verification/login_page.png")

    page.get_by_placeholder("Username").fill("admin")
    page.get_by_placeholder("Password").fill("admin")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the dashboard
    expect(page).to_have_url(re.compile(".*dashboard"), timeout=60000)

    # 2. Act: Navigate to the Tasks page and open the Add Task popup.
    page.get_by_role("link", name="Tasks").click()
    expect(page).to_have_url(re.compile(".*tasks"))
    page.get_by_role("button", name="Add Task").click()

    # 3. Assert: Check for the new features in the popup.
    # Check that the dialog is open
    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible()

    # Check for the date picker
    date_picker = dialog.locator('input[type="date"]')
    expect(date_picker).to_be_visible()

    # Check for the assigned_to dropdown
    assigned_to_dropdown = dialog.locator('//button[contains(.,"Assigned To")]')
    expect(assigned_to_dropdown).to_be_visible()

    # Check that the created_by field is not visible
    created_by_field = dialog.get_by_placeholder("Created By")
    expect(created_by_field).not_to_be_visible()

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/task_popup_verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
