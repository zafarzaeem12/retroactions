// const { Restaurants } = require("../models/restaurants");
const { Restaurants } = require("../models/restaurants");
const { Restaurants_Promo } = require("../models/restaurentpromo");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Announcements } = require("../models/announcements");
const { Users } = require("../models/users");
const fs = require("fs");
const path = require('path')
const Joi = require("joi");
const moment = require('moment')
const nodemailer = require("nodemailer");
var mongoose = require("mongoose");
const { push_notifications } = require('../Utils/push_notification');
const { WebNotification } = require('../Utils/web_notifications');
const liveUrl = 'https://retroactionapi-dev.thesuitchstaging.com:3005/'
const {
  restaurantBodyUpdateValidator,
  restaurantFilesUpdateValidator,
} = require("../Utils/validators/restaurantValidators");

const { Notification } = require("../models/notification");



const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  // "video/mp4": "mp4",
  // "video/quicktime": "mov",
};

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      console.log("1");
      cb(null, "public/uploads/images");
    }
    // else if (file.mimetype.startsWith("video/")) {
    //   console.log("2");

    //   cb(null, "public/uploads/videos");
    // }
    else {
      console.log("============================");
      // cb(new Error("Invalid file type"));
    }
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    console.log(file.mimetype);
    const extension = FILE_TYPE_MAP[file.mimetype];
    if (!extension) {
      console.log("============================");

      cb(new Error("Unsupported file type"));
    }
    console.log(`${Date.now()}-${fileName}`);
    cb(null, `${Date.now()}-${fileName}`);
  },
});

const upload = multer({ storage: storage });

// for file page
router.get('/get-html',(req,res,next) => {
    const htmlPath = path.join(__dirname, 'index.html');
    res.sendFile(htmlPath);
})

//register resturant
router.post(
  "/registerRestaurants",
  upload.fields([{ name: "restaurantImage", maxCount: 1 }]),
  async (req, res) => {
    try {
      console.log(req.files);
      const register = await Restaurants.findOne({
        restaurantEmail: req.body.restaurantEmail,
      }).exec();

      if (register) {
        return res.status(200).json({
          success: false,
          message: "email already exist",
        });
      }
      const imageFile = req.files
        ? req.files.restaurantImage[0].path.replace(/\\/g, "/")
        : null;

      // if (!imageFile) return res.status(400).send("No image in the request");

    //   if (imageFile) {
    //     return restaurantImage = imageFile.filename;
    //   }
    
    function generateSixDigitNumber() {
              const min = 100000;
              const max = 999999;
              return Math.floor(Math.random() * (max - min + 1)) + min;
            }

      let createRestaurants = new Restaurants({
        restaurantName: req.body.restaurantName,
        restaurantDescription: req.body.restaurantDescription,
        restaurantStreet: req.body.restaurantStreet,
        restaurantInterest: req.body.restaurantInterest,
        // restaurantRating: req.body.restaurantRating,
        // restaurantReviews: req.body.restaurantReviews,
        // restaurantCountry: req.body.restaurantCountry,
        // restaurantCity: req.body.restaurantCity,
        // restaurantZip: req.body.restaurantZip,
        restaurantImage: req.files ? req.files.restaurantImage[0].path.replace(/\\/g, "/") : null,
        restaurantEmail: req.body.restaurantEmail,
        restaurantPassword: req.body.restaurantPassword,
        otp_code : generateSixDigitNumber(),
        otp_type : "signup"
      });
      createRestaurants = await createRestaurants.save();

      if (!createRestaurants) {
        return res
          .status(400)
          .json({ success: false, message: "something went wrong" });
      }

         let createnotification = await Notification({
           title: `Restaurant`,
           subtitle: `New Restaurant created.`,
           notificationtype: "restaurant",
           toallUser: true,
         });
         createnotification = await createnotification.save();

         let items =  await Users.findOne({userType:"admin"}).populate('devices')
        if(items.notificationStatus === true){
          items.devices.map(async(data) => {
            await WebNotification({
              deviceToken: `${data.deviceToken}`,
              title: "New Restuarant shared request",
              body: `${req.body.restaurantName} has been added `,
            })
          })
        }
      res.status(200).json({
        success: true,
        data: createRestaurants,
        message:
          "You have successfully register now please for admin to verify your account",
      });
    } catch (err) {
        console.log("====>",err)
      res.status(200).json({ success: false, message: err.message });
    }
  }
);

