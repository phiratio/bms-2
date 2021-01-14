const { toggleCheckWaitingListRecord } = require("../framework/waitinglist");
const { getWaitingList } = require("../framework/waitinglist");
const { createWaitingList } = require("../framework/waitinglist");
const { getNewWaitingLists } = require("../framework/waitinglist");
const { getWaitingLists } = require("../framework/waitinglist");
const { getJwt } = require("../framework/auth");

describe("registration", () => {
  let jwt;
  const { localAdminCredentials } = require("../mocks/user");
  const { newWalkInRecord } = require("../mocks/waitinglists");

  beforeAll(async () => {
    jwt = await getJwt(
      localAdminCredentials.email,
      localAdminCredentials.password
    );
  });

  it("should return all waiting lists", async () => {
    const { body, statusCode } = await getWaitingLists(jwt);

    expect(statusCode).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        appointments: expect.objectContaining({}),

        checked: expect.objectContaining({}),

        recent: expect.objectContaining({
          meta: expect.objectContaining({
            currentPage: expect.any(Number),
            pageSize: expect.any(Number),
            paginationLinks: expect.any(Number),
            totalPages: expect.any(Number),
            totalRecords: expect.any(Number),
          }),
          records: expect.arrayContaining([]),
        }),

        calendar: expect.objectContaining({
          currentDayHours: {
            start: expect.any(Number),
            end: expect.any(Number),
          },
          dayStatus: expect.any(Object),
          events: expect.any(Array),
          resources: expect.arrayContaining([]),
          viewDate: expect.any(Number),
        }),
      })
    );
  });

  it("should get values for a new waiting list record", async () => {
    const { body, statusCode } = await getNewWaitingLists(jwt);

    expect(statusCode).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        meta: expect.objectContaining({
          timeStep: expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
          }),

          allItems: expect.arrayContaining([]),
        }),
      })
    );
  });

  it("should create walk-in waiting list record", async () => {
    const { body, statusCode } = await createWaitingList(jwt, newWalkInRecord);
    const record = await getWaitingList(jwt, body.data.id);

    expect(statusCode).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: expect.any(String),
        }),
      })
    );

    expect(record.statusCode).toEqual(200);
  });

  it("should toggle waiting list record", async () => {
    const res = await createWaitingList(jwt, newWalkInRecord);
    const { id } = res.body.data;

    const { statusCode } = await toggleCheckWaitingListRecord(jwt, id);
    const { body } = await getWaitingList(jwt, id);

    expect(statusCode).toBe(200);
    expect(body).toEqual(expect.objectContaining({ check: true }));
  });
});
