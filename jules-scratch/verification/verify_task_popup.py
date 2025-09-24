import re
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This function verifies the new features in the TaskPopup component.
    """
    # 1. Arrange: Go to the login page and log in.
    page.goto("http://localhost:5175/login", timeout=60000)
    page.wait_for_load_state()

    page.get_by_placeholder("Username").fill("admin")
    page.get_by_placeholder("Password").fill("admin")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the dashboard
    expect(page).to_have_url(re.compile(".*dashboard"), timeout=60000)

    # 2. Act: Navigate to the Tasks page.
    page.get_by_role("link", name="Tasks").click()
    expect(page).to_have_url(re.compile(".*tasks"))

    # 3. Assert: Check the "Assigned To" column in the table.
    # We can't check the exact username, but we can check it's not a number.
    # This is a weak check, but it's better than nothing.
    first_assigned_to_cell = page.locator('.MuiDataGrid-cell[data-field="assigned_to_username"]').first
    expect(first_assigned_to_cell).not_to_have_text(re.compile(r"^\d+$"))

    # 4. Act: Open the Add Task popup.
    page.get_by_role("button", name="Add Task").click()
    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible()

    # 5. Assert: Check the "Assigned To" dropdown for duplicates.
    assigned_to_dropdown = dialog.locator('//button[contains(.,"Assigned To")]')
    assigned_to_dropdown.click()

    # Check that "Self Assign" is present.
    expect(page.get_by_role("option", name="Self Assign")).to_be_visible()

    # Check that "admin" is not present (since it's the current user).
    expect(page.get_by_role("option", name="admin")).not_to_be_visible()

    # 6. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/final_verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
