const { accountExpectTemplate } = require("../helpers/accountTemplate");
const {
  getAccount,
  getRoleIdByName,
  createAccount,
} = require("../framework/user");
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

  describe("get", () => {
    it("should be able retrieve account information", async () => {
      const clientRoleId = await getRoleIdByName(jwt, "Client");

      const newClientRequest = {
        firstName: "First",
        lastName: "Last",
        role: clientRoleId,
      };

      const {
        body: {
          data: { id },
        },
      } = await createAccount(jwt, newClientRequest);

      const { statusCode, body } = await getAccount(jwt, id);
      expect(statusCode).toBe(200);
      expect(body).toEqual(expect.objectContaining(accountExpectTemplate));
    });
  });
});
