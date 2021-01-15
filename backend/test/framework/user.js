const request = require("supertest");
/**
 * Sends request to list user accounts
 * @param jwt
 * @param accountId
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const listAccounts = async (jwt) => {
  const res = await request(strapi.server)
    .get(`/accounts/`)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Performs search for accounts
 * @param jwt
 * @param query
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const searchAccounts = async (jwt, query) => {
  const res = await request(strapi.server)
    .get(`/accounts/?search=${query}`)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Sends request to meta data for account creation
 * @param jwt
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const accountsCreateMeta = async (jwt) => {
  const res = await request(strapi.server)
    .get(`/accounts/meta`)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Sends request to create user account
 * @param jwt
 * @param accountData
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const createAccount = async (jwt, accountData) => {
  const res = await request(strapi.server)
    .post(`/accounts/`)
    .send(accountData)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Sends request to get user account
 * @param jwt
 * @param accountId
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const getAccount = async (jwt, accountId) => {
  const res = await request(strapi.server)
    .get(`/accounts/${accountId}`)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Sends request to update user account
 * @param jwt
 * @param accountId
 * @param accountData
 * @returns {Promise<{body: *, statusCode: *}>}
 */
const updateAccount = async (jwt, accountId, accountData) => {
  const res = await request(strapi.server)
    .put(`/accounts/${accountId}`)
    .send(accountData)
    .set("Authorization", `Bearer ${jwt}`);

  return {
    statusCode: res.statusCode,
    body: res.body,
  };
};

/**
 * Retrieves role id by name
 * @param jwt
 * @param roleName
 * @returns {Promise<string>}
 */
const getRoleIdByName = async (jwt, roleName) => {
  const {
    body: { roles },
  } = await accountsCreateMeta(jwt);
  let clientRoleId = "";

  roles.forEach((role) => {
    if (role.name === roleName) {
      clientRoleId = role.id;
    }
  });

  if (clientRoleId === "") {
    throw new Error(`Unable to get ${roleName} role from meta data`);
  }

  return clientRoleId;
};

/**
 * Creates a user based on params directly in database
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
 * Creates a user based on params
 * @returns {Promise<*>}
 * @param email
 */
const getUserByEmail = async (email) => {
  const user = await strapi.plugins["users-permissions"].services.user.fetch({
    email,
  });

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
  listAccounts,
  searchAccounts,
  accountsCreateMeta,
  createAccount,
  getAccount,
  updateAccount,
  getRoleIdByName,
  createUser,
  deleteUser,
  getUserByEmail,
  getDefaultRole,
  getRoleByName,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
};
