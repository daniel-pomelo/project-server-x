const getUser = require("./getUser");

const returnUserById = (db) => async (req, res, next) => {
  try {
    const userId = req.params.id;
    await getUser(db)(req, res);
    await db.registerUserMeterAsActive(userId);
  } catch (error) {
    next(error);
  }
};

module.exports = returnUserById;
