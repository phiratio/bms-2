const { getRoleIdByName } = require("../framework/user");
const { createAccount } = require("../framework/user");
const { accountsCreateMeta } = require("../framework/user");
const { searchAccounts } = require("../framework/user");
const { listAccounts } = require("../framework/user");
const { getJwt } = require("../framework/auth");
const { accountListTemplate } = require("../helpers/accountTemplate");

describe("registration", () => {
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
    expect(body).toEqual(expect.objectContaining(accountListTemplate));
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
});
