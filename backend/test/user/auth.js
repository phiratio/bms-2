const { afterAll, beforeAll, it } = require("@jest/globals");
const {
  getCurrentUserCredentials,
  issueJwt,
  authLocal,
} = require("../framework/auth");
const { getDefaultRole, createUser, deleteUser } = require("../framework/user");

describe("authentication flow", () => {
  let defaultRole;
  let user;
  const { localUser } = require("../mocks/user");

  beforeAll(async () => {
    defaultRole = await getDefaultRole();
    localUser.role = defaultRole.id;
    await deleteUser({ email: localUser.email });
  });

  afterAll(async () => {
    await deleteUser({ email: localUser.email });
  });

  it("should login user and return jwt token", async (done) => {
    user = await createUser(localUser);
    const res = await authLocal(localUser.email, localUser.password);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      jwt: expect.any(String),
      user: expect.any(Object),
    });
    done();
  });

  it("should fail to login with incorrect username and password", async (done) => {
    const res = await authLocal("INCORRECT_EMAIL", "INCORRECT_PASSWORD");

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      statusCode: 400,
      error: expect.any(String),
      message: expect.any(Object),
      data: {
        errors: expect.any(Object),
      },
    });
    done();
  });

  it("should return user's data for authenticated user", async (done) => {
    const user = await createUser(localUser);
    const jwt = await issueJwt(user.id);
    const currentUser = await getCurrentUserCredentials(jwt);

    expect(currentUser).toEqual({
      statusCode: 200,
      id: user.id,
      username: user.username,
      email: user.email,
    });
    done();
  });

  it("should return `401 Unauthorized` when requesting user credentials without jwt", async (done) => {
    const currentUser = await getCurrentUserCredentials();
    expect(currentUser.statusCode).toBe(401);
    done();
  });
});
