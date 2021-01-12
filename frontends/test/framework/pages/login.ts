import { Key, ThenableWebDriver } from 'selenium-webdriver';
import { getElementByName, urlContains } from '../helpers';
import { goTo } from '../index';
import { LOCATION } from '../config';

/**
 * Logs in using username and password
 * @param driver Selenium driver instance
 * @param login Login to be used for login flow
 * @param password Password that will be used for login flow
 * @returns {Promise<void>}
 */
export const login = async (
  driver: ThenableWebDriver,
  login: string,
  password: string,
): Promise<void> => {
  await driver.get(`${LOCATION}/login`);
  const loginElement = await getElementByName(driver, 'identifier');
  const passwordElement = await getElementByName(driver, 'password');
  await loginElement.sendKeys(login);
  await passwordElement.sendKeys(password, Key.RETURN);
};

export const visitLoginPage = async (
  driver: ThenableWebDriver,
): Promise<void> => {
  await goTo(driver, `${LOCATION}/login`);
};
