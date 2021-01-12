import { By, ThenableWebDriver, until, WebElement } from 'selenium-webdriver';
import { DEFAULT_TIMEOUT } from './config';

/**
 * Returns Array of WebElements by id
 * @param driver
 * @param id
 * @param timeout
 */
export const getElementsById = async (
  driver: ThenableWebDriver,
  id: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<WebElement[]> => {
  const el = await driver.wait(until.elementLocated(By.id(id)), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return driver.findElements(By.id(id));
};

/**
 * Return single WebElement by id
 * @param driver
 * @param id
 * @param timeout
 */
export const getElementById = async (
  driver: ThenableWebDriver,
  id: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<WebElement> => {
  const el = await driver.wait(until.elementLocated(By.id(id)), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return driver.findElement(By.id(id));
};

/**
 * Returns single element by name
 * @param driver
 * @param name
 * @param timeout
 */
export const getElementByName = async (
  driver: ThenableWebDriver,
  name: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<WebElement> => {
  const el = await driver.wait(until.elementLocated(By.name(name)), timeout);
  return driver.wait(until.elementIsVisible(el), timeout);
};

/**
 * Returns single element by XPath
 * @param driver
 * @param xpath
 * @param timeout
 */
export const getElementByXpath = async (
  driver: ThenableWebDriver,
  xpath: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<WebElement> => {
  const el = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
  return driver.wait(until.elementIsVisible(el), timeout);
};

/**
 * Returns Array of WebElements by class name
 * @param driver
 * @param className
 * @param timeout
 */
export const getElementsByClassName = async (
  driver: ThenableWebDriver,
  className: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<WebElement[]> => {
  const elem = await driver.wait(
    until.elementLocated(By.className(className)),
    timeout,
  );
  await driver.wait(until.elementIsVisible(elem), timeout);
  return driver.findElements(By.className(className));
};

/**
 * Returns Single WebElement by class name
 * @param driver
 * @param className
 * @param timeout
 */
export const getElementByClassName = async (
  driver: ThenableWebDriver,
  className: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<WebElement> => {
  const elem = await driver.wait(
    until.elementLocated(By.className(className)),
    timeout,
  );
  await driver.wait(until.elementIsVisible(elem), timeout);
  return driver.findElement(By.className(className));
};

/**
 * Set input value by name
 * @param driver
 * @param elementName
 * @param newValue
 */
export const setInputValueByName = async (
  driver: ThenableWebDriver,
  elementName: string,
  newValue: string,
): Promise<void> => {
  const el = await getElementByName(driver, elementName);
  await el.clear();
  await el.sendKeys(newValue);
};

/**
 * Get Input value by name
 * @param driver
 * @param elementName
 */
export const getInputValueByName = async (
  driver: ThenableWebDriver,
  elementName: string,
): Promise<string> => {
  const el = await getElementByName(driver, elementName);
  return el.getAttribute('value');
};

/**
 * Waits for redirects
 * @param driver
 * @param url
 */
export const urlContains = async (
  driver: ThenableWebDriver,
  url: string,
): Promise<void> => {
  await driver.wait(until.urlContains(url));
};
