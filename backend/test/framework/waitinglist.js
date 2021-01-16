const request = require("supertest");

/**
 * Retrieves all waiting lists records
 * @param jwt
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const getWaitingLists = async (jwt) => {
  const res = await request(strapi.server)
    .get(`/waitinglists/`)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Retrieves meta data for a new waiting list
 * @param jwt
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const getNewWaitingLists = async (jwt) => {
  const res = await request(strapi.server)
    .get(`/waitinglists/new`)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Retrieves waiting list record by id
 * @param jwt
 * @param id
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const getWaitingList = async (jwt, id) => {
  const res = await request(strapi.server)
    .get(`/waitinglists/${id}`)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Retrieves waiting list record by id
 * @param jwt
 * @param data
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const createWaitingList = async (jwt, data) => {
  const res = await request(strapi.server)
    .post(`/waitinglists/new`)
    .send(data)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Toggles waiting list record from table of
 * recent record to checked and vise versa
 * @param jwt
 * @param id
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const toggleCheckWaitingListRecord = async (jwt, id) => {
  const res = await request(strapi.server)
    .put(`/waitinglists/${id}/check`)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

module.exports = {
  getWaitingList,
  createWaitingList,
  getWaitingLists,
  getNewWaitingLists,
  toggleCheckWaitingListRecord,
};
