const path = require("path");

const renderHome = (req, res) => {
  res.sendFile(path.resolve(path.join(__dirname, "/../../view/home.html")));
};

module.exports = renderHome;