// verify otp restuarent

router.put('/verify-otp',async (req,res,next) => {
    try{
        const {restaurantEmail , otp_code} = req.body;
        const checkOtp = await Restaurants.findOne({restaurantEmail : restaurantEmail});
        if(otp_code === checkOtp.otp_code){
            await Restaurants.updateOne(
                {_id : checkOtp._id.toString() },
                {$set:{otp_status : true}},
                {new : true});
                
                return res.status(200).send({
                    message:"OTP verified",
                    status: 1
                })
        }else{
             return res.status(200).send({
                    message:"OTP not verified",
                    status: 0
                })
        }
        
    }catch(err){
        res.status(500).send({
                    message:" no OTP found",
                    status: 0
                })
    }
})

// admin approval
router.put("/admin-permission/:admin_id/restaurant/:restaurant_id" , async (req,res) => {
  
    const { admin_id  , restaurant_id} = req.params
    const { status } = req.body
    try{
    const restuarent = await Restaurants.findOne({_id : restaurant_id})
    const checkAdmin = await Users.findOne( {$and:[{_id : admin_id} , {userType : "admin"}]});
    if(!checkAdmin){
        return res.status(200).send({ message : "you are not admin", status : 0});
    }
    if(restuarent.otp_status === true && status === "approved"){
        await Restaurants.updateOne({_id : restaurant_id},{$set : {status : status}},{new : true})
       return res.status(200).send({ message : "Restuarent requested accepted" , status : 1})
           var transporter = nodemailer.createTransport({
    //   host: "smtp.gmail.com",
     host: "mail.retroaction.app",
      pool: true,
      port: 465,
      secure: true,

      auth: {
       // user: "zafarzaeem629@gmail.com",
        // pass: "qyxrvlrzzwwungkc",
        //  user: "support@retroaction.app",
        // pass: "appraiseruser12!@#$",
      },
    });

    var mailOptions = {
      from: "support@retroaction.app",
      to: `${restuarent.restaurantEmail}`,
      subject: "Retro Action request for Restaurent",
      html: `Dear ${restuarent.restaurantName} your requeste Approved successfully`,
    };
   
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("SMTP ERROR==>", error);
      } else {
        console.log("EMAIL SENDED", info);
      }
    });
        
    }
    else if(restuarent.otp_status === true && status === "rejected"){
        await Restaurants.updateOne({_id : restaurant_id},{$set : {status : status}},{new : true})
        await Restaurants.deleteOne({_id : restaurant_id});
         return   res.status(200).send({ message : "Restuarent requested rejected" , status : 1})
              var transporter = nodemailer.createTransport({
    //   host: "smtp.gmail.com",
     host: "mail.retroaction.app",
      pool: true,
      port: 465,
      secure: true,

      auth: {
        // user: "zafarzaeem629@gmail.com",
        // pass: "qyxrvlrzzwwungkc",
        //  user: "support@retroaction.app",
        // pass: "appraiseruser12!@#$",
      },
    });

    var mailOptions = {
      from: "support@retroaction.app",
      to: `${restuarent.restaurantEmail}`,
      subject: "Retro Action request for Restaurent",
      html: `Dear ${restuarent.restaurantName} your requeste Rejected conatact admin`,
    };
   
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("SMTP ERROR==>", error);
      } else {
        console.log("EMAIL SENDED", info);
      }
    });
    
    }
    }catch(err){
         res.status(500).send({ message : "not Restuarent requested" , status : 0})
    }
})
// forget password
router.post('/forget-password', async (req,res,next)=>{
    try{
        const {restaurantEmail}  = req.body;
        const checkRest = await Restaurants.findOne({restaurantEmail : restaurantEmail});
        if(checkRest.restaurantEmail == restaurantEmail){
            await Restaurants.updateOne(
                {_id :checkRest._id },
                {$set:{ 
                    otp_type : "forget-password",
                    otp_status : false,
                    otp_code :  Math.floor((Math.random()*1000000)+1)
                    
                }},
                {new : true})
                
                return res.status(200).send({
                    message:"OTP has been sent you on email",
                    status :1
                })
        }else{
             return res.status(200).send({
                    message:"NO OTP has been sent",
                    status :0
                })
        }
        
        
        
    }catch(err){
         res.status(500).send({
                    message:"no OTP found",
                    status :0
                })
    }
})
// change password
router.put('/change-password', async(req,res,next) => {
    try{
        const {restaurantEmail , otp_type , restaurantPassword } = req.body 
        const checkResturent = await Restaurants.findOne({restaurantEmail : restaurantEmail });
        
        if(otp_type == "forget-password"  && checkResturent.otp_type == "forget-password"){
            console.log("wait")
            await Restaurants.updateOne(
                {_id : checkResturent._id.toString()},
                {$set : { restaurantPassword : restaurantPassword}},
                {new : true}
                );
                
                return res.status(200).send({message : "your password change successfully" , status  :1})
        }else{
            console.log("not-wait")
                return res.status(200).send({message : "your password not change" , status  :0})
        }
        
    }catch(err){
        res.status(500).send({message : "no data found" , status  :0})
    }
})

