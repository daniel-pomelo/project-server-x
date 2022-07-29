const assertBridgeIsEnabled = require("../routes/assertBridgeIsEnabled");
const asyncHandler = require("../routes/asyncHandler");
const getInviteUrl = require("./getInviteUrl");

const URL_INVITE = "/api/invite";

module.exports = {
  invite: (app, db, tokens, UI_URL) => {
    app.post(
      URL_INVITE,
      asyncHandler(assertBridgeIsEnabled(db)),
      asyncHandler(getInviteUrl(tokens, UI_URL, db))
    );
  },
};
