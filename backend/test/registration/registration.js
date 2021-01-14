const { getJwt } = require("../framework/auth");
const { getWaitingList } = require("../framework/waitinglist");
const { createRegistration } = require("../framework/registration");

describe("registration", () => {
  let jwt;
  const { localAdminCredentials } = require("../mocks/user");

  beforeAll(async () => {
    jwt = await getJwt(
      localAdminCredentials.email,
      localAdminCredentials.password
    );
  });

  it("should fail to continue and return error if submitted without first name and last name", async () => {
    const reg = await createRegistration(jwt, {});
    const { body } = reg;

    expect(reg.statusCode).toBe(400);
    expect(body.error).toEqual(expect.any(String));
    expect(body.message.errors).toEqual(
      expect.objectContaining({
        firstName: expect.objectContaining({
          msg: expect.any(String),
          param: expect.any(String),
        }),
        lastName: expect.objectContaining({
          msg: expect.any(String),
          param: expect.any(String),
        }),
      })
    );
  });

  it("should fail to continue and return error if submitted without last name", async () => {
    const reg = await createRegistration(jwt, {
      firstName: "First",
    });
    const { body } = reg;

    expect(reg.statusCode).toBe(400);
    expect(body.error).toEqual(expect.any(String));
    expect(body.message.errors).toEqual(
      expect.objectContaining({
        lastName: expect.objectContaining({
          msg: expect.any(String),
          param: expect.any(String),
        }),
      })
    );
  });

  it("should fail to continue and return error if submited without first name", async () => {
    const reg = await createRegistration(jwt, {
      lastName: "Last",
    });
    const { body } = reg;

    expect(reg.statusCode).toBe(400);
    expect(body.error).toEqual(expect.any(String));
    expect(body.message.errors).toEqual(
      expect.objectContaining({
        firstName: expect.objectContaining({
          msg: expect.any(String),
          param: expect.any(String),
        }),
      })
    );
  });

  it("should return list of employees when submitted with first name and last name", async () => {
    const reg = await createRegistration(jwt, {
      firstName: "First",
      lastName: "Last",
    });
    const { body } = reg;

    expect(reg.statusCode).toBe(400);
    expect(body.error).toEqual(expect.any(String));
    expect(body.message).toEqual(
      expect.objectContaining({
        listOfEmployees: expect.objectContaining({
          enabled: expect.any(Array),
          disabled: expect.any(Array),
        }),
        nextStep: expect.any(String),
        hasEmail: true,
      })
    );
  });

  it("should successfully register with first available employee", async () => {
    const reg = await createRegistration(jwt, {
      firstName: "First",
      lastName: "Last",
      employees: '["Anyone"]',
    });
    const { body } = reg;

    expect(reg.statusCode).toBe(200);
    expect(body.error).toBeUndefined();
    expect(body.message).toBe("success");
  });

  it("should successfully register with selected employee", async (done) => {
    const reg = await createRegistration(jwt, {
      firstName: "First",
      lastName: "Last",
      employees: '["Employee"]',
    });
    const { body } = reg;
    const waitingListRecord = await getWaitingList(jwt, body.id);

    expect(reg.statusCode).toBe(200);
    expect(body.error).toBeUndefined();
    expect(body.message).toBe("success");

    expect(body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        message: "success",
      })
    );

    expect(waitingListRecord.statusCode).toBe(200);
    done();
  });
});
