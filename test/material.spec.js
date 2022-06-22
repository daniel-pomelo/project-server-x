const { expect } = require("chai");
const { UserMaterials } = require("../core/UserMaterials");

describe.only("xx", () => {
  it("test 1", () => {
    const actual = UserMaterials.from([
      {
        type: "pick_up",
        quantity: 1,
        material: "wheat",
      },
    ]);
    const expected = [
      {
        quantity: 1,
        type: "wheat",
      },
    ];

    expect(actual).to.eqls(expected);
  });
  it("test 2", () => {
    const actual = UserMaterials.from([
      {
        type: "pick_up",
        quantity: 4,
        material: "wheat",
      },
      {
        type: "pick_up",
        quantity: 2,
        material: "wheat",
      },
    ]);
    const expected = [
      {
        quantity: 6,
        type: "wheat",
      },
    ];

    expect(actual).to.eqls(expected);
  });
});
