const { timestamp } = require("../../time");

const pickUpUserMaterials = (db) => async (req, res) => {
  const input = req.body;

  const userMaterials = input.map((pickUp) => {
    return {
      type: "pick_up",
      quantity: pickUp.quantity,
      material: pickUp.material,
      user_id: pickUp.user_id,
      timestamp: timestamp(),
    };
  });

  await db.savePickUpMaterials(userMaterials);

  res.send({});
};

module.exports = pickUpUserMaterials;
