from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

# Setup WebDriver with automatic ChromeDriver installation
chrome_options = Options()
# Use these options if you want the browser to be visible
# chrome_options.add_argument("--headless")  # Uncomment to run tests without showing browser
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
wait = WebDriverWait(driver, 10)

# Base URL - Adjust to your local server
base_url = "http://localhost:5173"  # Update with your frontend URL

def setup():
    print("Starting test suite for EduApp...")
    driver.maximize_window()

def teardown():
    print("Finishing test suite...")
    driver.quit()

def test_user_registration():
    """Test user registration functionality"""
    print("\n🧪 Testing User Registration...")
    
    try:
        # Navigate to register page
        driver.get(f"{base_url}/register")
        
        # Wait for form to load
        username_field = wait.until(EC.presence_of_element_located((By.ID, "username")))
        
        # Generate a unique email
        test_email = f"test{int(time.time())}@example.com"
        
        # Fill out form
        username_field.send_keys("Test User")
        driver.find_element(By.ID, "email").send_keys(test_email)
        driver.find_element(By.ID, "phone").send_keys("1234567890")
        driver.find_element(By.ID, "password").send_keys("Test1234")
        driver.find_element(By.ID, "confirmPassword").send_keys("Test1234")
        
        # Submit form
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        # Check for success message
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//div[contains(text(), 'Registration successful')]")
        ))
        print("✅ User registration successful!")
        return test_email
    except Exception as e:
        print(f"❌ User registration failed: {e}")
        raise

def test_user_login(email="admin@gmail.com", password="abc123"):
    """Test user login functionality"""
    print("\n🧪 Testing User Login...")
    
    try:
        # Navigate to login page
        driver.get(f"{base_url}/login")
        
        # Wait for form to load
        email_field = wait.until(EC.presence_of_element_located((By.ID, "email")))
        
        # Fill out form
        email_field.send_keys(email)
        driver.find_element(By.ID, "password").send_keys(password)
        
        # Submit form
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        # Wait for redirect (to any dashboard)
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Dashboard')]")))
        print("✅ User login successful!")
    except Exception as e:
        print(f"❌ User login failed: {e}")
        raise

def test_admin_course_creation():
    """Test course creation as admin"""
    print("\n🧪 Testing Course Creation...")
    
    try:
        # First login as admin
        test_user_login("admin@gmail.com", "abc123")
        
        # Navigate to course creation page
        driver.get(f"{base_url}/admin/courses/new")
        
        # Wait for form to load
        title_field = wait.until(EC.presence_of_element_located((By.ID, "title")))
        
        # Generate unique course title
        course_title = f"Selenium Test Course {int(time.time())}"
        
        # Fill out form
        title_field.send_keys(course_title)
        driver.find_element(By.ID, "description").send_keys("This is an automated test course created with Selenium")
        
        # Select category from dropdown
        driver.find_element(By.ID, "category").click()
        wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(text(), 'Programming')]"))).click()
        
        # Select level from dropdown
        driver.find_element(By.ID, "level").click()
        wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(text(), 'Beginner')]"))).click()
        
        # Set status to published
        driver.find_element(By.ID, "published").click()
        
        # Submit form
        driver.find_element(By.XPATH, "//button[contains(text(), 'Create Course')]").click()
        
        # Check for success message
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//div[contains(text(), 'Course created successfully')]")
        ))
        print(f"✅ Course '{course_title}' created successfully!")
        return course_title
    except Exception as e:
        print(f"❌ Course creation failed: {e}")
        raise

def test_course_browsing():
    """Test course browsing functionality"""
    print("\n🧪 Testing Course Browsing...")
    
    try:
        # Navigate to courses page
        driver.get(f"{base_url}/courses")
        
        # Wait for courses to load
        wait.until(EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'grid')]")))
        
        # Count courses
        courses = driver.find_elements(By.XPATH, "//div[contains(@class, 'bg-gray-100')]")
        
        print(f"✅ Found {len(courses)} courses on the browse page")
    except Exception as e:
        print(f"❌ Course browsing failed: {e}")
        raise

def test_student_enrollment():
    """Test student enrollment in a course"""
    print("\n🧪 Testing Course Enrollment...")
    
    try:
        # First create a student account (or login if you already have one)
        student_email = "student@example.com"
        student_password = "Test1234"
        
        # Try to register, if fails, then login
        try:
            # First logout if logged in
            driver.get(f"{base_url}/logout")
            time.sleep(1)
            
            driver.get(f"{base_url}/register")
            username_field = wait.until(EC.presence_of_element_located((By.ID, "username")))
            username_field.send_keys("Test Student")
            driver.find_element(By.ID, "email").send_keys(student_email)
            driver.find_element(By.ID, "phone").send_keys("9876543210")
            driver.find_element(By.ID, "password").send_keys(student_password)
            driver.find_element(By.ID, "confirmPassword").send_keys(student_password)
            driver.find_element(By.XPATH, "//button[@type='submit']").click()
        except:
            # If registration fails, login
            test_user_login(student_email, student_password)
        
        # Go to courses page
        driver.get(f"{base_url}/courses")
        
        # Wait for courses to load
        wait.until(EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'grid')]")))
        
        # Click on the first course
        driver.find_element(By.XPATH, "//div[contains(@class, 'bg-gray-100')][1]").click()
        
        # Wait for course detail page
        enroll_button = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(), 'Enroll') or contains(text(), 'Continue Learning')]")
        ))
        
        # If it says "Enroll", click it
        if "Enroll" in enroll_button.text:
            enroll_button.click()
            
            # Wait for success message or redirect
            time.sleep(2)
            print("✅ Successfully enrolled in course!")
        else:
            print("✅ Already enrolled in course")
    except Exception as e:
        print(f"❌ Course enrollment failed: {e}")
        raise

if __name__ == "__main__":
    try:
        setup()
        # Uncomment tests you want to run
        test_user_login()
        test_admin_course_creation()
        test_course_browsing()
        test_student_enrollment()
        teardown()
        print("\n✅ All tests completed successfully!")
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {e}")
        driver.quit()