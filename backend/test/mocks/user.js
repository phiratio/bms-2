/**
 * Mock local user
 */
const localUser = {
  username: "tester",
  email: "tester@test.com",
  provider: "local",
  password: "A1234abc",
  confirmed: true,
  blocked: false,
};

/**
 * Mock local admin
 */
const localAdminCredentials = {
  email: "admin@demo.org",
  password: "demodemo",
};

module.exports = {
  localUser,
  localAdminCredentials,
};
