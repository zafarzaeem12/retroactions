const { Announcements } = require('../models/announcements');
const { Postannouncment } = require('../models/postannouncment');
const { Restaurants } = require("../models/restaurants");
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Notification } = require('../models/notification');
const { push_notifications } = require('../Utils/push_notification');
const { Users } = require('../models/users');
const { Restaurants_Promo } = require("../models/restaurentpromo");
const multer = require("multer");
//create announcements by description

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
      console.log("122");
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

router.post('/createannouncements',
    async (req, res) => {
        try {

            let createannouncements = new Announcements({
                announcementName: req.body.announcementName,
                announcementDescription: req.body.announcementDescription,
                announcementCountry: req.body.announcementCountry,
                announcementCity: req.body.announcementCity,
                announcementStreet: req.body.announcementStreet,
                announcementRestaurants: req.body.announcementRestaurants,
                announcementType : 'desc'
            })
            createannouncements = await createannouncements.save();

            if (!createannouncements) {
                return res.status(200).json({ success: false, message: "something went wrong" })
            }
            
            const restu = await Restaurants.findOne({_id : req.body.announcementRestaurants })

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
                            deviceToken: item2?.deviceToken,
                            title: `${restu?.restaurantName}`,
                            body: `New Announcement: Description been added`,
                        });
                    })

                }
            }
            )
            if (!createnotification) {
                return res.status(200).json({ success: false, message: "something went wrong" })
            }


            res.status(200).json({ success: true, data: createannouncements })
        } catch (err) {

            res.status(200).json({ success: false, message: err.message })
        }

    })

router.post('/createannouncemntbypost/:restaurantId',
upload.fields([
  { name: "postImage", maxCount: 1 }]), async (req,res,next) => {
try{
  const { restaurantId } = req.params
  const resDetails = await Restaurants.findOne({_id : restaurantId});

  const {
    postLink,
    post_description
    } = req.body

  const posts = new Postannouncment({
    restaurantName : resDetails.restaurantName,
    restaurantStreet : resDetails.restaurantStreet,
    restaurantDescription : resDetails.restaurantDescription,
    restaurantImage : resDetails.restaurantImage,
    postLink,
    post_description,
    postImage : req.files ? req.files.postImage[0].path.replace(/\\/g, "/") : null
  })
  const postannouncement = await posts.save();

  let createannouncements = new Announcements({
    announcementType : 'post',
    Postannouncements :  postannouncement._id,
    announcementRestaurants :restaurantId
  });
  await createannouncements.save();
  
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
                            title: `${resDetails.restaurantName}`,
                            body: `New Announcement: Posts been added`,
                        });
                    })

                }
            }
            )
            if (!createnotification) {
                return res.status(200).json({ success: false, message: "something went wrong" })
            }

  res.status(201).send({ message : "Post announcemnt created successfully" , status : 1 , data : postannouncement})
}catch(err){
  console.log(err)
  res.status(201).send({ message : "Post announcemnt not created successfully" , status : 0})
}
})

//get announcements

router.get('/getannouncements', async (req, res) => {

    try {
        let getannouncements = await Announcements.find().sort({ announcementCreatedOn: -1 }).populate(['announcementRestaurants'])

        if (!getannouncements) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }
        res.status(200).json({ success: true, data: getannouncements })
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }


})


