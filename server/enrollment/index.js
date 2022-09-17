const assertBridgeIsEnabled = require("../routes/assertBridgeIsEnabled");
const asyncHandler = require("../routes/asyncHandler");
const getInvitation = require("../routes/getInvitation");
const registerInvitado = require("../routes/registerInvitado");
const getInviteUrl = require("./getInviteUrl");
const getInvitations = require("./getInvitations");

const URL_INVITE = "/api/invite";
const URL_GET_INVITATION = "/api/invite/:id";
const URL_REGISTER = "/api/register/:id";
const URL_GET_INVITATIONS = "/api/invitations";

module.exports = {
  invite: (app, db, UI_URL) => {
    app.post(
      URL_INVITE,
      asyncHandler(assertBridgeIsEnabled(db)),
      asyncHandler(getInviteUrl(UI_URL, db))
    );
  },
  invitation: (app, db, tokens) => {
    app.get(URL_GET_INVITATION, asyncHandler(getInvitation(tokens, db)));
  },
  register: (app, db, tokens, UI_URL) => {
    app.post(URL_REGISTER, asyncHandler(registerInvitado(db, tokens, UI_URL)));
  },
  invitations: (app, db) => {
    app.get(URL_GET_INVITATIONS, asyncHandler(getInvitations(db)));
  },
};
