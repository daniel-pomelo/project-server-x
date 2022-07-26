const getUserDataOrRegisterLink = require("./getUserDataOrRegisterLink");

const returnUserById = (db) => async (req, res, next) => {
  try {
    const userId = req.params.id;
    await getUserDataOrRegisterLink(db)(req, res);
    await db.registerUserMeterAsActive(userId);
  } catch (error) {
    next(error);
  }
};

module.exports = returnUserById;
