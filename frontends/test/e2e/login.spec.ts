import { setup, teardown, getAlerts, getCookies, getTitle } from '../framework';

import { visitLoginPage, login } from '../framework/pages/login';
import * as MainLayout from '../framework/pages/mainLayout';
import { mockAdminUser } from '../mocks/users';
import { urlContains } from '../framework/helpers';

describe('Testing login page', () => {
  let driver;

  beforeAll(async () => {
    driver = await setup();
  }, 30000);

  afterAll(async () => {
    await teardown(driver);
  }, 40000);

  it('should open login page', async () => {
    await visitLoginPage(driver);
    expect(await getTitle(driver)).toEqual('Login');
  });

  it('should fail to login', async () => {
    await login(driver, 'wrong_login', 'wrong_password');
    const alerts = await getAlerts(driver, 'danger');
    expect(alerts.length).toBe(1);
  });

  it('should successfully login as admin using login and password', async () => {
    await login(driver, mockAdminUser.login, mockAdminUser.password);
    await urlContains(driver, 'profile');

    const appBody = await MainLayout.appBody(driver);

    expect(appBody.length).toBeGreaterThan(0);
    expect(await getTitle(driver)).toEqual('Profile');

    expect(getCookies().indexOf('token_id')).toBeTruthy();
  });
});