router.get('/user/getannouncements', async (req, res) => {

    try {
       
        const id = new mongoose.Types.ObjectId(req.query.id)
        const userData = await Users.findById(id).populate("subscription")
        if ( id && userData.subscription == null) {
            return res.status(400).json({ success: false, message: "You have to buy subscriptions for get announcements" })        
        }
       
          const data = [
            {
              '$lookup': {
                'from': 'restaurants', 
                'localField': 'announcementRestaurants', 
                'foreignField': '_id', 
                'as': 'announcements'
              }
            }, {
              '$unwind': {
                'path': '$announcements', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$project': {
                '_id': 1, 
                
                'Postannouncements' : 1,
                'announcementName': 1, 
                'announcementType' : 1,
                'announcementDescription': 1, 
                'announcementCountry': 1, 
                'announcementCity': 1, 
                'announcementStreet': 1, 
                'announcementCreatedOn': 1, 
                'announcementRestaurants': '$announcements'
              }
            }, {
              '$project': {
                '_id': 1, 
                'Postannouncements' : 1,
                
                'announcementType' : 1,
                'announcementName': 1, 
                'announcementDescription': 1, 
                'announcementCountry': 1, 
                'announcementCity': 1, 
                'announcementStreet': 1, 
                'announcementCreatedOn': 1, 
                'announcementRestaurants': 1
              }
            }, {
              '$lookup': {
                'from': 'promocodes', 
                'localField': 'announcementRestaurants.restaurantPromo', 
                'foreignField': '_id', 
                'as': 'announcementRestaurants.restaurantPromo'
              }
            }, {
              '$addFields': {
                'restaurent_validPromo': {
                  '$filter': {
                    'input': '$announcementRestaurants.restaurantPromo', 
                    'as': 'valid_promo', 
                    'cond': {
                      '$and': [
                        {
                          '$eq': [
                            '$$valid_promo.is_promo_code_disable', false
                          ]
                        }, 
                        // {
                        //   '$not': {
                        //     '$in': [
                        //       id , '$$valid_promo.usedBy.userid'
                        //     ]
                        //   },
                          
                        // },
                        {
                          '$and' :[
                            {'$ne':  ["$announcementType", "post"]},
                            {'$ne':  ["$announcementType", "desc"]}
                        ]},
                        {
                          '$eq': [
                            '$$valid_promo.announcement_id' , '$_id'
                          ]
                        }
                      ]}
                    }
                  }
                }
              
            }, {
              '$project': {
                '_id': 1, 
                'Postannouncements' : 1, 
                'announcementType' : 1,
                'announcementName': 1, 
                'announcementDescription': 1, 
                'announcementCountry': 1, 
                'announcementCity': 1, 
                'announcementStreet': 1, 
                'announcementCreatedOn': 1, 
                'announcementRestaurants': {
                  '$mergeObjects': [
                    '$announcementRestaurants', {
                      'restaurent_validPromo': '$restaurent_validPromo'
                    }
                  ]
                }
              }
            }, {
              '$lookup': {
                'from': 'postannouncements', 
                'localField': 'Postannouncements', 
                'foreignField': '_id', 
                'as': 'Postannouncements'
              }
            }, {
              '$unset': [
                'announcementRestaurants.restaurantPromo',
              ]
            },
             {
              '$sort': {
                'announcementCreatedOn': -1
              }
            }
          ]
       
          let getannouncements = await Announcements.aggregate(data)
        

              
        if (!getannouncements) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }

      
        res.status(200).json({total : getannouncements.length   , success: true, data: getannouncements })
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }


})






//get announcements by restaurant

router.get('/getannouncementsbyrestaurant', async (req, res) => {
  const newid = new mongoose.Types.ObjectId(req?.query?.id)
  if (!newid || !mongoose.Types.ObjectId.isValid(newid)) {
  return res.status(200).json({ success: false, message: "Invalid 'id' parameter" });
}
    try {
       const data = [
  {
    '$lookup': {
      'from': 'restaurants', 
      'localField': 'announcementRestaurants', 
      'foreignField': '_id', 
      'as': 'announcements'
    }
  }, {
    '$unwind': {
      'path': '$announcements', 
      'preserveNullAndEmptyArrays': true
    }
  }, {
    '$project': {
      '_id': 1, 
      'Postannouncements': 1, 
      'announcementType': 1, 
      'announcementName': 1, 
      'announcementDescription': 1, 
      'announcementCountry': 1, 
      'announcementCity': 1, 
      'announcementStreet': 1, 
      'announcementCreatedOn': 1, 
      'announcementRestaurants': '$announcements'
    }
  }, {
    '$project': {
      '_id': 1, 
      'Postannouncements': 1, 
      'announcementType': 1, 
      'announcementName': 1, 
      'announcementDescription': 1, 
      'announcementCountry': 1, 
      'announcementCity': 1, 
      'announcementStreet': 1, 
      'announcementCreatedOn': 1, 
      'announcementRestaurants': 1
    }
  }, {
    '$lookup': {
      'from': 'promocodes', 
      'localField': 'announcementRestaurants.restaurantPromo', 
      'foreignField': '_id', 
      'as': 'announcementRestaurants.restaurantPromo'
    }
  }, {
    '$addFields': {
      'restaurent_validPromo': {
        '$filter': {
          'input': '$announcementRestaurants.restaurantPromo', 
          'as': 'valid_promo', 
          'cond': {
            '$and': [
              {
                '$eq': [
                  '$$valid_promo.is_promo_code_disable', false
                ]
              }, {
                '$and': [
                  {
                    '$ne': [
                      '$announcementType', 'post'
                    ]
                  }, {
                    '$ne': [
                      '$announcementType', 'desc'
                    ]
                  }
                ]
              }, {
                '$eq': [
                  '$$valid_promo.announcement_id', '$_id'
                ]
              }
            ]
          }
        }
      }
    }
  }, {
    '$project': {
      '_id': 1, 
      'Postannouncements': 1, 
      'announcementType': 1, 
      'announcementName': 1, 
      'announcementDescription': 1, 
      'announcementCountry': 1, 
      'announcementCity': 1, 
      'announcementStreet': 1, 
      'announcementCreatedOn': 1, 
      'announcementRestaurants': {
        '$mergeObjects': [
          '$announcementRestaurants', {
            'restaurent_validPromo': '$restaurent_validPromo'
          }
        ]
      }
    }
  }, {
    '$project': {
      '_id': 1, 
      'Postannouncements': 1, 
      'announcementType': 1, 
      'announcementName': 1, 
      'announcementDescription': 1, 
      'announcementCountry': 1, 
      'announcementCity': 1, 
      'announcementStreet': 1, 
      'announcementCreatedOn': 1, 
      'announcementRestaurants': {
        '$cond': {
          'if': {
            '$and': [
              {
                '$eq': [
                  '$announcementType', 'promo-code'
                ]
              }, {
                '$eq': [
                  '$announcementRestaurants.restaurent_validPromo', []
                ]
              }
            ]
          }, 
          'then': null, 
          'else': '$announcementRestaurants'
        }
      }
    }
  }, {
    '$lookup': {
      'from': 'postannouncements', 
      'localField': 'Postannouncements', 
      'foreignField': '_id', 
      'as': 'Postannouncements'
    }
  }, {
    '$unset': [
      'announcementRestaurants.restaurantPromo'
    ]
  }, {
    '$sort': {
      'announcementCreatedOn': -1
    }
  }
]
      if (newid) {
        // If 'id' query parameter is present, apply the aggregation pipeline
        data.push({
          $match: {
            'announcementRestaurants._id': newid,
          },
        });
      }
        let getannouncementsbyrestaurant = await Announcements.aggregate(data)
        
        if (!getannouncementsbyrestaurant) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }
        res.status(200).json({ total : getannouncementsbyrestaurant.length , success: true, data: getannouncementsbyrestaurant })

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }



})

