const asyncHandler = require("../routes/asyncHandler");

const URL_GET_CLANS_PAGE_INFO = "/api/pages/clans";

module.exports = {
  getClansPageInfo: (app, db) => {
    app.get(URL_GET_CLANS_PAGE_INFO, asyncHandler(getClansPageInfo(db)));
  },
};

function getClansPageInfo(db) {
  return (req, res) => {
    db.getClans().then((clans) => {
      console.log(clans);
      res.send(clans);
    });
  };
}
