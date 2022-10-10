const { getUserIdFromRequest } = require("../../auth");
const { timestamp } = require("../../time");

const userRespec = (db) => {
  return async (req, res) => {
    const userId = await getUserIdFromRequest(req);

    await assertHasRespecs(db, userId);

    const respec = await db.save("UserRespecs", {
      user_id: userId,
      type: "WITHDRAWAL",
    });
    const upsert = false;

    await db.updateMany(
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
    );
    await db.updateMany(
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
    );
    await db.updateMany(
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
    );
    await db.updateMany(
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
    );

    res.send({});
  };
};

const assertHasRespecs = async (db, userId) => {
  const respecs = await db.find("UserRespecs", {
    user_id: userId,
  });
  const rewards = respecs.filter((respec) => respec.type === "REWARD");
  const withdrawals = respecs.filter((respec) => respec.type === "WITHDRAWAL");
  const hasRespecs = rewards.length - withdrawals.length;

  if (hasRespecs <= 0) {
    const e = new Error("BAD_REQUEST");
    e.context = "USER_USING_RESPEC";
    e.reason = "HAS_NOT_RESPEC_TO_USE";
    e.payload = {
      query: { user_id: userId },
      result: {
        rewards: rewards.length,
        withdrawals: withdrawals.length,
      },
    };
    throw e;
  }
};

module.exports = userRespec;
