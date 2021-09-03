const getTheUserFromEmail = require('../helpers');
const assert = require('chai').assert;

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getTheUserFromEmail("user2@example.com", testUsers);
    const expectedOutput = "user2RandomID";
    assert.equal(user,expectedOutput);
  });
  it('should return a null if there is no user with that email', function() {
    const user = getTheUserFromEmail("user3@example.com", testUsers);
    const expectedOutput = null;
    assert.equal(user,expectedOutput);
  });
});