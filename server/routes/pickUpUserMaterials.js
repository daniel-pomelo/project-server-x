const { timestamp } = require("../../time");

const pickUpUserMaterials = (db) => async (req, res) => {
  const pickUp = req.body;
  console.log(req);
  console.log("pickUp: ", pickUp);
  const userMaterials = {
    type: "pick_up",
    quantity: 1,
    material: pickUp.material,
    user_id: pickUp.user_id,
    timestamp: timestamp(),
  };

  await db.savePickUpMaterials(userMaterials);

  res.send({});
};

module.exports = pickUpUserMaterials;
