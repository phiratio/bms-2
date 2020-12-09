const { afterAll, beforeAll, it } = require("@jest/globals");
const {
  getCurrentUserCredentials,
  issueJwt,
  authLocal,
} = require("../framework/auth");
const { deleteUser, getDefaultRole, createUser } = require("../framework/user");

describe("authentication flow", () => {
  let defaultRole;
  let user;
  const mockUser = require("../mocks/user/defaultUser");

  beforeAll(async () => {
    defaultRole = await getDefaultRole();
    mockUser.role = defaultRole.id;
    await deleteUser({ email: mockUser.email });
  });

  afterAll(async () => {
    await deleteUser({ email: mockUser.email });
  });

  it("should login user and return jwt token", async (done) => {
    user = await createUser(mockUser);
    const res = await authLocal(mockUser.email, mockUser.password);

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
    const user = await createUser(mockUser);
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
    await createUser(mockUser);
    const currentUser = await getCurrentUserCredentials();

    expect(currentUser.statusCode).toBe(401);
    done();
  });
});
