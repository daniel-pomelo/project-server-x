const path = require("path");
const express = require("express");
const { logRequest } = require("./logRequest");
const app = express();

const PORT = process.env.PORT || 3000;
const middlewares = [logRequest];

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(path.resolve(path.join(__dirname, "/../view/home.html")));
});

app.get("/api/users/:id", middlewares, function (req, res) {
  res.send({
    name: "perri",
  });
});

app.listen(PORT, () => {
  console.log("Server is running at port " + PORT);
});
