const { until } = require('selenium-webdriver');
const { setup, teardown, login, goTo } = require('./framework');
const adminuser = require('./mocks/adminUser');
const { registrationPage } = require('./framework');

const location = process.env.FRONTEND_ADMIN_URL;

describe('Testing registration page', () => {
  let driver;

  beforeAll(async () => {
    driver = await setup();
    await login(driver, location, adminuser.login, adminuser.password);
    await driver.wait(until.urlContains('profile'));
    await goTo(driver, `${location}/registration`);
  }, 30000);

  afterAll(async () => {
    await teardown(driver);
  }, 40000);

  it('should verify that desired elements exist on the page', async () => {
    const page = registrationPage(driver);
    const initialElements = await page.checkInitialElements();

    expect(initialElements.hasRegistrationForm).toBe(true);
    expect(initialElements.hasFirstNameInput).toBe(true);
    expect(initialElements.hasLastNameInput).toBe(true);
    expect(initialElements.hasSubmitButtonToSelectEmployees).toBe(true);
  });

  it('should fill in first name and list name', async () => {
    const page = registrationPage(driver);
    const demoClient = {
      firstName: 'Demo',
      lastName: 'Demo',
    };
    await page.setFirstName(demoClient.firstName);
    await page.setLastName(demoClient.lastName);

    expect(await page.getFirstName()).toBe(demoClient.firstName);
    expect(await page.getLastName()).toBe(demoClient.lastName);
  });

  // WIP
});
