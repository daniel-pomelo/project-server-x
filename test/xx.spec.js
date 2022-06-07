const { expect } = require("chai");
const { useSkill } = require("../core/useSkill");

describe("Ignite", () => {
  const ignite = {
    amount: -15,
  };
  it("cuando la inteligencia es el valor inicial (10) el amount no se ve afectado", () => {
    const player = {
      intelligence: 10,
    };
    const expected = {
      amount: -15,
    };

    const actual = useSkill(player, ignite);

    expect(actual).to.eqls(expected);
  });
  it("el amount se multiplica por la inteligencia / el valor inicial (10)", () => {
    const player = {
      intelligence: 20,
    };
    const expected = {
      amount: -30,
    };

    const actual = useSkill(player, ignite);

    expect(actual).to.eqls(expected);
  });
});
describe("Heal", () => {
  const heal = {
    health_self: 50,
  };
  it("cuando la inteligencia es el valor inicial (10) el health_self no se ve afectado", () => {
    const player = {
      intelligence: 10,
    };
    const expected = {
      health_self: 50,
    };

    const actual = useSkill(player, heal);

    expect(actual).to.eqls(expected);
  });
  it("el health_self se multiplica por la inteligencia / el valor inicial (10)", () => {
    const player = {
      intelligence: 20,
    };
    const expected = {
      health_self: 100,
    };

    const actual = useSkill(player, heal);

    expect(actual).to.eqls(expected);
  });
});
describe("Restore", () => {
  const restore = {
    mana_other: 50,
  };
  it("cuando la inteligencia es el valor inicial (10) el mana_other no se ve afectado", () => {
    const player = {
      intelligence: 10,
    };
    const expected = {
      mana_other: 50,
    };

    const actual = useSkill(player, restore);

    expect(actual).to.eqls(expected);
  });
  it("el mana_other se multiplica por la inteligencia / el valor inicial (10)", () => {
    const player = {
      intelligence: 20,
    };
    const expected = {
      mana_other: 100,
    };

    const actual = useSkill(player, restore);

    expect(actual).to.eqls(expected);
  });
});
