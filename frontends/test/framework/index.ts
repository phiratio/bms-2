import {
  until,
  By,
  Builder,
  Capabilities,
  ThenableWebDriver,
  WebElement,
} from 'selenium-webdriver';
import { getElementsByClassName } from './helpers';

/**
 * Set up the environment
 * @returns {Promise<*>}
 */
export const setup = async (
  server = '',
  browser = 'chrome',
  capabilities?: Capabilities,
): Promise<ThenableWebDriver> => {
  let driver = new Builder().forBrowser(browser);
  jest.setTimeout(30000);

  if (capabilities) {
    driver = driver.withCapabilities(capabilities);
  }

  if (server !== '') {
    driver = driver.usingServer(server);
  }

  const d = await driver.build();
  await d.manage().deleteAllCookies();

  return d;
};

/**
 * Destroys environment
 * @param driver Selenium driver instance
 * @returns {Promise<void>}
 */
export const teardown = async (driver: ThenableWebDriver): Promise<void> => {
  await driver.manage().deleteAllCookies();
  await driver.quit();
};

/**
 *
 * @param driver Selenium driver instance
 * @param path Location where page will be redirected
 */
export const goTo = (
  driver: ThenableWebDriver,
  path: string,
): Promise<void> => {
  return driver.get(path);
};

/**
 * Returns document cookies
 */
export const getCookies = (): string => {
  return document.cookie;
};

/**
 * Returns current page alerts
 * @param driver Selenium driver instance
 * @param type Type of alert: danger, warning, success
 * @returns {Promise<{length: *}>}
 */
export const getAlerts = async (
  driver: ThenableWebDriver,
  type: string,
): Promise<WebElement[]> => {
  const alertElement = await driver.wait(
    until.elementLocated(By.className(`alert-${type}`)),
    2000,
  );
  await driver.wait(until.elementIsVisible(alertElement), 2000);
  return getElementsByClassName(driver, `alert-${type}`);
};

/**
 * Returns login page title
 * @param driver Selenium driver instance
 * @returns {Promise<{title: *}>}
 */
export const getTitle = async (driver: ThenableWebDriver): Promise<string> => {
  return driver.getTitle();
};
