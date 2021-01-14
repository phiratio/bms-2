/**
 * new walk in record
 */
const newWalkInRecord = {
  date: Date.now() / 1000,
  employees: ["Anyone"],
  services: [],
  status: 1, // Confirmed
  timeRange: [],
  type: 1, // Walk-in
  "user.firstName": "FirstName",
  "user.lastName": "LastName",
};

module.exports = {
  newWalkInRecord,
};
