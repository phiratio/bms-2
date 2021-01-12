import {
  getElementById,
  getElementsByClassName,
  getElementsById,
  getInputValueByName,
  setInputValueByName,
} from '../helpers';
import { By, ThenableWebDriver, WebElement } from 'selenium-webdriver';
import { goTo } from '../index';

export class ProfilePage {
  driver: ThenableWebDriver;

  constructor(driver: ThenableWebDriver) {
    this.driver = driver;
  }

  async visit(): Promise<void> {
    return goTo(this.driver, '/profile');
  }

  /**
   * Returns Profile Form Web Element
   */
  profileForm(): Promise<WebElement> {
    return getElementById(this.driver, 'profileForm');
  }

  /**
   * Checks if Profile Form present
   */
  async hasProfileForm(): Promise<boolean> {
    return !!(await getElementsById(this.driver, 'profileForm')).length;
  }

  /**
   * Returns Change Password Form WebElement
   */
  changePasswordForm(): Promise<WebElement> {
    return getElementById(this.driver, 'changePasswordForm');
  }

  /**
   * Checks if Password Form present
   */
  async hasChangePasswordForm(): Promise<boolean> {
    return !!(await getElementsById(this.driver, 'changePasswordForm')).length;
  }

  /**
   * Returns Profile Container
   */
  profileContainer(): Promise<WebElement> {
    return getElementById(this.driver, 'profileContainer');
  }

  /**
   * Checks if Profile container present
   */
  async hasProfileContainer(): Promise<boolean> {
    return !!(await getElementsById(this.driver, 'profileContainer')).length;
  }

  /**
   * Returns profile avatar
   */
  async avatar(): Promise<WebElement> {
    const profileContainer = await this.profileContainer();
    return profileContainer.findElement(By.className('sb-avatar'));
  }

  /**
   * Checks if Profile container present
   */
  async hasAvatar(): Promise<boolean> {
    return !!(await getElementsByClassName(this.driver, 'sb-avatar')).length;
  }

  /**
   * Sets First Name input value
   * @param value
   */
  async setFirstName(value: string): Promise<void> {
    return setInputValueByName(this.driver, 'firstName', value);
  }

  /**
   * Gets First Name input value
   */
  async getFirstName(): Promise<string> {
    return getInputValueByName(this.driver, 'firstName');
  }

  /**
   * Sets Last Name name
   * @param value
   */
  async setLastName(value: string): Promise<void> {
    return setInputValueByName(this.driver, 'lastName', value);
  }

  /**
   * Gets Last Name input value
   */
  async getLastName(): Promise<string> {
    return getInputValueByName(this.driver, 'lastName');
  }

  /**
   * Sets Username input value
   * @param value
   */
  async setUsername(value: string): Promise<void> {
    return setInputValueByName(this.driver, 'username', value);
  }

  /**
   * Gets Username input value
   */
  async getUsername(): Promise<string> {
    return getInputValueByName(this.driver, 'username');
  }

  /**
   * Submits profile information
   */
  async submit(): Promise<void> {
    const saveButton = await getElementById(this.driver, 'profileFormSave');
    await saveButton.click();
    await this.driver.manage().setTimeouts({ implicit: 3000 });
  }
}
