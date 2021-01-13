const request = require("supertest");

/**
 * Creates client registration
 * @param jwt
 * @param client
 * @returns {Promise<void>}
 */
const createRegistration = async (jwt, client) => {
  const res = await request(strapi.server)
    .post("/waitingLists")
    .send(client)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

module.exports = {
  createRegistration,
};
