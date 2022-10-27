const { getUserIdFromRequest } = require("../../auth");
const { timestamp } = require("../../time");

const userRespec = (db) => {
  return async (req, res) => {
    const userId = await getUserIdFromRequest(db, req);

    await assertHasRespecs(db, userId);

    const respec = await db.save("UserRespecs", {
      user_id: userId,
      type: "WITHDRAWAL",
      timestamp: timestamp(),
    });

    const upsert = false;
    const promises = [
      db.updateMany(
        "UserPoints",
        {
          user_id: userId,
          type: "USER_POINTS_WITHDRAWAL",
        },
        {
          respec_updated_at: timestamp(),
          status: "invalidated_by_respec",
          respec_id: respec.insertedId,
        },
        upsert
      ),
      db.updateMany(
        "UserSkillPoints",
        {
          user_id: userId,
          type: "USER_POINTS_WITHDRAWAL",
        },
        {
          respec_updated_at: timestamp(),
          status: "invalidated_by_respec",
          respec_id: respec.insertedId,
        },
        upsert
      ),
      db.updateMany(
        "UserSkills",
        {
          user_id: userId,
        },
        {
          respec_updated_at: timestamp(),
          status: "invalidated_by_respec",
          respec_id: respec.insertedId,
        },
        upsert
      ),
      db.updateMany(
        "UserStats",
        {
          user_id: userId,
        },
        {
          respec_updated_at: timestamp(),
          status: "invalidated_by_respec",
          respec_id: respec.insertedId,
        },
        upsert
      ),
    ];

    await Promise.all(promises);

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
