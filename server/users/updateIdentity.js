const { getUserIdFromRequest } = require("../../auth");
const { timestamp } = require("../../time");

const userRespec = (db) => {
  return async (req, res) => {
    const userId = await getUserIdFromRequest(db, req);

    // await assertHasRespecs(db, userId);

    console.log(userId);
    console.log(req.body);

    res.send({});
  };
};

const assertHasRespecs = async (db, userId) => {
  const respecsCount = await db.getRespecCount(userId);
  const hasRespecs = respecsCount > 0;
  if (!hasRespecs) {
    const e = new Error("BAD_REQUEST");
    e.context = "USER_USING_RESPEC";
    e.reason = "HAS_NOT_RESPEC_TO_USE";
    e.payload = {
      userId,
      respecsCount,
    };
    throw e;
  }
};

module.exports = userRespec;
