const path = require("path");
const express = require("express");
const { logRequest } = require("./logRequest");
const app = express();

const PORT = process.env.PORT || 3000;
const middlewares = [logRequest];

app.use(express.static("public"));
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", function (req, res) {
  res.sendFile(path.resolve(path.join(__dirname, "/../view/home.html")));
});
app.post("/register", function (req, res) {
  console.log(req.body);
  res.sendFile(path.resolve(path.join(__dirname, "/../view/register.html")));
});
app.get("/register", function (req, res) {
  res.sendFile(path.resolve(path.join(__dirname, "/../view/home.html")));
});

app.get("/api/users/:id", middlewares, function (req, res) {
  const id = req.params.id;
  //limitar la cantidad de caracteres de los textos configurables por el usuario
  //min max de health
  //min = 100; max = infinito

  //tiene limite mana ? o es infinito ?
  //min = 100; max = infinito
  //
  res.send({
    id,
    name: "John bon jovi",
    breed: "Vampiro",
    type: "Asesino de bondiola",
    level_name: "Siglos",
    level_value: 666,
    stats: {
      health: 100,
      mana: 100,
    },
  });
  // res.status(404).send({
  //   register_link: "https://project-server-x.herokuapp.com/register",
  // });
});

app.listen(PORT, () => {
  console.log("Server is running at port " + PORT);
});
