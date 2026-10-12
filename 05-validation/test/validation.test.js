import Joi from "joi";

describe("Joi", () => {
  it("create schema", () => {
    const schema = Joi.string().min(3).max(20).required();

    const result = schema.validate("jo");
    if (result.error) console.log(result.error.message);
  });

  it("basic data type", () => {
    const emailSchema = Joi.string().email().required();
    const isAdminSchema = Joi.boolean().required();
    const priceSchema = Joi.number().required().min(1000).max(100000);

    const resultEmail = emailSchema.validate("joko@gmail.com");
    console.log(resultEmail);

    const resultIsAdmin = isAdminSchema.validate("true"); // otomatis akan d konversi oleh joi
    console.log(resultIsAdmin);

    const resultPrice = priceSchema.validate("10000"); // otomatis akan d konversi oleh joi
    console.log(resultPrice);
  });
});
