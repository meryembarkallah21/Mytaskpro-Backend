//our try
const JWT = require("jsonwebtoken");
const User = require("../models/user");
const Token = require("../models/Token.model");
const sendEmail = require("../utils/email/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { hash } = require("bcrypt-nodejs");

const JWTSecret = process.env.JWT_SECRET;
const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;


const requestPasswordReset = async (email) => {
  console.log(email);
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email does not exist");

  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  const link = `${clientURL}/auth/reset-password/${resetToken}`;

  sendEmail(
    user.email,
    "Password Reset Request",
    {
      name: user.name,
      link: link,
    },
    "./template/requestResetPassword.handlebars"
  );
  return link;
};

const resetPassword = async (email, token, password) => {
  console.log(email);
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User does not exist");
  }

  let userId = user._id;

  let passwordResetToken = await Token.findOne({ userId });

  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }

  const isValid = await bcrypt.compare(token, passwordResetToken.token);

  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }

  user.password = password;

  await user.save();

  sendEmail(
    user.email,
    "Password Reset Successfully",
    {
      name: user.name,
    },
    "./template/resetPassword.handlebars"
  );

  await passwordResetToken.deleteOne();

  return true;


};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
