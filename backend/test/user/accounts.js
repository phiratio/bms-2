const {
  fullAccountExpectTemplate,
  fullAccountRequestTemplate,
  accountExpectTemplate,
  accountListExpectTemplate,
} = require("../helpers/accountTemplate");
const {
  deleteUser,
  getAccount,
  getRoleIdByName,
  createAccount,
  searchAccounts,
  listAccounts,
  accountsCreateMeta,
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

  describe("create", () => {
    it("should account creation meta data", async () => {
      const { statusCode, body } = await accountsCreateMeta(jwt);

      expect(statusCode).toBe(200);
      expect(body).toEqual(
        expect.objectContaining({
          employeeRoles: expect.arrayContaining([
            expect.objectContaining({
              description: expect.any(String),
              id: expect.any(String),
              name: expect.any(String),
              type: expect.any(String),
            }),
          ]),
          items: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              index: expect.any(Number),
              name: expect.any(String),
              overwrite: expect.any(Array),
              price: expect.any(Number),
              priceAppt: expect.any(Number),
              showInAppt: expect.any(Boolean),
              showInPos: expect.any(Boolean),
              time: expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
              }),
              type: expect.any(String) || null,
            }),
          ]),
          roles: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
            }),
          ]),
          timeRanges: expect.objectContaining({
            from_1day_to_7day: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
              }),
            ]),
            from_1hour_to_12hour: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
              }),
            ]),
          }),
        })
      );
    });

    it("should create client account", async () => {
      const clientRoleId = await getRoleIdByName(jwt, "Client");

      const newClientRequest = {
        firstName: "First",
        lastName: "Last",
        role: clientRoleId,
      };

      const { statusCode, body } = await createAccount(jwt, newClientRequest);
      expect(statusCode).toBe(200);
      expect(body.data).toEqual(
        expect.objectContaining({
          blocked: expect.any(Boolean),
          confirmed: expect.any(Boolean),
          firstName: newClientRequest.firstName,
          id: expect.any(String),
          lastName: newClientRequest.lastName,
          role: expect.objectContaining({
            id: clientRoleId,
          }),
        })
      );
    });

    it("should create employee account", async () => {
      const roleId = await getRoleIdByName(jwt, "Employee");

      const newAccountRequest = {
        firstName: "First",
        lastName: "Last",
        username: "Testemployee",
        role: roleId,
      };

      await deleteUser({ username: newAccountRequest.username });

      const { statusCode, body } = await createAccount(jwt, newAccountRequest);
      expect(statusCode).toBe(200);
      expect(body.data).toEqual(
        expect.objectContaining({
          blocked: expect.any(Boolean),
          confirmed: expect.any(Boolean),
          firstName: newAccountRequest.firstName,
          id: expect.any(String),
          lastName: newAccountRequest.lastName,
          role: expect.objectContaining({
            id: roleId,
          }),
        })
      );
    });

    it("should not create employee account without username", async () => {
      const roleId = await getRoleIdByName(jwt, "Employee");

      const newAccountRequest = {
        firstName: "First",
        lastName: "Last",
        role: roleId,
      };

      const {
        statusCode,
        body: {
          data: { errors },
        },
      } = await createAccount(jwt, newAccountRequest);
      expect(statusCode).toBe(400);
      expect(errors).toEqual(
        expect.objectContaining({
          username: expect.objectContaining({
            msg: expect.any(String),
            param: "username",
          }),
        })
      );
    });

    it("should not create administrator account without email", async () => {
      const roleId = await getRoleIdByName(jwt, "Administrator");

      const newAccountRequest = {
        firstName: "First",
        lastName: "Last",
        role: roleId,
      };

      const {
        statusCode,
        body: {
          data: { errors },
        },
      } = await createAccount(jwt, newAccountRequest);
      expect(statusCode).toBe(400);
      expect(errors).toEqual(
        expect.objectContaining({
          email: {
            msg: expect.any(String),
            param: expect.any(String),
          },
        })
      );
    });

    it("should create client account with full information", async () => {
      const clientRoleId = await getRoleIdByName(jwt, "Client");
      // direct removal from db
      await deleteUser({ email: fullAccountRequestTemplate.email });
      await deleteUser({ email: fullAccountRequestTemplate.username });

      const {
        statusCode,
        body: { data },
      } = await createAccount(jwt, {
        ...fullAccountRequestTemplate,
        role: clientRoleId,
      });

      expect(statusCode).toBe(200);
      expect(data).toEqual(expect.objectContaining(fullAccountExpectTemplate));
      expect(data.firstName).toBe(fullAccountRequestTemplate.firstName);
      expect(data.lastName).toBe(fullAccountRequestTemplate.lastName);
      expect(data.email).toBe(fullAccountRequestTemplate.email);
      expect(data.username).toBe(fullAccountRequestTemplate.username);
      expect(data.mobilePhone).toBe(fullAccountRequestTemplate.mobilePhone);
      expect(data.blocked).toBe(fullAccountRequestTemplate.blocked);
      expect(data.confirmed).toBe(fullAccountRequestTemplate.confirmed);
    });
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
