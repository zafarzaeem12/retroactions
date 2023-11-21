const { Users } = require("../models/users");
const { UserReviews } = require("../models/userreviews");
const { Device } = require("../models/deviceModel");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");
const { accessTokenValidator } = require("../Utils/accessTokenValidator");
const jwt = require("jsonwebtoken");
const { Restaurants } = require("../models/restaurants");

const fs = require("fs");
const { linkUserDevice } = require("../Utils/linkUserDevice");
const { Notification } = require("../models/notification");
const { UserSubscription } = require("../models/usersubscription");
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads/images");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });
const registeradmin = async () => {
  let createuser = new Users({
    userName: "admin",
    userEmail: "retroadmin@admin.com",
    userPassword: "retroadmin",
    userStreet: "admin street",
    userLastOnline: "test",
    userSaveRestaurant: "test",
    userType: "admin",
    userSaveRestaurant: ["64d2685617daf7590e9d6968"],

    userCountry: "64dbc0bfa0227a09d0abaa53",
  });
  createuser = await createuser.save();
};
// registeradmin()
router.post("/createuser", async (req, res) => {
  try {
    const user = await Users.findOne({ userEmail: req.body.userEmail }).exec();
    if (user) {
      if (user.isDeleted) {
        const { userEmail, ...data } = req.body;
        await Users.findByIdAndUpdate(user._id, { ...data, isDeleted: false });

        return res.status(200).json({ success: true, data: user });
      }
      return res.status(400).json({
        success: false,
        message: "user already exist",
      });
    }

    let createuser = new Users({
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      userPassword: req.body.userPassword,
      userStreet: req.body.userStreet,
      userLastOnline: req.body.userLastOnline,
      userSaveRestaurant: req.body.userSaveRestaurant,

      userInterest: req.body.userInterest,
      userReview: req.body.userReview,
      userCountry: req.body.userCountry,
    });
    createuser = await createuser.save();

    let createDevice = new Device({
      deviceType: req.body.deviceType,
      deviceToken: req.body.deviceToken,
      user: createuser._id,
    });

    await createDevice.save();

    let updateDeviceId = await Users.findByIdAndUpdate(createuser._id, {
      devices: await createDevice.save()._id,
    });

    if (!createuser) {
      return res.status(400).json({
        success: false,
        message: "something went wrong",
      });
    }
    res.status(200).json({ success: true, data: updateDeviceId });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const { deviceToken, deviceType } = req.body;
    const user = await Users.findOne({
      userEmail: req.body.userEmail,
    }).populate([
      "userInterest",
      "userSaveRestaurant",
      "subscription",

      "userCountry",
      {
        path: "userReview",
        populate: {
          path: "restaurantid",
        },
      },
    ]);
    if (!user) {
      return res.status(200).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.isDeleted == true) {
      return res.status(200).json({
        message: "Your account is expired Signup again",
        success: false,
      });
    } else if (user && req.body.userPassword == user.userPassword) {
      await linkUserDevice(user._id, deviceToken, deviceType);
      // if (device.error) {
      //   return res.status(200).json({
      //     message: device.error,
      //     success: false,
      //   });

      // }

      return res.status(200).json({
        message: "login successfully",
        data: user,
        deviceToken: deviceToken,
        success: true,
      });
    } else {
      return res
        .status(200)
        .json({ message: "Incorrect email or password", success: false });
    }
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

//forget password

router.post("/forget-password", async (req, res) => {
  try {
    const { userEmail } = req.body;
    const user = await Users.findOne({
      userEmail: userEmail,
      isDeleted: false,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User dont exists with that email", success: false });
    }

    let sendedcode = Math.floor(Math.random() * 90000) + 10000;
    var token = jwt.sign({ otp: sendedcode, email: userEmail }, "secret");
    var transporter = nodemailer.createTransport({
      host: "mail.retroaction.app",
      pool: true,
      port: 465,
      secure: true,

      auth: {
        user: "support@retroaction.app",
        pass: "appraiseruser12!@#$",
      },
    });

    var mailOptions = {
      from: "support@retroaction.app",
      to: req.body.userEmail,
      subject: "Retro Action Forget Password",
      html: `<h5>Your code is ${sendedcode}</h5>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("SMTP ERROR==>", error);
      } else {
        console.log("EMAIL SENDED", info);
      }
    });

    return res.status(200).json({
      message: "Code sended to your email address",
      success: true,
      code: sendedcode,
      token,
    });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

//Verify Otp

router.post("/verifyotp", async (req, res) => {
  try {
    const { token, userOtp, userEmail } = req.body;
    var decoded = jwt.verify(token, "secret");
    // console.log(decoded.otp) // otp
    // console.log(decoded.email) // email

    if (decoded.otp == userOtp && decoded.email == userEmail) {
      var Verifytoken = jwt.sign(
        { verified: true, email: userEmail },
        "secret"
      );

      return res.status(200).json({
        message: "Otp Verified Successfully",
        success: true,
        token: Verifytoken,
      });
    } else {
      return res.status(200).json({
        message: "Invalid Otp",
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ success: false, message: err.message });
  }
});

//change or reset password
router.put(
  "/changepassword",

  async (req, res) => {
    try {
      const { userEmail, userPassword, token } = req.body;
      var decoded = jwt.verify(token, "secret");

      if (decoded.verified == true && decoded.email == userEmail) {
        let updateduser = await Users.findOneAndUpdate(
          { userEmail: userEmail, isDeleted: false },
          {
            userPassword: userPassword,
          },
          { new: true }
        );
        if (!updateduser) {
          return res
            .status(400)
            .json({ message: "not updated", success: false });
        }
        return res.status(200).json({
          message: "password updated",
          success: true,
          data: updateduser,
        });
      } else {
        res.status(200).json({ success: false, message: err.message });
      }

      // let checkuserexist = await Users.findOneAndUpdate({ userEmail: req.body.userEmail });
    } catch (err) {
      res.status(200).json({ success: false, message: err.message });
    }
  }
);

router.get(
  "/getuser",

  async (req, res) => {
    try {

            let getuser = await Users.find({ userType: { $ne: "admin" } })

        .sort({ usersCreatedOn: -1 })
        .populate([
          "userInterest",
          "userSaveRestaurant",
          "subscription",

          "userCountry",
          {
            path: "userReview",
            populate: {
              path: "restaurantid",
            },
          },
        ]);

      if (!getuser) {
        return res.status(400).json({
          success: false,
          message: "something went wrong",
        });
      }
      res.status(200).json({ success: true, data: getuser });
    } catch (err) {
      res.status(200).json({ success: false, message: err.message });
    }
  }
);

router.get(
  "/getuserbyid/:id",

  async (req, res) => {
    try {
      let getuserbyid = await Users.findById(req.params.id).populate([
        "userInterest",
        "userSaveRestaurant",
        "subscription",
        "userCountry",
        {
          path: "userReview",
          populate: {
            path: "restaurantid",
          },
        },
      ]);
      if (!getuserbyid) {
        return res.status(400).json({
          success: false,
          message: "something went wrong",
        });
      }
      res.status(200).json({ success: true, data: getuserbyid });
    } catch (err) {
      res.status(200).json({ success: false, message: err.message });
    }
  }
);

router.put("/updateuserbyid/:id", async (req, res) => {
  try {
    const { userEmail, ...body } = req.body;

    let updateuserbyid = await Users.findByIdAndUpdate(
      req.params.id,
      {
        ...body,
      },
      { new: true }
    );
    if (!updateuserbyid) {
      return res.status(400).json({
        success: false,
        message: "something went wrong",
      });
    }
    const user = await Users.findOne({
      userEmail: updateuserbyid.userEmail,
    }).populate([
      "userInterest",
      "userSaveRestaurant",
      "subscription",

      "userCountry",
      {
        path: "userReview",
        populate: {
          path: "restaurantid",
        },
      },
    ]);

    console.log(user);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});
//updateuser by save restaurant

router.put("/updateuserbyrestaurant/:id", async (req, res) => {
  try {
    const updateuserbyrestaurant = await Users.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          userSaveRestaurant: req.body.restaurantId,
        },
      },
      { new: true }
    );
    if (!updateuserbyrestaurant) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }
    res.status(200).json({ data: true, data: updateuserbyrestaurant });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
  // res.status(200).json({ data: true, data: req.body.restaurantId })
});

//update user by reviews

router.put("/updateuserbyreviews/:id", async (req, res) => {
  try {
    // res.status(200).json({ data: true, data: req.body.restaurantId })

    const updateuserbyreviews = await Users.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          userReview: req.body.userReviewsid,
        },
      },
      { new: true }
    );
    if (!updateuserbyreviews) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }
    res.status(200).json({ data: true, data: updateuserbyreviews });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

//HARDDELETE USER;

router.delete("/deleteuserbyid/:id", async (req, res) => {
  try {
    await UserReviews.deleteMany({ userid: req.params.id });
    await Notification.updateMany(
      { userid: { $in: req.params.id } },
      { $pull: { userid: req.params.id } }
    );
    await UserSubscription.deleteMany({ user: req.params.id });
    let deleteuserbyid = await Users.findByIdAndDelete(req.params.id);
    if (!deleteuserbyid) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }
    res.status(200).json({ success: true, data: deleteuserbyid });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

router.put(
  "/profileimage/:id",
  uploadOptions.single("userImage"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).send("No image in the request");

      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/images/`;

      let profileimage = await Users.findByIdAndUpdate(
        req.params.id,
        {
          userImage: `${basePath}${fileName}`,
        },
        { new: true }
      );

      profileimage = await profileimage.save();

      if (!profileimage) {
        return res.sendStatus(400).json({
          success: false,
          message: "image not create",
        });
      }
      res.send({
        success: true,
        message: "Image saved",
        data: profileimage,
      });
    } catch (err) {
      res.status(200).json({ success: false, message: err.message });
    }
  }
);

//count user

router.get("/countuser", async (req, res) => {
  try {
    let countuser = await Users.estimatedDocumentCount();

    if (!countuser) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }
    res.status(200).json({
      success: true,
      countuser: countuser,
    });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

router.post("/socialregister", async (req, res) => {
  try {
    const { accessToken, socialType, deviceToken, deviceType } = req.body;

    try {
      switch (socialType) {
        case "facebook": {
          const checkUser = await Users.findOne({
            userEmail: accessToken.userEmail,
          });

          if (checkUser) {
            const user = await Users.findOne({
              userEmail: req.body.accessToken.userEmail,
            }).populate([
              "userInterest",
              "userSaveRestaurant",
              "subscription",

              "userCountry",
              {
                path: "userReview",
                populate: {
                  path: "restaurantid",
                },
              },
            ]);
            await linkUserDevice(user._id, deviceToken, deviceType);

            res.status(200).json({
              message: "login successfully",
              data: user,
              success: true,
            });
          } else {
            let createuser = new Users({
              userName: req.body.accessToken.userName,
              userEmail: req.body.accessToken.userEmail,
              userImage:
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            });
            createuser = await createuser.save();
            if (!createuser) {
              return res.status(400).json({
                success: false,
                message: "something went wrong",
              });
            }
            await linkUserDevice(createuser._id, deviceToken, deviceType);

            return res.status(200).json({
              success: true,
              data: createuser,
              message: "User Signup Successfull",
            });
          }
        }
        case "google": {
          const { hasError, message, data } = await accessTokenValidator(
            accessToken,
            socialType
          );

          if (hasError) {
            return res.status(400).send({
              status: 0,
              message: message,
            });
          }

          const { name, image, email } = data;

          // const checkUser = await Users.findOne({
          //   userEmail: email,
          // });

          const checkUser = await Users.findOne({
            userEmail: email,
          }).populate([
            "userInterest",
            "userSaveRestaurant",
            "subscription",

            "userCountry",
            {
              path: "userReview",
              populate: {
                path: "restaurantid",
              },
            },
          ]);

          if (!checkUser) {
            let createuser = new Users({
              userName: name,
              userEmail: email,
              userImage:
                image == ""
                  ? "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  : "https://" + req.headers.host + "/" + image,
            });
            createuser = await createuser.save();

            if (!createuser) {
              return res.status(400).json({
                success: false,
                message: "something went wrong",
              });
            }
            await linkUserDevice(createuser._id, deviceToken, deviceType);

            return res.status(200).json({
              success: true,
              data: createuser,
              message: "User Signup Successfull",
            });
          } else {
            if (
              "https://" + req.headers.host + "/" + image !=
              checkUser.userImage
            ) {
              fs.unlink(checkUser.userImage.split("/")[1], (err, dat) => {});

              await Users.findOneAndUpdate(
                { userEmail: email },
                {
                  userImage:
                    image == ""
                      ? "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      : "https://" + req.headers.host + "/" + image,
                }
              );
            }

            const user = await Users.findOne({
              userEmail: email,
            }).populate([
              "userInterest",
              "userSaveRestaurant",
              "subscription",

              "userCountry",
              {
                path: "userReview",
                populate: {
                  path: "restaurantid",
                },
              },
            ]);

            await linkUserDevice(user._id, deviceToken, deviceType);

            return res.status(200).send({
              status: 1,
              message: "User login Successfully",
              data: user,
            });
          }
        }
        case "apple": {
          const checkUser = await Users.findOne({
            userEmail: accessToken.userEmail,
          });

          if (checkUser) {
            const user = await Users.findOne({
              userEmail: req.body.accessToken.userEmail,
            }).populate([
              "userInterest",
              "userSaveRestaurant",
              "subscription",

              "userCountry",
              {
                path: "userReview",
                populate: {
                  path: "restaurantid",
                },
              },
            ]);
            await linkUserDevice(user._id, deviceToken, deviceType);

            res.status(200).json({
              message: "login successfully",
              data: user,
              success: true,
            });
          } else {
            let createuser = new Users({
              userName: req.body.accessToken.userName,
              userEmail: req.body.accessToken.userEmail,
              userImage:
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            });
            createuser = await createuser.save();
            await linkUserDevice(createuser._id, deviceToken, deviceType);

            if (!createuser) {
              return res.status(400).json({
                success: false,
                message: "something went wrong",
              });
            }
            return res.status(200).json({
              success: true,
              data: createuser,
              message: "User Signup Successfull",
            });
          }
        }
        default: {
        }
      }
    } catch (e) {
      res.status(400).send({ status: 0, message: e.message });
    }
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});
router.patch("/acceptRequest/:id", async (req, res, next) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user.userType === "admin") {
      return res.status(400).json({
        success: false,
        message: "Only admin can perform this operation!",
      });
    }
    const restaurant = await Restaurants.findByIdAndUpdate(
      req.body.restaurantId,
      { $set: { status: "approved" } },
      { new: true }
    );

    var transporter = nodemailer.createTransport({
      host: "mail.retroaction.app",
      pool: true,
      port: 465,
      secure: true,

      auth: {
        user: "support@retroaction.app",
        pass: "appraiseruser12!@#$",
      },
    });

    var mailOptions = {
      from: "support@retroaction.app",
      to: restaurant?.restaurantEmail,
      subject: "Retro Action Your request has been approved",
      html: `<h5>Your request has been approved</h5>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("SMTP ERROR==>", error);
      } else {
        console.log("EMAIL SENDED", info);
      }
    });

    return res.status(200).json({
      success: true,
      message:"restaurant approved successfully",
      data: restaurant,
    });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

router.patch("/rejectRequest/:id", async (req, res, next) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user.userType === "admin") {
      return res.status(400).json({
        success: false,
        message: "Only admin can perform this operation!",
      });
    }

    const restaurant = await Restaurants.findByIdAndUpdate(
      req.body.restaurantId,
      { $set: { status: "rejected" } },
      { new: true }
    );

    var transporter = nodemailer.createTransport({
      host: "mail.retroaction.app",
      pool: true,
      port: 465,
      secure: true,

      auth: {
        user: "support@retroaction.app",
        pass: "appraiseruser12!@#$",
      },
    });

    var mailOptions = {
      from: "support@retroaction.app",
      to: restaurant?.restaurantEmail,
      subject: "Retro Action Your request has been rejected",
      html: `<h5>Your request has been rejected</h5>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("SMTP ERROR==>", error);
      } else {
        console.log("EMAIL SENDED", info);
      }
    });

    return res.status(200).json({
      success: true,
      message:"Restaurant request rejected",
      data: restaurant,
    });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

module.exports = router;
