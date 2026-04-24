import User from "../models/users.model.js";
import ErrorHandler from "../middlewares/error.js"
import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js"
import { sendToken } from "../utils/sendToken.js"
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const signup = async (req, res, next) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    if (!fullName || !email || !password || !mobile || !role) {
      return next(new ErrorHandler("All Fields are required.", 400))
    }
    if (role === "Admin") {
      return next(new ErrorHandler("Admin signup is not available.", 403));
    }


    if (password.length < 8 || password.length > 32) {
      return next(new ErrorHandler("Password must be between 8 and 32 characters.", 400));
    }

    function validateMobileNumber(mobile) {
      // Regex for Indian phone number
      const mobileRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/
      return mobileRegex.test(mobile)
    }

    if (!validateMobileNumber(mobile)) {
      return next(new ErrorHandler("Invalid Mobile Number.", 400))
    }

    const existingUser = await User.findOne({
      $or: [
        {
          email,
          accountVerified: true,
        },
        {
          mobile,
          accountVerified: true,
        }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return next(new ErrorHandler("Email is already registered.", 400));
      }
      if (existingUser.mobile === mobile) {
        return next(new ErrorHandler("Mobile number is already registered.", 400))
      }
    }

    // preventing multiple registration attempts
    const registrationAttemptsByUser = await User.find({
      $or: [
        { mobile, accountVerified: false },
        { email, accountVerified: false }
      ]
    })

    if (registrationAttemptsByUser.length >= 3) {
      return next(
        new ErrorHandler(
          "You have exceeded the maximum number of attempts (3). Please try again after an hour.", 400
        )
      )
    }

    const userData = { fullName, email, password, mobile, role };

    const newUser = new User(userData);

    const verificationCode = newUser.generateVerificationCode();

    await newUser.save();


    // for now only Email verification
    sendVerificationCode(
      verificationCode,
      fullName,
      email,
      res,
    )

  } catch (error) {
    next(error)
  }

  /*  const hashedPassword = await bcrypt.hash(password, 10);
   user = await User.create({
     fullName,
     email,
     role,
     mobile,
     password: hashedPassword,
   });

   const token = await genToken(user._id);
   res.cookie("token", token, {
     httpOnly: true,
     secure: false,
     sameSite: "strict",
     maxAge: 7 * 24 * 60 * 60 * 1000,
   });

   return res.status(201).json(user);
 } catch (error) {
   return res.status(500).json(`Sign up error ${error}`);
 } */
};

async function sendVerificationCode(
  verificationCode,
  fullName,
  email,
  res
) {
  try {
    const message = generateEmailTemplate(verificationCode);

    sendEmail({
      email,
      subject: "✅ Rasoi - Verify Your Email Address",
      message,
    })
    res.status(200).json({
      success: true,
      message: `Verification email successfully sent to ${email}`,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Verification code failed to send."
    })
  }


}

function generateEmailTemplate(verificationCode) {
  return `
    <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border-radius: 14px; background: linear-gradient(135deg, #ffffff, #f7fbff); box-shadow: 0 10px 30px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 24px; font-weight: 600;">
        🔒 Verify Your Email
      </h2>
      <p style="font-size: 14px; color: #777; margin-top: 6px;">
        Secure your account with Rasoi
      </p>
    </div>

    <!-- Divider -->
    <div style="height: 1px; background: #eee; margin: 20px 0;"></div>

    <!-- Body -->
    <p style="font-size: 16px; color: #333;">Hi there 👋,</p>

    <p style="font-size: 16px; color: #555; line-height: 1.6;">
      You're just one step away from getting started with <strong>Rasoi</strong>.
      Please use the verification code below to confirm your email address:
    </p>

    <!-- Code Box -->
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #0096FF; padding: 16px 34px; border-radius: 10px; background: linear-gradient(135deg, #e0f7ff, #d5f6f6); border: 2px dashed #44C9EE; box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);">
        ${verificationCode}
      </div>
    </div>

    <!-- Expiry -->
    <div style="background: #fff4e5; padding: 14px 16px; border-radius: 8px; border-left: 4px solid #ffa726; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 14px; color: #8a6d3b;">
        ⏳ This code will expire in <strong>10 minutes</strong>.
      </p>
    </div>

    <!-- Note -->
    <p style="font-size: 14px; color: #666; line-height: 1.6;">
      If you didn’t request this, you can safely ignore this email. Your account remains secure.
    </p>

    <!-- Footer -->
    <div style="margin-top: 30px; text-align: center;">
      <p style="font-size: 14px; color: #555; margin: 6px 0;">
        Cheers, <br><strong style="color:#0096FF;">Rasoi Team</strong>
      </p>

      <p style="font-size: 12px; color: #aaa; margin-top: 12px;">
        This is an automated message — please do not reply.
      </p>
    </div>

  </div>

  `
}


