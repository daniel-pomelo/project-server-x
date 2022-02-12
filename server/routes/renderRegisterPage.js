const path = require("path");

function renderRegisterPage(req, res) {
  res.sendFile(path.resolve(path.join(__dirname, "/../../view/register.html")));
}

module.exports = renderRegisterPage;
