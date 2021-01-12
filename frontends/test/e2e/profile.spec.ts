import { setup, teardown } from '../framework';
import { login } from '../framework/pages/login';
import { urlContains } from '../framework/helpers';
import { mockAdminUser, mockUserProfile } from '../mocks/users';
import { ProfilePage } from '../framework/pages/profile';

describe('Testing user profile page', () => {
  let driver;
  let profilePage: ProfilePage;

  beforeAll(async () => {
    driver = await setup();
    profilePage = new ProfilePage(driver);

    await login(driver, mockAdminUser.login, mockAdminUser.password);
    await urlContains(driver, 'profile');
  }, 30000);

  afterAll(async () => {
    await teardown(driver);
  }, 40000);

  it('should verify that desired elements exist on the page', async () => {
    expect(await profilePage.hasProfileContainer()).toBe(true);
    expect(await profilePage.hasAvatar()).toBe(true);
    expect(await profilePage.hasProfileForm()).toBe(true);
    expect(await profilePage.hasChangePasswordForm()).toBe(true);
  });

  it('should successfully set user profile information', async () => {
    await profilePage.setFirstName(mockUserProfile.firstName);
    await profilePage.setLastName(mockUserProfile.lastName);
    await profilePage.setUsername(mockUserProfile.username);

    expect(await profilePage.getFirstName()).toBe(mockUserProfile.firstName);
    expect(await profilePage.getLastName()).toBe(mockUserProfile.lastName);
    expect(await profilePage.getUsername()).toBe(mockUserProfile.username);
  });

  it('should set user profile information and submit data', async () => {
    await profilePage.setFirstName(mockUserProfile.firstName);
    await profilePage.setLastName(mockUserProfile.lastName);
    await profilePage.setUsername(mockUserProfile.username);
    await profilePage.submit();

    await driver.navigate().refresh();
    // verify form after refresh
    expect(await profilePage.getFirstName()).toBe(mockUserProfile.firstName);
    expect(await profilePage.getLastName()).toBe(mockUserProfile.lastName);
    expect(await profilePage.getUsername()).toBe(mockUserProfile.username);
  });
});
