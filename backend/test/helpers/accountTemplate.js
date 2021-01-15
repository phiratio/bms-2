const accountTemplate = {
  blocked: expect.any(Boolean),
  confirmed: expect.any(Boolean),
  description: expect.any(String) || null,
  email: expect.any(String) || null,
  firstName: expect.any(String),
  id: expect.any(String),
  items: expect.any(Array),
  lastName: expect.any(String),
  mobilePhone: expect.any(String) || null,
  username: expect.any(String) || null,
};

const accountListTemplate = {
  meta: {
    currentPage: expect.any(Number),
    pageSize: expect.any(Number),
    paginationLinks: expect.any(Number),
    totalPages: expect.any(Number),
    totalRecords: expect.any(Number),
  },
  users: expect.arrayContaining([expect.objectContaining(accountTemplate)]),
};

module.exports = {
  accountTemplate,
  accountListTemplate,
};
