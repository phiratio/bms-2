const request = require("supertest");

/**
 * Creates a user based on params
 * @param mockUserData
 * @returns {Promise<*>}
 */
const createUser = async (mockUserData) => {
  const data = { ...mockUserData };
  const user = await strapi.plugins["users-permissions"].services.user.add(
    data
  );

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: {
      id: user.role.id,
      name: user.role.name,
    },
  };
};

/**
 * Deletes user based on provided params
 * @param userData
 * @returns {Promise<*>}
 */
const deleteUser = async (userData) => {
  try {
    return strapi.plugins["users-permissions"].services.user.remove(userData);
  } catch (e) {}
};

/**
 * Returns default role
 * @returns {*}
 */
const getDefaultRole = async () => {
  const role = await strapi.query("role", "users-permissions").findOne({}, []);

  return {
    id: role.id,
  };
};

/**
 * Returns role by its name
 * @param name
 * @returns {Promise<{name: string, id: string}>}
 */
const getRoleByName = async (name) => {
  const role = await strapi
    .query("role", "users-permissions")
    .findOne({ name }, []);

  return {
    id: String(role.id),
    name: String(role.name),
  };
};

/**
 * Returns user profile
 * @param jwt
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const getUserProfile = async (jwt) => {
  const res = await request(strapi.server)
    .get("/accounts/profile")
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Updates user profile
 * @param jwt
 * @param data
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const updateUserProfile = async (jwt, data) => {
  const res = await request(strapi.server)
    .put("/accounts/profile")
    .send(data)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Sends request to change current user password
 * @param jwt
 * @param password
 * @returns {Promise<{body: *, notifications: *, statusCode: *}>}
 */
const changeUserPassword = async (jwt, password) => {
  const res = await request(strapi.server)
    .put("/accounts/profile/changePassword")
    .send({ password })
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
    notifications: res.body.notifications,
  };
};

module.exports = {
  createUser,
  deleteUser,
  getDefaultRole,
  getRoleByName,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
};