// login api
router.post("/loginrestaurant", async (req, res) => {
  try {
     const {restaurantEmail,restaurantPassword } = req.body
    let restaurant = await Restaurants.findOne({
      restaurantEmail: restaurantEmail
    });
    
     if(!restaurant){
        return res.status(200).send({ message : "restaurtant email is not correct",status:0})
    }
    
    if(restaurant.restaurantPassword !== restaurantPassword){
        return res.status(200).send({ message : "restaurtant password is not correct",status:0})
    }
    
    if (restaurant.status === "pending") {
      return res.status(200).send({
        success: false,
        message: "Sorry Your request has not been approved yet!",
      });
    }
    else if (restaurant.status === "rejected") {
      return res.status(400).send({
        success: false,
        message: "Sorry Your request has been rejected by admin!",
      });
    }
    else if (
      restaurant &&
      restaurantEmail == restaurant.restaurantEmail &&
      restaurantPassword == restaurant.restaurantPassword &&
      restaurant.status === "approved"
    ) {
      return res.status(200).send({
        success: true,
        message: "login succesfully",
        data: restaurant,
      });
    }
  } catch (err) {
    return res.status(500).send({ success: false, message: err.message });
  }
});

//get Restaurants
// get all resturent api
router.get("/getRestaurants", async (req, res) => {
  try {
    let getRestaurants = await Restaurants.find()
      // .populate("restaurantCountry")
      .sort({ restaurantCreatedOn: -1 });
    if (!getRestaurants) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }
    console.log("getRestaurants",getRestaurants)
    res.status(200).json({ success: true, data: getRestaurants });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

router.get("/user/getRestaurants", async (req, res) => {
  try {
    const { id } = req.query;
    const userData = await Users.findById(id).populate("subscription");
    let getinterestRestaurants = await Restaurants.aggregate([
          {
            $match: {
              restaurantInterest: { $in: userData.userInterest }
            }
          },
          {
            $lookup: {
              from: "interests",
              localField: "restaurantInterest",
              foreignField: "_id",
              as: "restaurantInterest"
            }
          },
           {
        $unset :  "restaurantPromo"
      },
          {
            $sort: {
              restaurantCreatedOn: -1
            }
          }
        ]);
    let getnotinterestRestaurants = await Restaurants.aggregate([
      {
        $match: {
          restaurantInterest: { $nin: userData.userInterest }
        }
      },
      {
        $lookup: {
          from: "interests",
          localField: "restaurantInterest",
          foreignField: "_id",
          as: "restaurantInterest"
        }
      },
      {
        $unset :  "restaurantPromo"
      },
      {
        $sort: {
          restaurantCreatedOn: -1
        }
      }
    ]);

    const data = [...getinterestRestaurants, ...getnotinterestRestaurants];
    if (userData?.subscription == null) {
      // if (userData.viewrest == 5) {
      //     return res.status(400).json({ success: false, message: "You have to buy subscriptions for new restaurants" })
      // }

      // if (!getRestaurants[userData.viewrest]) {
      //     return res.status(400).json({ success: false, message: "something went wrong" })
      // }
      // await Users.findByIdAndUpdate(id, { $inc: { viewrest: 1 } })

      return res.status(200).json({ success: true, data: data.slice(0, 5) });
    } else {
      if (data.length == 0) {
        return res
          .status(400)
          .json({ success: false, message: "No any restaurant yet" });
      }

      res.status(200).json({ success: true, data: data });
    }
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

//get Restaurants by id

router.get("/getRestaurantsbyid/:id", async (req, res) => {
  try {
    let getRestaurantsbyid = await Restaurants.findById(req.params.id);
    // .populate(
    //   "restaurantCountry"
    // );
    let announcement = await Announcements.find({
      announcementRestaurants: req.params.id,
    });
    if (!getRestaurantsbyid) {
      return res
        .status(400)
        .json({ success: false, message: "resturant not get by id" });
    }
    res.status(200).json({
      success: true,
      data: { ...getRestaurantsbyid._doc, announcement },
    });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

//update Restaurants by id

router.patch(
  "/updateRestaurants/:id",
  upload.fields([
    { name: "restaurantImage", maxCount: 1 },
    // { name: "restaurantVideo", maxCount: 2 },
    { name: "restaurantPortfolio", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      // console.log(req.files);
      // console.log(req.files);
      // const { body } = req;

      const { error } = await restaurantBodyUpdateValidator.validateAsync(
        req.body
      );
      const error2 = (
        await restaurantFilesUpdateValidator.validateAsync(req.files)
      )?.error;
      if (error || error2) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message || error2.details[0].message });
      }

      req.body = Object.fromEntries(
        Object.entries(req.body).filter(([_, v]) => v != null || v != "")
      );      // console.log(req.body);
      const restaurant = await Restaurants.findById(req.params.id);

      if (restaurant?.status === "pending") {
        return res
          .status(400)
          .json({ success: false, message: "You have not been approved yet!" });
      }
      // console.log(req.files);

      if (req.body["deleteImages"] && req.body["deleteImages"].length > 0) {
        req.body["deleteImages"].map((items, i) => {
          fs.unlink("public/uploads/images/" + items, (err) => {
            // console.log(err);
            restaurant.restaurantPortfolio.slice(restaurant.restaurantPortfolio.indexOf(items), 1)
          });
          if (!req.body["deleteImages"][i + 1]) {
            req.body.restaurantPortfolio = restaurant.restaurantPortfolio
          }
          // await restaurant.deleteOne({});
        });

      } else {
        req.body.restaurantPortfolio = restaurant.restaurantPortfolio

      }


      if (req.files) {
        if (
          req.files["restaurantImage"] &&
          req.files["restaurantImage"].length > 0
        ) {
          if (restaurant.restaurantImage) {
            fs.unlink(
              "public/uploads/images/" + restaurant.restaurantImage,
              (err) => {
                console.log(err);
              }
            );
          }
          req.body.restaurantImage = req.files["restaurantImage"][0].filename;
        }



        if (
          req.files["restaurantPortfolio"] &&
          req.files["restaurantPortfolio"].length > 0
        ) {
          // if (
          //   typeof req.body.restaurantPortfolio == 'string' ||
          //   typeof req.body.restaurantPortfolio == ""
          // ) {
          //   req.body.restaurantPortfolio = JSON.parse(
          //     req.body.restaurantPortfolio
          //   );
          // }
          // if (req.body.restaurantPortfolio?.length > 0) {
          //   req.body.restaurantPortfolio.map((item) => {
          //     restaurant.restaurantPortfolio.splice(
          //       restaurant.restaurantPortfolio.indexOf(item),
          //       1
          //     );
          //     fs.unlink("public/uploads/images/" + item);
          //   });
          // }

          req.body.restaurantPortfolio = [
            ...req.files["restaurantPortfolio"].map((item) => {
              return item.filename;
            }),
            ...req.body.restaurantPortfolio

          ];
        }

      }
      // console.log(req.body.restaurantVideo);
      // if (
      //   req.files["restaurantPortfolio"] &&
      //   req.files["restaurantPortfolio"].length > 0
      // ) {

      // const deletePortfolioImages = [...req.body.deleteImages];

      // if (
      //   req.body["restaurantPortfolio"] &&
      //   req.body["restaurantPortfolio"].length > 0
      //   // restaurant.restaurantPortfolio.length > 0
      // ) {
      //   const lgth = req.body["restaurantPortfolio"].length;
      //   for (let i = 0; i < lgth; i++) {
      //     fs.unlink(
      //       "public/uploads/images/" + deletePortfolioImages[i],
      //       (err) => {
      //         console.log(err);
      //       }
      //     );
      //   }
      // restaurant.restaurantPortfolio.map((item) => {
      //   fs.unlink("public/uploads/images/ " + item.filename)
      // })
      // }
      // req.body.restaurantPortfolio = [
      //   ...req.files["restaurantPortfolio"].map((item) => {
      //     return item.filename;
      //   }),
      //   ...restaurant.restaurantPortfolio,
      // ];
      //   if (
      //     typeof req.body.deletePortfolio == "string" ||
      //     typeof req.body.deletePortfolio == "string"
      //   ) {
      //     req.body.deletePortfolio = JSON.parse(req.body.deletePortfolio);
      //   }
      //   if (req.body.deletePortfolio?.length > 0) {
      //     req.body.deletePortfolio.map((item) => {
      //       restaurant.restaurantPortfolio.splice(
      //         restaurant.restaurantPortfolio.indexOf(item),
      //         1
      //       );
      //       fs.unlink("public/uploads/images/" + item);
      //     });
      //   }

      // req.body.restaurantPortfolio = [
      //   ...req.files["restaurantPortfolio"].map((item) => {
      //     return item.filename;
      //   }),
      //   ...restaurant.restaurantPortfolio,
      // ];
      // }
      // console.log(req.body.restaurantPortfolio);
      // const imageFile = req?.files?["restaurantImage"]
      //   ? req?.files["restaurantImage"][0]
      //   : null;
      // const videoFile = req?.files?.["restaurantVideo"] || [];
      // console.log("video file", videoFile);

      // Delete old image and video files before saving new ones
      // deleteOldFiles("public/uploads/images");
      // deleteOldFiles("public/uploads/videos");

      // if (imageFile) {
      //   var restaurantImage = `/uploads/images/${imageFile.filename}`;
      // }

      // if (videoFile?.length > 0) {
      //   var restaurantVideo = videoFile.map(
      //     (videos) => `/uploads/videos/${videos.filename}`
      //   );
      // }

      // console.log(restaurantVideo);

      let updateRestaurants = await Restaurants.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true }
      );
      if (!updateRestaurants) {
        return res
          .status(400)
          .json({ success: false, message: "something went wrong" });
      }
      res.status(200).json({ success: true, data: updateRestaurants });
      // function deleteOldFiles(directory) {
      //   fs.readdir(directory, (err, files) => {
      //     if (err) {
      //       console.error(`Error reading directory: ${err}`);
      //       return;
      //     }

      //     for (const file of files) {
      //       fs.unlinkSync(`${directory}/${file}`);
      //       console.log(`Deleted file: ${file}`);
      //     }
      //   });
      // }
    } catch (err) {
      console.log(err);
      res.status(200).json({ success: false, message: err.message });
    }
  }
);

//delete Restaurants by id

router.delete("/deleteRestaurants/:id", async (req, res) => {
  try {
    let deleteRestaurants = await Restaurants.findByIdAndDelete(req.params.id);
    if (!deleteRestaurants) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }
    res.status(200).json({ success: true, data: deleteRestaurants });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});

//count restaurants

router.get("/countrestaurant", async (req, res) => {
  try {
    let countrestaurant = await Restaurants.estimatedDocumentCount();

    if (!countrestaurant) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }
    res.status(200).json({
      success: true,
      countrestaurant: countrestaurant,
    });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
});



// resturant owner promo code

    
router.post("/createpromo_code/:restaurant_id",
upload.fields([
{ name: "itemImage", maxCount: 1 } , 
{ name: "dealImage", maxCount: 1 }
]),

 async (req,res,next) => {
  const { restaurant_id } = req.params
  
  try{
    const checkResturantowner = await Restaurants.findOne( {$and :[{ _id : restaurant_id} , { status : "approved"}]} );
    if(!checkResturantowner){
      return res.status(404).send({ message : 'you are not Restuarent Owner'})
    }
    const promo_rest = await Restaurants.findOne({_id : restaurant_id})

    const {
       promo_code_discount , promo_code_limit , promo_code_validity ,
        promo_code_type ,itemName ,  dealName ,promo_description
      } = req.body

      let iop;

      if (promo_code_type === 'deal') {
        let uii = JSON.parse(dealName);
        iop = Object.values(uii);
      }
  
      const newPromo = new Restaurants_Promo({
        promo_code: "Reto" + "_" + Math.random().toString(36).slice(2),
        promo_activation_code : Math.floor((Math.random()*1000000)+1),
        promo_description : promo_description,
        promo_code_limit: promo_code_limit,
        promo_code_discount: promo_code_discount,
        restaurantsName: promo_rest.restaurantName,
        generatedBy: promo_rest._id.toString(),
        promo_code_validity: moment(promo_code_validity).format('YYYY-MM-DDThh:mm A'),
        promo_code_type: promo_code_type,
        itemName: promo_code_type === 'item' ? itemName : null,
        itemImage: promo_code_type === 'item' ? req.files.itemImage[0].path.replace(/\\/g, "/") : null,
        dealName: promo_code_type === 'deal' && iop ? iop.map((data) => ({ name: data.name })) : null,
        dealImage: promo_code_type === 'deal' ? req.files.dealImage[0].path.replace(/\\/g, "/") : null
      });
        
  const createPromo = await newPromo.save()

console.log("createPromo",createPromo)

  let createannouncements = new Announcements({
    announcementType : 'promo-code',
    announcementRestaurants : restaurant_id
  });
  await createannouncements.save();
  
  await Restaurants_Promo.updateOne({_id : createPromo._id},{$set : {announcement_id : createannouncements._id}},{new : true});


  await Restaurants.updateOne(
    {_id : createPromo.generatedBy} , 
    {$push: {restaurantPromo :createPromo._id }} , 
    {new : true}
    )
  await Restaurants.updateOne(
      {_id : createPromo.generatedBy},
      {$set : {restaurantdescrition : promo_description }},
      {new : true})
      
         let createnotification = await Notification({
                title: `Annoucement`,
                subtitle: `New Announcement created.`,
                notificationtype: 'announcement',
                toallUser: true
            })
            createnotification = await createnotification.save();
            [...await Users.find({}).populate("devices")].map((item) => {
                if (item.notificationStatus) {
                    item.devices.map(async (item2) => {
                        await push_notifications({
                            deviceToken: item2.deviceToken,
                            title: `${promo_rest.restaurantName}`,
                            body : `${promo_rest.restaurantName}New Announcement: Promo code been added`
                            // body: createPromo.promo_code_type === 'wholeRestuarent' ? 
                            // `${promo_rest.restaurantName}New Announcement: Promo code been added` : createPromo.promo_code_type === 'item' ? 
                            // `${liveUrl}${createPromo.itemImage} ${promo_rest.restaurantName}New Announcement: Promo code been added` : createPromo.promo_code_type === 'deal' ?
                            // `${liveUrl}${createPromo.dealImage} ${promo_rest.restaurantName}New Announcement: Promo code been added` : null
                        });
                    })

                }
            }
            )
            if (!createnotification) {
                return res.status(200).json({ success: false, message: "something went wrong" })
            }
      
  res.status(201).send({
    message : "Promo-Code generated Successfully",
    status : 1,
    data : createPromo
  })
  }catch(err){
    console.log(err)
    res.status(500).send({ message : "no promo code found"})
  }
})
// use promo code api
router.post("/user-promo/:id" , async(req,res,next) => {
  try{
    const { usedBy  , promo_activation_code } = req.body
    const { id } = req.params
const check_user_subscription =  await Users.findOne( {$and : [{ _id : usedBy  } , { is_subscripted : true }] })
    if(!check_user_subscription){
      return res.status(404).send({ message : "you are not subscribed user"})
    }
    const check = await Restaurants_Promo.findById({_id : id})

    const newUser = usedBy.map(data => data.toString())
    const dbuser = check.usedBy.map(data => data.userid.toString())
    const currentDateTime = moment();

    if(check.promo_code_limit <= 0){
      await Restaurants_Promo.updateOne({_id : check._id} , {is_promo_code_disable : true } , { new : true})
      return res.status(404).send({ message : "Promo Limit exceed"})
    }
    else if (newUser.pop() ==  dbuser.pop()){
      return res.status(404).send({ message : "you have already use this promo code"})
    }
    else if(currentDateTime.format('YYYY-MM-DDThh:mm A') >= check.promo_code_validity){
      await Restaurants_Promo.updateOne({_id : check._id} , {is_promo_code_disable : true } , { new : true})
      return res.status(404).send({ message : "promo code expired"})
    }else if(check.promo_activation_code != promo_activation_code ){
        return res.status(404).send({ message : "Promo code not matched"})
    }
    else{
      const checkrest = await Restaurants_Promo.findByIdAndUpdate(
          id ,
         {
           $push : { usedBy : { userid :  usedBy} },
           $set :{ promo_code_limit : Number(check.promo_code_limit) - 1 }}, 
         {new : true}
         )
         console.log("------",usedBy.map(data => data.toString()))
          await Users.findByIdAndUpdate({_id : usedBy.map(data => data.toString())},{$push: {restaurantPromo : checkrest._id}},{new : true})
        return  res.status(200).send({
           message : "Promo uses",
           status : 1,
           data : checkrest
         })

    }
  }catch(err){
      console.log(err)
    res.status(500).send({
      message : "no Promo uses",
      status : 0
    })
  }
})
// promo details
router.get('/promo-user-detail/:restaurant_id' ,async (req,res,next) => {
  const id = new mongoose.Types.ObjectId(req.params.restaurant_id)
  try{
    const data = [
      {
        '$match':{
          'generatedBy' : id
        }
      },
      {
        '$lookup': {
          'from': 'users', 
          'localField': 'usedBy.userid', 
          'foreignField': '_id', 
          'as': 'userDetails'
        }
      }, {
        '$project': {
          'promo_code': 1, 
          'promo_code_limit': 1, 
          'promo_code_discount': 1, 
          'restaurantsName': 1, 
          'is_promo_code_disable': 1, 
          'promo_code_validity': 1, 
          'generatedBy' : 1,
          'usedBy': '$userDetails'
        }
      }, {
        '$unset': [
          'usedBy.userPassword', 'usedBy.devices', 'usedBy.viewrest', 'usedBy.userStreet', 'usedBy.userLastOnline', 'usedBy.userSaveRestaurant', 'usedBy.userCountry', 'usedBy.userReview', 'usedBy.userType', 'usedBy.notificationStatus', 'usedBy.isDeleted', 'usedBy.is_subscripted', 'usedBy.subscription', 'usedBy.__v', 'usedBy.userInterest', 'usedBy.usersCreatedOn'
        ]
      }
    ]

    const promoDetails = await Restaurants_Promo.aggregate(data)
    res.status(200).send({
      total : promoDetails.length,
      message : "Promo Data Fetched",
      status : 1,
      data : promoDetails
    })
  }catch(err){
    res.status(200).send({
      message : "Promo Data not Fetched",
      status : 0
    })
  }
})
// user use promo history details
router.get("/promo-user-history" , async(req,res) => {
  const id = new mongoose.Types.ObjectId(req.query.id)
  try{
    const data = [
      {
        '$match': {
          '_id': id
        }
      }, {
        '$lookup': {
          'from': 'promocodes', 
          'localField': 'restaurantPromo', 
          'foreignField': '_id', 
          'as': 'restaurantPromo'
        }
      }, 
      {
        '$unset': [
           'restaurantPromo.__v','userSaveRestaurant','userInterest','userReview','userType' ,
           'restaurantPromo.usedBy', 'restaurantPromo.promo_code_limit', 
           'restaurantPromo.generatedBy', 
           'userName','userEmail','devices','viewrest','userImage','userStreet',
           'userLastOnline','notificationStatus','isDeleted','usersCreatedOn','__v',
           'userCountry'

        ]
      }
    ]

    const userHistory = await Users.aggregate(data);
    res.status(200).send({
      message : "User Promo history fetched",
      status : 1,
      data : userHistory
    })
  }catch(err){
    res.status(500).send({
      message : "User not fetched",
      status : 0
    })
  }
})
// promor details by id
router.get("/get-promo-detail" , async (req,res,next) => {
    const promoId = req.query.id
    try{
        const promoDetails = await Restaurants_Promo.findOne({_id : promoId }).populate({path :'usedBy.userid' , select: "userName userEmail userImage"})
        res.status(200).send({ message : "Promo code details" , status : 1 , data : promoDetails})
    }catch(err){
        res.status(500).send({ message : "Promo code not found" ,status : 0})
    }
})

module.exports = router;
