import Joi from "joi";

describe("Joi", () => {
  it("costom error", () => {
    const schema = Joi.string().min(2).max(10).required().messages({
      "any.required": "{{#label}} harus diisi",
      "string.min": "{{#label}} harus minimal {{#limit}} karakter",
      "string.max": "{{#label}} harus maksimal {{#limit}} karakter",
    });

    const result = schema.validate(undefined, { abortEarly: false });
    console.log(result);
  });

  it("costom error object", () => {
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        "any.required": "{{#label}} harus diisi",
        "string.email": "{{#label}} harus email",
      }),
      password: Joi.string().min(6).max(10).required().messages({
        "any.required": "{{#label}} harus diisi",
        "string.min": "{{#label}} harus minimal {{#limit}} karakter",
        "string.max": "{{#label}} harus maksimal {{#limit}} karakter",
      }),
    });

    const user = {
      email: "joko@gmail.com",
      password: "jokoooo",
    };

    const result = schema.validate(user, { abortEarly: false });
    console.log(result);
  });
});
