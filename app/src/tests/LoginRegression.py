from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import chromedriver_autoinstaller


chromedriver_autoinstaller.install()
driver = webdriver.Chrome()

# Open the login page
driver.get("http://localhost:3000/login")
time.sleep(3)

def test_valid_login():
    email_field = driver.find_element(By.CSS_SELECTOR, "#\:r0\:")
    password_field = driver.find_element(By.CSS_SELECTOR, "#\:r1\:")
    login_button = driver.find_element(By.CSS_SELECTOR, "#root > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation3.css-1rjt7a6-MuiPaper-root > form > button")

    email_field.clear()
    password_field.clear()
    
    email_field.send_keys("test2@gmail.com")  # Replace with valid credentials
    password_field.send_keys("test123")    # Replace with valid credentials
    login_button.click()
    
    time.sleep(2)
    
    assert "/home" in driver.current_url, "Login failed"
    logout_button = driver.find_element(By.CSS_SELECTOR, "#root > div > header > div > div.MuiBox-root.css-j0ozid > button:nth-child(3)")
    logout_button.click()
    time.sleep(2)
# Test 2: Invalid Login
def test_invalid_login():
    driver.get("http://localhost:3000/login")
    time.sleep(3)
    email_field = driver.find_element(By.CSS_SELECTOR, "#\:r0\:")
    password_field = driver.find_element(By.CSS_SELECTOR, "#\:r1\:")
    login_button = driver.find_element(By.CSS_SELECTOR, "#root > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation3.css-1rjt7a6-MuiPaper-root > form > button")


    email_field.clear()
    password_field.clear()

    email_field.send_keys("invalid@example.com")
    password_field.send_keys("wrongpassword")
    login_button.click()

    time.sleep(2)

    error_message = driver.find_element(By.CSS_SELECTOR, "#root > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation3.css-1rjt7a6-MuiPaper-root > div > div.MuiAlert-message.css-zioonp-MuiAlert-message")
    assert "Error" in error_message.text, "Error message not displayed for invalid login"

# Test 3: Password Reset
def test_password_reset():
    driver.get("http://localhost:3000/login")
    time.sleep(3)
    email_field = driver.find_element(By.CSS_SELECTOR, "#\:r0\:")
    forgot_password_text = driver.find_element(By.CSS_SELECTOR, "#root > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation3.css-1rjt7a6-MuiPaper-root > form > span")
    email_field.send_keys("testuser@example.com")
    forgot_password_text.click()
    time.sleep(2)
    success_message = driver.find_element(By.CSS_SELECTOR, "#root > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation3.css-1rjt7a6-MuiPaper-root > div > div.MuiAlert-message.css-zioonp-MuiAlert-message")
    assert "password reset email" in success_message.text.lower(), "Password reset message not displayed"
test_valid_login()
test_invalid_login()
test_password_reset()

driver.quit()
