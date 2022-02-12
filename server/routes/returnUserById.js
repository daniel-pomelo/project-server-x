const getUserDataOrRegisterLink = require("./getUserDataOrRegisterLink");

const returnUserById = (db) => async (req, res, next) => {
  try {
    await getUserDataOrRegisterLink(db)(req, res);
  } catch (error) {
    next(error);
  }
};

module.exports = returnUserById;
