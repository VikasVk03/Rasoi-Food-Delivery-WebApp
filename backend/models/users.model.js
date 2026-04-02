import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    mobile: {
      type: String,
      required: true
    },
    accountVerified: { type: Boolean, default: false },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    role: {
      type: String,
      enum: ["User", "RestaurantOwner", "DeliveryBoy"],
      required: true,
    },
  },
  // { timestamps: true },
);
// Password Encryption
userSchema.pre("save", async function () { // next parameter is removed for testing
  if (!this.isModified("password")) {
    return
  }
  this.password = await bcrypt.hash(this.password, 10);
  // next()
})

// Password Comparison
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
};

userSchema.methods.generateVerificationCode = function () {
  function generateRandomFiveDigitNumber() {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 10000).toString().padStart(4, 0);

    return parseInt(firstDigit + remainingDigits)
  }

  const verificationCode = generateRandomFiveDigitNumber();
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = new Date(Date.now() + 10 * 60 * 1000); // after 5 min code will get expire

  return verificationCode;
}


userSchema.methods.generateToken = async function () {
  return await jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex")

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;  // 15 min to expire

  return resetToken
}

const User = mongoose.model("User", userSchema);

export default User;
