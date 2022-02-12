const saveUser = require("./saveUser");

const registerUser = (db, systemEvents) => async (req, res, next) => {
  try {
    await saveUser(db, systemEvents)(req, res);
  } catch (error) {
    next(error);
  }
};

module.exports = registerUser;
