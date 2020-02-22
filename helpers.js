function getUserByEmail(email, database) {
  for (let userID in database) {
    if (database[userID].email === email) {
      let profile = database[userID];
      return profile;
    }
  }
  return false;
}

module.exports = { getUserByEmail };