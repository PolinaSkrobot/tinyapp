/* eslint-disable func-style */
const getTheUserFromEmail = function(email, database) {
  for (const key in database) {
    const user_ = database[key];
    if (user_.email === email) {
      return user_.id;
    }
  }
  return null;
};


module.exports = getTheUserFromEmail;

