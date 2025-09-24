import re
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This function verifies the new role-based permissions for tasks.
    """
    # 1. Test as a regular user (non-admin)
    page.goto("http://localhost:5176/login", timeout=60000)
    page.wait_for_load_state()

    # Assuming a regular user exists with username 'user' and password 'password'
    # This will fail if the user doesn't exist.
    # To make this test more robust, we could create a user first via the API.
    # For now, we'll assume the user exists.
    page.get_by_placeholder("Username").fill("user")
    page.get_by_placeholder("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the dashboard
    expect(page).to_have_url(re.compile(".*dashboard"), timeout=60000)

    # Navigate to the Tasks page
    page.get_by_role("link", name="Tasks").click()
    expect(page).to_have_url(re.compile(".*tasks"))

    # Open the first task for editing
    page.locator('.MuiDataGrid-cell[data-field="actions"] button').first.click()
    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible()

    # Assert that only the status field is enabled
    expect(dialog.get_by_placeholder("Title")).to_be_disabled()
    expect(dialog.get_by_placeholder("Description")).to_be_disabled()
    expect(dialog.locator('input[type="date"]')).to_be_disabled()
    expect(dialog.get_by_role("combobox", name="Priority")).to_be_disabled()
    expect(dialog.get_by_role("combobox", name="Assigned To")).to_be_disabled()

    # Status should be enabled
    expect(dialog.get_by_role("combobox", name="Status")).to_be_enabled()

    # Close the dialog
    dialog.get_by_role("button", name="Cancel").click()
    expect(dialog).not_to_be_visible()

    # Log out
    page.get_by_role("button", name="Logout").click()
    expect(page).to_have_url(re.compile(".*login"))


    # 2. Test as an admin user
    page.get_by_placeholder("Username").fill("admin")
    page.get_by_placeholder("Password").fill("admin")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the dashboard
    expect(page).to_have_url(re.compile(".*dashboard"), timeout=60000)

    # Navigate to the Tasks page
    page.get_by_role("link", name="Tasks").click()
    expect(page).to_have_url(re.compile(".*tasks"))

    # Check for delete icon
    delete_button = page.locator('[data-testid="DeleteIcon"]').first
    expect(delete_button).to_be_visible()

    # Open the first task for editing
    page.locator('.MuiDataGrid-cell[data-field="actions"] button').first.click()
    expect(dialog).to_be_visible()

    # Assert that all fields are enabled for admin
    expect(dialog.get_by_placeholder("Title")).to_be_enabled()
    expect(dialog.get_by_placeholder("Description")).to_be_enabled()
    expect(dialog.locator('input[type="date"]')).to_be_enabled()
    expect(dialog.get_by_role("combobox", name="Status")).to_be_enabled()
    expect(dialog.get_by_role("combobox", name="Priority")).to_be_enabled()
    expect(dialog.get_by_role("combobox", name="Assigned To")).to_be_enabled()

    # Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/admin_edit_task_popup.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
