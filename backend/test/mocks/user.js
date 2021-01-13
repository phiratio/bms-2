/**
 * Mock local backend user
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
 * WaitingList registration user
 */
const registrationUser = {
  username: "testerReg",
  email: "testerReg@test.com",
  provider: "local",
  password: "A1234abc",
  confirmed: true,
  blocked: false,
};

module.exports = {
  localUser,
  registrationUser,
};
