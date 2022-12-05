const { expect } = require("chai");
const dayjs = require("dayjs");

const nextSchedule = (now) => {
  const today = dayjs(now);
  const tomorrow = today.add(1, "day");
  const numberOfHours = tomorrow.format("dddd") === "Friday" ? 6 : 4;
  const expected = {
    timestamp: tomorrow.format("YYYY-MM-DDTHH:mm:ss"),
    ttl: 3600 * numberOfHours,
  };
  return expected;
};

describe("nextSchedule", () => {
  it("test 1", () => {
    const actual = nextSchedule("2022-12-01T23:30:00");

    const expected = {
      timestamp: "2022-12-02T23:30:00",
      ttl: 3600 * 6,
    };

    expect(expected).to.eqls(actual);
  });
  it("test 2", () => {
    const actual = nextSchedule("2022-12-02T23:30:00");

    const expected = {
      timestamp: "2022-12-03T12:30:00",
      ttl: 3600 * 4,
    };

    expect(expected).to.eqls(actual);
  });
});

//1:1 con indru

//Generador de statament html
//bajando tareas del checklist de  a clickup con David
//sync con Darryn, le pedi más datos estaticos del cliente
//PR para generador de statement markup
//https://github.com/pomelo-la/lending-stmt-markup/pull/13

//soporte a Mica por que le tira Forbidden la API de statements
//url: https://lending-statement-service.dev.pomelo.la/lending/v1/credit-lines/lcr-1234/statements/lst-1
