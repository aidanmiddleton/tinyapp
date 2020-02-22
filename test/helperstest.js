const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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
    const user = getUserByEmail("user@example.com", testUsers).id
    console.log('result of getuserbyemail ', user)
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user)
  });

  it('should return undefined for a user that doesnt exist', function() {
    const user = getUserByEmail("user@exeeeample.com", testUsers).id
    console.log('result of getuserbyemail ', user)
    const expectedOutput = undefined;
    assert.equal(expectedOutput, user)
  });
});