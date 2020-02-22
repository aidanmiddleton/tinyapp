function getUserByEmail(email, database) {
  for (let userID in database) {
    if (database[userID].email === email) {
      let profile = database[userID];
      return profile;
    }
  }
  return false;
};

function generateRandomString() {
  let results = '';
  let characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let characterLength = characters.length;
  for (let i = 0; i < 6; i++) {
    results += characters.charAt(Math.floor(Math.random() * characterLength));
  }
  return results;
};

function getUsersURLS(userID, database) {
  let usersURLS = {};
  for (let urlID in database) {
    if (database[urlID].userID === userID) {
      usersURLS[urlID] = database[urlID];
    }
  }
  return usersURLS;
};

module.exports = { getUserByEmail, getUsersURLS, generateRandomString };