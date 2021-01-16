const accountExpectTemplate = {
  blocked: expect.any(Boolean),
  confirmed: expect.any(Boolean),
  description: null,
  email: null,
  firstName: expect.any(String),
  id: expect.any(String),
  items: expect.any(Array),
  lastName: expect.any(String),
  mobilePhone: null,
};

const fullAccountExpectTemplate = {
  blocked: expect.any(Boolean),
  confirmed: expect.any(Boolean),
  email: expect.any(String) || null,
  firstName: expect.any(String),
  id: expect.any(String),
  username: expect.any(String),
  items: expect.any(Array),
  lastName: expect.any(String),
  mobilePhone: expect.any(String) || null,
};

const fullAccountRequestTemplate = {
  blocked: true,
  confirmed: true,
  email: "test_email@example.com",
  username: "Testusername",
  password: "some_password",
  firstName: "First",
  lastName: "Last",
  mobilePhone: "+12125555555",
};

const accountListExpectTemplate = {
  meta: {
    currentPage: expect.any(Number),
    pageSize: expect.any(Number),
    paginationLinks: expect.any(Number),
    totalPages: expect.any(Number),
    totalRecords: expect.any(Number),
  },
  users: expect.arrayContaining([
    expect.objectContaining({
      blocked: expect.any(Boolean),
      confirmed: expect.any(Boolean),
      description: expect.any(String) || null,
      email: expect.any(String) || null,
      firstName: expect.any(String),
      id: expect.any(String),
      items: expect.any(Array),
      lastName: expect.any(String),
      mobilePhone: expect.any(String) || null,
    }),
  ]),
};

module.exports = {
  accountExpectTemplate,
  fullAccountExpectTemplate,
  fullAccountRequestTemplate,
  accountListExpectTemplate,
};
