const asyncHandler = require("../routes/asyncHandler");
const {
  saveClan,
  inviteToMyClan,
  joinToClan,
  leaveToClan,
  managementClans,
  getUserInfo,
  deleteClan,
  adminPutClanDown,
  declineInvitation,
  declareWar,
  kickoutToClan,
  setRoleToMember,
} = require("./handlers");

const CLANS_URL = "/api/clans";
const CLANS_INVITE_URL = "/api/clan/invite";
const CLANS_JOIN_URL = "/api/clans/join/:invitationId";
const CLANS_LEAVE_URL = "/api/clans/leave";
const CLANS_MANAGEMENT_URL = "/api/management/clans";
const DELETE_CLANS_MANAGEMENT_URL = "/api/management/clans/:id";
const CLANS_USER_INFO_URL = "/api/users/:userId/clans";
const ADMIN_PUT_DOWN_CLAN_URL = "/api/me/clan";
const DECLINE_INVITATION = "/api/invitation/:invitationId";
const DECLARE_WAR_URL = "/api/clan/relationships";
const CLANS_KICKOUT_URL = "/api/clan/kickout";
const CLANS_SET_ROLE_URL = "/api/clan/role";

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
  adminPutClanDown(app, db) {
    app.delete(ADMIN_PUT_DOWN_CLAN_URL, asyncHandler(adminPutClanDown(db)));
  },
  declineInvitation(app, db) {
    app.delete(DECLINE_INVITATION, asyncHandler(declineInvitation(db)));
  },
  declareWar(app, db) {
    app.post(DECLARE_WAR_URL, asyncHandler(declareWar(db)));
  },
  kickout(app, db) {
    app.post(CLANS_KICKOUT_URL, asyncHandler(kickoutToClan(db)));
  },
  setRoleToMember(app, db) {
    app.post(CLANS_SET_ROLE_URL, asyncHandler(setRoleToMember(db)));
  },
};
