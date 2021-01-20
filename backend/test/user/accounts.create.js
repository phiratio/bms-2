const {
  fullAccountExpectTemplate,
  fullAccountRequestTemplate,
} = require("../helpers/accountTemplate");
const {
  deleteUser,
  getRoleIdByName,
  createAccount,
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

  describe("create", () => {
    it("should fetch account creation meta data", async () => {
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

    it("should create minimal client account", async () => {
      const clientRoleId = await getRoleIdByName(jwt, "Client");

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        role: clientRoleId,
      };

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
            id: clientRoleId,
          }),
        })
      );
    });

    it("should not create account without first name", async () => {
      const roleId = await getRoleIdByName(jwt, "Employee");

      const newAccountRequest = {
        lastName: fullAccountRequestTemplate.lastName,
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
          firstName: expect.objectContaining({
            msg: expect.any(String),
            param: "firstName",
          }),
        })
      );
    });

    it("should not create account without last name", async () => {
      const roleId = await getRoleIdByName(jwt, "Employee");

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
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
          lastName: expect.objectContaining({
            msg: expect.any(String),
            param: "lastName",
          }),
        })
      );
    });

    it("should create blocked account", async () => {
      const clientRoleId = await getRoleIdByName(jwt, "Client");

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        role: clientRoleId,
        blocked: true,
      };

      const { statusCode, body } = await createAccount(jwt, newAccountRequest);
      expect(statusCode).toBe(200);
      expect(body.data).toEqual(
        expect.objectContaining({
          blocked: true,
        })
      );
    });

    it("should create account that is not confirmed", async () => {
      const clientRoleId = await getRoleIdByName(jwt, "Client");

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        role: clientRoleId,
        confirmed: false,
      };

      const { statusCode, body } = await createAccount(jwt, newAccountRequest);
      expect(statusCode).toBe(200);
      expect(body.data).toEqual(
        expect.objectContaining({
          confirmed: false,
        })
      );
    });

    it("should create account that can accept appointments", async () => {
      const roleId = await getRoleIdByName(jwt, "Employee");
      await deleteUser({ username: fullAccountRequestTemplate.email });

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        username: fullAccountRequestTemplate.username,
        role: roleId,
        acceptAppointments: true,
      };

      const { statusCode, body } = await createAccount(jwt, newAccountRequest);
      expect(statusCode).toBe(200);
      expect(body.data).toEqual(
        expect.objectContaining({
          acceptAppointments: true,
        })
      );
    });

    it("should create account with description", async () => {
      const clientRoleId = await getRoleIdByName(jwt, "Client");

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        role: clientRoleId,
        description: fullAccountRequestTemplate.description,
      };

      const { statusCode, body } = await createAccount(jwt, newAccountRequest);
      expect(statusCode).toBe(200);
      expect(body.data.description).toEqual(
        fullAccountRequestTemplate.description
      );
    });

    it("should create account with email", async () => {
      const clientRoleId = await getRoleIdByName(jwt, "Client");
      await deleteUser({ email: fullAccountRequestTemplate.email });

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        role: clientRoleId,
        email: fullAccountRequestTemplate.email,
      };

      const { statusCode, body } = await createAccount(jwt, newAccountRequest);
      expect(statusCode).toBe(200);
      expect(body.data.email).toEqual(fullAccountRequestTemplate.email);
    });

    it("should not create account if username has already been used by another account", async () => {
      await deleteUser({ username: fullAccountRequestTemplate.username });
      const roleId = await getRoleIdByName(jwt, "Client");

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        role: roleId,
        username: fullAccountRequestTemplate.username,
      };

      await createAccount(jwt, newAccountRequest);

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

    it("should not create account if email has already been used by another account", async () => {
      await deleteUser({ email: fullAccountRequestTemplate.email });
      const roleId = await getRoleIdByName(jwt, "Client");

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        role: roleId,
        email: fullAccountRequestTemplate.email,
      };

      await createAccount(jwt, newAccountRequest);

      const {
        statusCode,
        body: {
          data: { errors },
        },
      } = await createAccount(jwt, newAccountRequest);

      expect(statusCode).toBe(400);
      expect(errors).toEqual(
        expect.objectContaining({
          email: expect.objectContaining({
            msg: expect.any(String),
            param: "email",
          }),
        })
      );
    });

    test.each([
      "wrong.email.com",
      "@email.com",
      "first.last@",
      "first.@email.com",
      "first.last@mail",
      "first.last@mail.",
      ".last@mail.com",
    ])("should not create account with %p email", async (email) => {
      const roleId = await getRoleIdByName(jwt, "Employee");

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        email: email,
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
          email: expect.objectContaining({
            msg: expect.any(String),
            param: "email",
          }),
        })
      );
    });

    it("should create account with mobile phone", async () => {
      const clientRoleId = await getRoleIdByName(jwt, "Client");
      await deleteUser({ mobilePhone: fullAccountRequestTemplate.mobilePhone });

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        role: clientRoleId,
        mobilePhone: fullAccountRequestTemplate.mobilePhone,
      };

      const { statusCode, body } = await createAccount(jwt, newAccountRequest);
      expect(statusCode).toBe(200);
      expect(body.data.mobilePhone).toEqual(
        fullAccountRequestTemplate.mobilePhone
      );
    });

    test.each([
      "123",
      "+123",
      "+1 234 567",
      "+1 234 567890a",
      "+1123456789",
      "11234567890",
      "111234567890",
      "555-55-55",
    ])(
      "should not create account with %p phone number",
      async (mobilePhone) => {
        const roleId = await getRoleIdByName(jwt, "Employee");

        const newAccountRequest = {
          firstName: fullAccountRequestTemplate.firstName,
          lastName: fullAccountRequestTemplate.lastName,
          mobilePhone: mobilePhone,
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
            mobilePhone: expect.objectContaining({
              msg: expect.any(String),
              param: "mobilePhone",
            }),
          })
        );
      }
    );

    it("should not create account if mobile phone has already been used by another account", async () => {
      await deleteUser({ mobilePhone: fullAccountRequestTemplate.mobilePhone });
      const roleId = await getRoleIdByName(jwt, "Client");

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        role: roleId,
        mobilePhone: fullAccountRequestTemplate.mobilePhone,
      };

      await createAccount(jwt, newAccountRequest);

      const {
        statusCode,
        body: {
          data: { errors },
        },
      } = await createAccount(jwt, newAccountRequest);

      expect(statusCode).toBe(400);
      expect(errors).toEqual(
        expect.objectContaining({
          mobilePhone: expect.objectContaining({
            msg: expect.any(String),
            param: "mobilePhone",
          }),
        })
      );
    });

    it("should not create account without role", async () => {
      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
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
          role: {
            msg: expect.any(String),
            param: expect.any(String),
          },
        })
      );
    });

    it("should create minimal employee account", async () => {
      const roleId = await getRoleIdByName(jwt, "Employee");

      const newAccountRequest = {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        username: fullAccountRequestTemplate.username,
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
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
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
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
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
    });

    it("should create account with schedule", async () => {
      await deleteUser({ username: fullAccountRequestTemplate.username });
      const roleId = await getRoleIdByName(jwt, "Employee");

      const {
        statusCode,
        body: { data },
      } = await createAccount(jwt, {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        username: fullAccountRequestTemplate.username,
        role: roleId,
        enableSchedule: true,
        schedule: {
          monday: { status: true },
          tuesday: { status: true },
          wednesday: { status: true },
          thursday: { status: true },
          friday: { status: true },
          saturday: { status: true },
          sunday: { status: true },
        },
      });

      expect(statusCode).toBe(200);
      expect(data).toEqual(
        expect.objectContaining({
          schedule: {
            monday: { status: true },
            tuesday: { status: true },
            wednesday: { status: true },
            thursday: { status: true },
            friday: { status: true },
            saturday: { status: true },
            sunday: { status: true },
          },
        })
      );
    });

    it("should create account with schedule - custom working hours", async () => {
      await deleteUser({ username: fullAccountRequestTemplate.username });
      const roleId = await getRoleIdByName(jwt, "Employee");
      const schedule = {
        monday: { status: true, timeRanges: [[0, 85800]] },
        tuesday: {
          status: true,
          timeRanges: [
            [61200, 62400],
            [64800, 66600],
          ],
        },
        wednesday: {
          status: true,
          timeRanges: [
            [0, 62400],
            [73800, 85800],
          ],
        },
        thursday: {
          status: true,
          timeRanges: [
            [0, 61200],
            [62400, 64800],
            [73800, 85800],
          ],
        },
        friday: { status: false, timeRanges: [[0, 85800]] },
        saturday: { status: true, timeRanges: [[0, 85800]] },
        sunday: { status: true, timeRanges: [[0, 85800]] },
      };
      const {
        statusCode,
        body: { data },
      } = await createAccount(jwt, {
        firstName: fullAccountRequestTemplate.firstName,
        lastName: fullAccountRequestTemplate.lastName,
        username: fullAccountRequestTemplate.username,
        role: roleId,
        enableSchedule: true,
        schedule: schedule,
      });

      expect(statusCode).toBe(200);
      expect(data).toEqual(
        expect.objectContaining({
          schedule: schedule,
        })
      );
    });

    test.each([
      [[0, 85900]],
      [[-100, 85800]],
      [[0, 78888]],
      [
        // time is correct end of streak is the same as beginning of the next one which is not allowed
        [0, 85000],
        [85000, 85800],
      ],
      [
        [0, 85000],
        [80000, 85800],
      ],
    ])(
      "should not create account with schedule - with incorrect custom working hours %p",
      async (hours) => {
        await deleteUser({ username: fullAccountRequestTemplate.username });
        const roleId = await getRoleIdByName(jwt, "Employee");

        const {
          statusCode,
          body: {
            message: { errors },
          },
        } = await createAccount(jwt, {
          firstName: fullAccountRequestTemplate.firstName,
          lastName: fullAccountRequestTemplate.lastName,
          username: fullAccountRequestTemplate.username,
          role: roleId,
          enableSchedule: true,
          schedule: {
            monday: { status: true, timeRanges: hours },
          },
        });

        expect(statusCode).toBe(400);
        expect(errors).toEqual(
          expect.objectContaining({
            schedule: {
              msg: expect.any(String),
              param: "schedule",
            },
          })
        );
      }
    );

    // TODO: Test if account can be created with `Days Off`, with `Services`, `Future Boooking`, `Prior time booking`
    // `Automatically confirm bookings`, `Custom Appointment hours`
  });
});
