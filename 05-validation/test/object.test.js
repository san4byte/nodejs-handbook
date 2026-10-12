import Joi from "joi";

describe("Joi", () => {
  it("validation object", () => {
    const createUserSchema = Joi.object({
      email: Joi.string().min(2).email().required(),
      password: Joi.string().min(6).max(12).required(),
    });

    const user = {
      email: "joko@gmail.com",
      password: "qwerty123",
    };

    const result = createUserSchema.validate(user, { abortEarly: false });

    if (result.error) {
      result.error.details.forEach((detail) => {
        console.log(`${detail.path} - ${detail.message}`);
      });
    } else {
      console.log(result);
    }
  });

  it("validation nested object", () => {
    const createUserSchema = Joi.object({
      email: Joi.string().min(2).email().required(),
      password: Joi.string().min(6).max(12).required(),
      address: Joi.object({
        street: Joi.string().min(1).max(100).required(),
        city: Joi.string().min(1).max(100).required(),
      }).required(),
    });

    const address = {
      email: "joko@gmail.com",
      password: "qwerty123",
      address: {
        street: "jalan nangka",
        city: "pekanbaru",
      },
    };

    const result = createUserSchema.validate(address, { abortEarly: false });

    if (result.error) {
      result.error.details.forEach((detail) => {
        console.log(`${detail.path} - ${detail.message}`);
      });
    } else {
      console.log(result);
    }
  });
});
