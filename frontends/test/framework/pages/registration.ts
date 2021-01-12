import { By, ThenableWebDriver, WebElement } from 'selenium-webdriver';
import { goTo } from '../index';
import { LOCATION } from '../config';
import {
  getElementById,
  getElementsById,
  getInputValueByName,
  setInputValueByName,
} from '../helpers';

export class RegistrationPage {
  driver: ThenableWebDriver;
  // regForm: WebElement;

  constructor(driver: ThenableWebDriver) {
    this.driver = driver;
  }

  registrationForm(): Promise<WebElement> {
    return getElementById(this.driver, 'registrationForm');
  }

  async visit(): Promise<void> {
    return goTo(this.driver, `${LOCATION}/registration`);
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
   * Submits selected employees
   */
  async submitEmployees(): Promise<void> {
    const nextButton = await getElementById(
      this.driver,
      'submitSelectEmployees',
    );
    await nextButton.click();
    await this.driver.manage().setTimeouts({ implicit: 3000 });
  }

  /**
   * Checks if registration form  present
   */
  async hasSubmitEmployees(): Promise<boolean> {
    const form = await this.registrationForm();
    const btn = await form.findElements(By.id('submitSelectEmployees'));
    return !!btn.length;
  }

  /**
   * Checks if submit employees button present
   */
  async hasRegistrationForm(): Promise<boolean> {
    const form = await getElementsById(this.driver, 'registrationForm');
    return !!form.length;
  }

  /**
   * Checks is first name input present
   */
  async hasFirstNameInput(): Promise<boolean> {
    const form = await this.registrationForm();
    return !!(await form.findElements(By.id('registrationFormFirstName')))
      .length;
  }

  /**
   * Checks is first name input present
   */
  async hasLastNameInput(): Promise<boolean> {
    const form = await this.registrationForm();
    return !!(await form.findElements(By.id('registrationFormLastName')))
      .length;
  }
}
