const asyncHandler = require("../routes/asyncHandler");
const {
  saveClan,
  inviteToMyClan,
  joinToClan,
  leaveToClan,
  managementClans,
  getUserInfo,
  deleteClan,
} = require("./handlers");

const CLANS_URL = "/api/clans";
const CLANS_INVITE_URL = "/api/clan/invite";
const CLANS_JOIN_URL = "/api/clans/join/:invitationId";
const CLANS_LEAVE_URL = "/api/clans/leave";
const CLANS_MANAGEMENT_URL = "/api/management/clans";
const DELETE_CLANS_MANAGEMENT_URL = "/api/management/clans/:id";
const CLANS_USER_INFO_URL = "/api/users/:userId/clans";

module.exports = {
  save(app, db) {
    app.post(CLANS_URL, asyncHandler(saveClan(db)));
  },
  sendInvitationToMyClan(app, db) {
    app.post(CLANS_INVITE_URL, asyncHandler(inviteToMyClan(db)));
  },
  join(app, db) {
    app.post(CLANS_JOIN_URL, asyncHandler(joinToClan(db)));
  },
  leave(app, db) {
    app.post(CLANS_LEAVE_URL, asyncHandler(leaveToClan(db)));
  },
  management(app, db) {
    app.get(CLANS_MANAGEMENT_URL, asyncHandler(managementClans(db)));
  },
  userInfo(app, db) {
    app.get(CLANS_USER_INFO_URL, asyncHandler(getUserInfo(db)));
  },
  managementDeleteClan(app, db) {
    app.delete(DELETE_CLANS_MANAGEMENT_URL, asyncHandler(deleteClan(db)));
  },
};
