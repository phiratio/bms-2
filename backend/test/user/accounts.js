const { accountListExpectTemplate } = require("../helpers/accountTemplate");
const { searchAccounts, listAccounts } = require("../framework/user");
const { getJwt } = require("../framework/auth");

describe("accounts", () => {
  let jwt;
  const { localAdminCredentials } = require("../mocks/user");

  beforeAll(async () => {
    jwt = await getJwt(
      localAdminCredentials.email,
      localAdminCredentials.password
    );
  });

  it("should return list of available accounts", async () => {
    const { statusCode, body } = await listAccounts(jwt);

    expect(statusCode).toBe(200);
    expect(body).toEqual(expect.objectContaining(accountListExpectTemplate));
  });

  it("should successfully search for an existing account", async () => {
    // Search for built-in `Anyone` account
    const { statusCode, body } = await searchAccounts(jwt, "Anyone");

    expect(statusCode).toBe(200);
    expect(body.users.length).toBeGreaterThan(0);
  });

  it("should successfully search for non existing account", async () => {
    const { statusCode, body } = await searchAccounts(
      jwt,
      "non-existing-account"
    );

    expect(statusCode).toBe(200);
    expect(body.users.length).toBe(0);
  });

  require("./accounts.create");
  require("./accounts.get");
});