//update announcements by id

router.put('/updateannouncementsbyid/:id', async (req, res) => {
    try {

        let updateannouncementsbyid = await Announcements.findByIdAndUpdate(req.params.id, {

            announcementName: req.body.announcementName,
            announcementDescription: req.body.announcementDescription,
            announcementCountry: req.body.announcementCountry,
            announcementCity: req.body.announcementCity,
            announcementStreet: req.body.announcementStreet,
            announcementRestaurants: req.body.announcementRestaurants

        }, { new: true });

        if (!updateannouncementsbyid) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }
        res.status(200).json({ success: true, data: updateannouncementsbyid })
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }


})


//delete announcements by id

router.delete('/deleteannouncementsbyid/:id', async (req, res) => {
    try {
        

        let deleteannouncementsbyid = await Announcements.findByIdAndDelete(req.params.id);

        if (!deleteannouncementsbyid) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }
        res.status(200).json({ success: true, data: deleteannouncementsbyid })
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }

})
// delete announcements by id and promo_id;


router.delete('/announcementid/:id' , async (req,res,next) => {
    try{
        const annouceId = req.params.id;
        const promoId = req.query.id;
        const postId = req.query.postid;
        
        const checkedAnnounce = await Announcements.findOne({_id : annouceId});
        if(!checkedAnnounce._id){
            return res.status(404).send({ message : "No announcements found"})
        }
        if(promoId){
            const announcements = await Announcements.findByIdAndDelete({_id : annouceId});
            const promoCodes =  await Restaurants_Promo.findByIdAndDelete({_id : promoId});
            return res.status(200).send({ message : "Announcements with PromeCodes deleted" , status : 1})
        }else if(postId){
             await Announcements.findByIdAndDelete({_id : annouceId});
             await Postannouncment.findByIdAndDelete({_id : postId})
             return res.status(200).send({ message : "Announcements with Post deleted"})
        }
        
            const announcements = await Announcements.findByIdAndDelete(annouceId);
            return res.status(200).send({ message : "descriptive Announcements deleted successfully" , status : 1 })
        
    }catch(err){
        console.log(err)
        return res.status(500).send({ message : "Announcements not deleted" , status : 0 })
    }
})

//count announcements

router.get('/countannouncements', async (req, res) => {
    try {

        let countannouncements = await Announcements.estimatedDocumentCount();

        if (!countannouncements) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }
        res.status(200).json({
            success: true,
            countannouncements: countannouncements
        })
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }

})


module.exports = router;