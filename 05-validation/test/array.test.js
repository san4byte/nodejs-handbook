import Joi from "joi";

describe("Joi", () => {
  it("validation array", () => {
    const createArraySchema = Joi.array().items(Joi.string().min(1).required()).min(1).unique();

    const array = ["A", "coding", "coding"];

    const result = createArraySchema.validate(array, { abortEarly: false });
    console.log(result);
  });

  it("validation array object", () => {
    const createArraySchema = Joi.array()
      .items(
        Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().min(1).required(),
        })
      )
      .min(1)
      .unique();

    const array = [
      {
        email: "joko",
        password: "qwerty123",
      },
    ];

    const result = createArraySchema.validate(array, { abortEarly: false });
    console.log(result);
  });
});
