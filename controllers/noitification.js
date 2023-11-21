const express = require('express');
const router = express.Router();
const { Notification } = require('../models/notification');
const mongoose = require('mongoose');
const { Users } = require('../models/users');
const { push_notifications } = require('../Utils/push_notification');


router.post("/createnotification", async (req, res) => {
    try {

        let createnotification = await Notification({
            title: req.body.title,
            subtitle: req.body.subtitle,
            userid: req.body.userid
        })
        

        createnotification = await createnotification.save();

        [...await Users.find({_id:{$in:req.body.userid}}).populate("devices")].map((item) => {
            
            if (item.notificationStatus) {
              item.devices.map(async (item2) => {
                await push_notifications({
                  deviceToken: item2.deviceToken,
                  title:req.body.title,
                  body:req.body.subtitle,
                });
              })
      
            }
          }
          )
        if (!createnotification) {
            return res.status(400).json({
                success: false,
                message: 'notification not created'
            })
        }
        res.status(200).json({
            success: true,
            data: createnotification
        })
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }

})

router.get("/getnotification", async (req, res) => {
    try {
        const { id } = req.query

        // let getnotification = await Notification.find();
        let getnotification = await Notification.find({
            $or: [
                { toallUser: true }, {
                    userid: {
                        $in: id
                    }
                }
            ]
        }).sort({ createdAt: -1 })


        if (getnotification.length == 0) {
            return res.status(400).json({
                success: false,
                message: "There is no notifications available"
            })
        }
        res.status(200).json({
            success: true,
            data: getnotification,
            message: "success"
        })
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }
})

//get notification by user

// router.get('/getnotificationbyuser/:id', async (req, res) => {
//     try {

//         let getnotificationbyuser = await Notification.find({ userid: mongoose.Types.ObjectId(req.params.id) }).populate(['userid', 'restaurantid']);
//         let getnotification = await Notification.find({ 'notificationtype': 'announcement' }).populate(['userid', {
//             path: 'restaurantid',
//             populate: {
//                 path: 'restaurantCountry',
//                 model: 'countries'
//             }
//         }]);

//         if (!getnotificationbyuser) {
//             return res.status(400).json({ success: false, message: "something went wrong" })
//         }
//         if (!getnotification) {
//             return res.status(400).json({ success: false, message: "something went wrong" })
//         }


//         getnotificationbyuser = getnotificationbyuser.concat(getnotification);




//         res.status(200).json({ success: true, data: getnotificationbyuser })

//     } catch (err) {

//         res.status(200).json({ success: false, message: err.message })
//     }


// })

// //count notification

// router.get('/countnotification', async (req, res) => {
//     try {

//         let countnotification = await Notification.estimatedDocumentCount();
//         if (!countnotification) {
//             return res.status(400).json({ success: false, message: "something went wrong" })
//         }
//         res.status(200).json({ success: true, countnotification: countnotification })

//     } catch (err) {

//         res.status(200).json({ success: false, message: err.message })
//     }
// })





module.exports = router;