require("dotenv").config();
const path = require("path");
const express = require("express");
const { logBridgeId } = require("./logBridgeId");
const { verifyIsValidBridge } = require("./verifyIsValidBridge");
const { verifyUserIdPresence } = require("./verifyUserIdPresence");
const { findUserById, findAllUser, saveUser } = require("../user");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

const bridges = new Map();

app.get("/api/users", function (req, res) {
  findAllUser().then((users) => res.send(users));
});
app.get(
  "/api/users/:id",
  logBridgeId,
  verifyIsValidBridge,
  verifyUserIdPresence,
  function (req, res) {
    const id = req.params.id;
    findUserById(id)
      .then((user) => {
        console.log("user is registered: ", user.isRegistered());
        if (user.isRegistered()) {
          console.log("user response: ", user.asJSONResponse());
          res.send(user.asJSONResponse());
        } else {
          console.log("user not registered");
          res.status(404).send(user.getLinkToRegister());
        }
      })
      .catch((err) => {
        console.log("err: ", err);
        res.status(500).send(err);
      });
  }
);
app.get("/", function (req, res) {
  res.sendFile(path.resolve(path.join(__dirname, "/../view/home.html")));
});
app.post("/register/:id", function (req, res) {
  const id = req.params.id;
  const { name, breed, type, level_name } = req.body;

  saveUser(id, name, breed, type, level_name);

  const bridgeId = "ESTE_ES_EL_BRIDGE_ID";
  const bridgeUrl = bridges.get(bridgeId);

  console.log("BridgeId: ", bridgeId);
  console.log("BridgeURL: ", bridgeUrl);

  res.sendFile(path.resolve(path.join(__dirname, "/../view/home.html")));
});
app.get("/register/:id", function (req, res) {
  res.sendFile(path.resolve(path.join(__dirname, "/../view/register.html")));
});

app.post("/api/bridge", [verifyIsValidBridge], function (req, res) {
  const bridge_id = req.headers["bridge-id"];
  const { bridge_url } = req.body;
  bridges.set(bridge_id, { bridge_id, bridge_url });
  console.log("Body: ", req.body);
  console.log("Bridges: ", Array.from(bridges.values()));
  res.send();
});

app.listen(PORT, () => {
  console.log("Server is running at port " + PORT);
});
