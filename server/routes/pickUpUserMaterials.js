const ONE = 1;
const PICK_UP = "pick_up";

const pickUpUserMaterials = (material, user_id, timestamp) => ({
  user_id,
  material,
  timestamp,
  type: PICK_UP,
  quantity: ONE,
});

module.exports = pickUpUserMaterials;
