const { expect } = require("chai");
const filterExMembers = require("../core/filterExMembers");

describe("exmembers", () => {
  it("test 1", () => {
    const memberships = [];
    const actual = filterExMembers(memberships);
    const expected = [];
    expect(actual).to.eqls(expected);
  });
  it("test 2", () => {
    const memberships = [
      {
        member_id: "1234",
        version: 2,
        status: "brokeup",
      },
      {
        member_id: "1234",
        version: 1,
        status: "joined",
      },
    ];
    const actual = filterExMembers(memberships);
    const expected = [];
    expect(actual).to.eqls(expected);
  });
});
