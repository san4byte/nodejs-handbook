import Joi from "joi";

describe("Joi", () => {
  it("validate date", () => {
    const birthDateSchema = Joi.date().required().max("now").min("1-1-2000");

    const result1 = birthDateSchema.validate("1-1-1999");
    console.info(result1);

    const result2 = birthDateSchema.validate("1-1-2008");
    console.info(result2);

    const result3 = birthDateSchema.validate("1-1-2026");
    console.info(result3);
  });
});
