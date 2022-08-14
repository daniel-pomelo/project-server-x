const asyncHandler = require("../routes/asyncHandler");

const URL_SCALING_FACTORS = "/api/scaling-factors";

module.exports = {
  getScalingFactors: (app, db) => {
    app.get(
      URL_SCALING_FACTORS,
      asyncHandler((req, res) => {
        db.findScalingFactors().then((scaling_factors) =>
          res.send({ scaling_factors })
        );
      })
    );
  },
};