export const verifyOTP = catchAsyncError(
  async (req, res, next) => {
    const { email, otp } = req.body;

    try {
      const userAllEntries = await User.find({ email, accountVerified: false }).sort({ createdAt: -1 })

      if (!userAllEntries || userAllEntries.length === 0) {
        return next(new ErrorHandler("User not found.", 404))
      }

      let user;

      if (userAllEntries.length > 1) {
        user = userAllEntries[0];

        await User.deleteMany({
          _id: { $ne: user._id }, email, accountVerified: false
        })
      } else {
        user = userAllEntries[0]
      }

      // 👇 Add logs here only for debug
      console.log("Fetched user from DB:", {
        id: user?._id,
        email: user?.email,
        mobile: user?.mobile,
        storedOTP: user?.verificationCode,
        enteredOTP: otp,
        expireAt: user?.verificationCodeExpire,
        currentTime: new Date(),
      });

      if (user.verificationCode !== Number(otp)) {
        return next(new ErrorHandler("Invalid OTP.", 400))
      }

      const currentTime = Date.now();
      const verificationCodeExpire = new Date(
        user.verificationCodeExpire
      ).getTime();

      if (currentTime > verificationCodeExpire) {
        return next(new ErrorHandler("OTP Expired.", 400))
      }

      user.accountVerified = true;
      user.verificationCode = null;
      user.verificationCodeExpire = null;

      await user.save({ validateModifiedOnly: true })

      sendToken(user, 200, "Account Verified.", res)
    } catch (error) {
      console.error("OTP Verification Error.", error); // for debug

      return res.status(500).json({
        success: false,
        message: error.message,
        stack: error.stack,
      })
    }
  }
)

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new ErrorHandler("Email and password is required.", 400))
  }

  const user = await User.findOne({ email, accountVerified: true }).select("+password")

  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 400))
  }

  const isPasswordMatched = await user.comparePassword(password)

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 400))
  }

  sendToken(user, 200, "User logged in successfully.", res)

})

export const adminLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (email !== "admin@rasoi.com" || password !== "123456789") {
    return next(new ErrorHandler("Invalid admin credentials.", 401));
  }

  let adminUser = await User.findOne({ email: "admin@rasoi.com" });
  if (!adminUser) {
    adminUser = await User.create({
      fullName: "Rasoi Admin",
      email: "admin@rasoi.com",
      password: "123456789",
      mobile: "9999999999",
      role: "Admin",
      accountVerified: true,
    });
  } else {
    if (adminUser.role !== "Admin") {
      return next(new ErrorHandler("Configured admin email belongs to a non-admin user.", 403));
    }
    if (!adminUser.accountVerified) {
      adminUser.accountVerified = true;
      await adminUser.save({ validateBeforeSave: false });
    }
  }

  sendToken(adminUser, 200, "Admin logged in successfully.", res);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully.",
    })
})

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  })
})

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  })

  if (!user) {
    return next(new ErrorHandler("User not found.", 404))
  }

  const resetToken = user.generateResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your Reset Password Token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

  try {
    sendEmail({
      email: user.email,
      subject: "✅ Rasoi - Reset Password",
      message,
    })

    res.status(200).json({
      success: true,
      message: `Reset password email sent to ${user.email} successfully.`
    })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new ErrorHandler(error.message ? error.message : "Cannot send reset password email.", 500)
    )
  }


})


export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex")

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired.",
        400
      )
    )
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password & Confirm password do not match", 400))
  }

  user.password = req.body.password
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();


  // Send confirmation email

  try {
    await sendEmail({
      email: user.email,
      subject: "✅ Rasoi - Password Reset Successful",
      message: `
      <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 26px; border-radius: 14px; background: linear-gradient(135deg, #ffffff, #f7fbff); box-shadow: 0 10px 25px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 600;">
          🔐 Password Reset Successful
        </h2>
        <p style="font-size: 14px; color: #777; margin-top: 6px;">
          Your Rasoi account is secure
        </p>
      </div>

      <!-- Divider -->
      <div style="height: 1px; background: #eee; margin: 20px 0;"></div>

      <!-- Greeting -->
      <p style="font-size: 16px; color: #333;">
        Hi <b>${user.name || "User"}</b> 👋,
      </p>
    
      <!-- Message -->
      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        This is a confirmation that your password has been successfully updated.  
        If this was you, no further action is needed. 🎉
      </p>
    
      <!-- Info Box -->
      <div style="background: #ffffff; border-radius: 10px; padding: 16px; margin: 22px 0; box-shadow: inset 0 2px 8px rgba(0,0,0,0.04); border-left: 4px solid #44C9EE;">
        <p style="font-size: 14px; color: #444; margin: 0; line-height: 1.6;">
          📅 <b>Date & Time:</b> ${new Date().toLocaleString()} <br>
          📧 <b>Account Email:</b> ${user.email}
        </p>
      </div>
    
      <!-- Warning -->
      <div style="background: #fff4e5; padding: 14px 16px; border-radius: 8px; border-left: 4px solid #ffa726; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; color: #8a6d3b;">
          ⚠️ If you did not request this change, please reset your password immediately and contact support.
        </p>
      </div>
    
      <!-- CTA -->
      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.FRONTEND_URL}/login" 
           style="display: inline-block; background: linear-gradient(90deg, #0096FF, #44C9EE); color: white; padding: 12px 22px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 500; box-shadow: 0 4px 10px rgba(0,150,255,0.3);">
          Login to Your Account
        </a>
      </div>
    
      <!-- Footer -->
      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 16px;">
        
        <p style="font-size: 13px; color: #888;">
          Need help?  
          <a href="${process.env.FRONTEND_URL}/support" style="color: #0096FF; text-decoration: none;">
            Contact Rasoi Support
          </a>
        </p>
    
        <p style="font-size: 13px; color: #aaa; margin-top: 10px;">
          &copy; ${new Date().getFullYear()} Rasoi. All rights reserved.
        </p>
    
        <p style="font-size: 12px; color: #aaa; margin-top: 8px;">
          This is an automated message — please do not reply.
        </p>
      </div>
    
    </div>
      `
    })
  } catch (error) {
    console.error("Error sending confirmation email: ", error)
  }
})
