const dayjs = require("dayjs");
const { v4: uuidv4 } = require("uuid");
const { timestamp } = require("./time");

const UI_URL = process.env.URL_TO_UI;

async function getUserIdFromToken(db, token) {
  const session = await db.findOne("Sessions", {
    token,
    expired: false,
  });

  if (!session) {
    throw new Error("SESSION_EXPIRED");
  }

  const hasExpired = dayjs(session.timestamp)
    .add(7200, "seconds")
    .isBefore(dayjs());

  if (hasExpired) {
    await db.updateOne(
      "Sessions",
      {
        token,
      },
      {
        expired: true,
        marked_as_expired_at: timestamp(),
      },
      false
    );
    return;
  }

  console.log("Provided user-id: ", session.id);

  return session.id;
}

async function getProfileUrl(db, id) {
  const session = await db.findOne("Sessions", {
    id,
    expired: false,
  });
  if (!session) {
    const token = uuidv4();
    await db.save("Sessions", {
      id,
      token,
      timestamp: timestamp(),
      expired: false,
    });
    return getURLFromToken(token);
  } else {
    const hasExpired = dayjs(session.timestamp)
      .add(7200, "seconds")
      .isBefore(dayjs());

    if (hasExpired) {
      await db.updateOne(
        "Sessions",
        {
          _id: session._id,
        },
        {
          expired: true,
          marked_as_expired_at: timestamp(),
        },
        false
      );
      const token = uuidv4();
      await db.save("Sessions", {
        id,
        token,
        timestamp: timestamp(),
        expired: false,
      });
      return getURLFromToken(token);
    } else {
      return getURLFromToken(session.token);
    }
  }
}

const getURLFromToken = (token) => {
  const url = UI_URL + "/auth/" + token;
  return url;
};

async function getUserIdFromRequest(db, req) {
  const token = req.headers["authorization"];
  return getUserIdFromToken(db, token);
}

module.exports = {
  getUserIdFromToken,
  getProfileUrl,
  getUserIdFromRequest,
};
