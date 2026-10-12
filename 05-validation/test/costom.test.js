import Joi from "joi";

describe("Joi", () => {
  it("costom validation", () => {
    const paswordConfirmSchema = Joi.object({
      password: Joi.string()
        .required()
        .min(6)
        .max(12)
        .custom((value, helper) => {
          if (value.startsWith("joko")) {
            return helper.error("password.wrong");
          }
          return value;
        })
        .messages({
          "password.wrong": "password tidak boleh dimulai dengan kalimat joko",
        }),
      confirmPassword: Joi.string().required().min(6).max(12),
    })
      .custom((value, helper) => {
        if (value.password !== value.confirmPassword) {
          return helper.error("register.password.different");
        }
        return value;
      })
      .message({
        "register.password.different": "password harus sama",
      });

    const register = {
      password: "test123",
      confirmPassword: "test123",
    };

    const result = paswordConfirmSchema.validate(register, { abortEarly: false });
    console.log(result);
  });
});
