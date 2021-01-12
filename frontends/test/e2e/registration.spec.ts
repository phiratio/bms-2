import { setup, teardown } from '../framework';
import { login } from '../framework/pages/login';
import { mockAdminUser, mockClient } from '../mocks/users';
import { urlContains } from '../framework/helpers';
import { RegistrationPage } from '../framework/pages/registration';

describe('Testing user profile page', () => {
  let driver;
  let regPage: RegistrationPage;

  beforeAll(async () => {
    driver = await setup();
    regPage = new RegistrationPage(driver);

    await login(driver, mockAdminUser.login, mockAdminUser.password);
    await urlContains(driver, 'profile');
    await regPage.visit();
  }, 30000);

  it('should verify that desired elements exist on the page', async () => {
    expect(await regPage.hasRegistrationForm()).toBe(true);
    expect(await regPage.hasFirstNameInput()).toBe(true);
    expect(await regPage.hasLastNameInput()).toBe(true);
    expect(await regPage.hasSubmitEmployees()).toBe(true);
  });

  it('should successfully fill first name and last name', async () => {
    await regPage.setFirstName(mockClient.firstName);
    await regPage.setLastName(mockClient.lastName);

    expect(await regPage.getFirstName()).toBe(mockClient.firstName);
    expect(await regPage.getLastName()).toBe(mockClient.lastName);
  });

  afterAll(async () => {
    await teardown(driver);
  }, 40000);
});
