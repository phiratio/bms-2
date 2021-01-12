/**
 * Returns main layout structure
 * @param driver Selenium driver instance
 * @returns {Promise<{sidebar: {present: boolean}, appBody: {present: boolean}, title: *}>}
 */
import { ThenableWebDriver, WebElement } from 'selenium-webdriver';
import { getElementsByClassName } from '../helpers';

export const appBody = async (
  driver: ThenableWebDriver,
): Promise<WebElement[]> => {
  return getElementsByClassName(driver, 'app-body');
};

export const sidebar = async (
  driver: ThenableWebDriver,
): Promise<WebElement[]> => {
  return getElementsByClassName(driver, 'sidebar');
};
