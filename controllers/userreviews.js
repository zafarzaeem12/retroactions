const { UserReviews } = require('../models/userreviews');
const express = require('express');
const router = express.Router();
const { Users } = require('../models/users');
const { Restaurants } = require('../models/restaurants');
const { Notification } = require('../models/notification');
const { push_notifications } = require('../Utils/push_notification');

//create reviews

router.post('/createreviews',

    async (req, res) => {
        try {
            
                    const usercheck = await UserReviews.findOne({ restaurantid: req.body.restaurantid, userid: req.body.userid });
            
                    if (usercheck) {
                        return res.status(200).json({ success: false, message: 'you have already given rating to that user' })
            
                    }
            
                    let createreviews = new UserReviews({
                        userreviews: req.body.userreviews,
                        userrating: req.body.userrating,
                        restaurantid: req.body.restaurantid,
                        userid: req.body.userid,
                    })
            
                    createreviews = await createreviews.save();
                    if (!createreviews) {
                        return res.status(400).json({ success: false, message: 'user reviews not created' })
                    }
                    
                    const userupdatereview = await Users.findByIdAndUpdate(
                        req.body.userid,
                        {
                            $push: {
                                userReview: createreviews._id.toHexString()
                            }
                        },
                        { new: true }
                    )
            
                    if (!userupdatereview) {
                        return res.status(400).json({ success: false, message: 'user update not created' })
                    }
                    let getRestaurantsbyid = await Restaurants.findById(req.body.restaurantid);
                    
            
            
                    let createnotification = await Notification({
                        title: `Review`,
                        subtitle: `${getRestaurantsbyid?.restaurantName} gives you a review`,
                        notificationtype: 'review',
                        userid: [req.body.userid]
                    })
            
                    createnotification = await createnotification.save();
                    const userData = await Users.findOne({_id:req.body.userid}).populate("devices")

                    
                        if (userData.notificationStatus) {
                            userData.devices.map(async (item2) => {
                            await push_notifications({
                              deviceToken: item2.deviceToken,
                              title: "You have new Review",
                              body:`${getRestaurantsbyid?.restaurantName} gives you a review`,
                            });
                          })
                  
                        }
                      
                      
                    if (!createnotification) {
                        return res.status(400).json({
            
                            success: false,
                            message: 'notification not created'
            
                        })
            
            
                    }
            
                    res.status(200).json({ success: true, data: userupdatereview, message: "data save success" })

        } catch (err) {

            res.status(200).json({ success: false, message: err.message })
        }

    })

//get reviews

router.get('/getreviews', async (req, res) => {
    try {
        let getreviews = await UserReviews.find().sort({ userreviewsCreatedOn: -1 })
    
    
        if (!getreviews) {
            return res.status(400).json({ success: false, message: 'user reviews not get' })
        }
        res.status(400).json({ success: true, message: getreviews })

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }

})


//get review by userID

router.get('/getreviews/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;  
        try {
          const reviews = await UserReviews.find({ userid: userId }).sort({ userreviewsCreatedOn: -1 });  
          if (!reviews) {
            return res.status(400).json({ success: false, message: 'User reviews not found' });
          }  
          res.status(200).json({ success: true, data: reviews });
        } catch (error) {
          res.status(500).json({ success: false, message: 'Internal server error' });
        }

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }
  });


  //count userviews

//CHECKING user Weekly Post Capacity


  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const endOfWeek = new Date();
  endOfWeek.setHours(23, 59, 59, 999);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  router.get('/checkSubs/:userId', async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const reviews = await UserReviews.countDocuments({
        userid: userId,
        userreviewsCreatedOn: { $gte: startOfWeek, $lt: endOfWeek }
      });
      
  
  
      const user = await Users.findById(userId);
      
      
  
      if (reviews >= 5 &&  user.subscription == "Free") {
        return res.status(404).json({ success: false, message: 'You have reached maximum post limit please subscribe Premium' });
      }
  
      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  




//get reviews by id
router.get('/getreviewsbyid/:id', async (req, res) => {
    try {
        let getreviewsbyid = await UserReviews.findById(req.params.id)
    
    
        if (!getreviewsbyid) {
            return res.status(400).json({ success: false, message: 'user reviews not get' })
        }
        res.status(400).json({ success: true, message: getreviewsbyid })

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }

})

//update reviews by id
router.put('/updatereviewsbyid/:id', async (req, res) => {
    try {
        let updatereviewsbyid = await UserReviews.findByIdAndUpdate(req.params.id, {
            userreviews: req.body.userreviews,
            restaurantid: req.body.restaurantid,
            userid: req.body.userid,
            userrating: req.body.userrating
        }, { new: true })
    
    
        if (!updatereviewsbyid) {
            return res.status(400).json({ success: false, message: 'user reviews not get' })
        }
        res.status(400).json({ success: true, message: updatereviewsbyid })

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }

})


//update reviews by id
router.delete('/deletereviewsbyid/:id', async (req, res) => {
    try {
        let deletereviewsbyid = await UserReviews.findByIdAndDelete(req.params.id)
    
    
        if (!deletereviewsbyid) {
            return res.status(400).json({ success: false, message: 'user reviews not get' })
        }
        res.status(400).json({ success: true, message: deletereviewsbyid })

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }

})


// count user review

router.get('/countuserreview', async (req, res) => {
    try {
        let countuserreview = await UserReviews.estimatedDocumentCount();
    
        if (!countuserreview) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }
        res.status(200).json({
            success: true,
            countuserreview: countuserreview
        })

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }
})


module.exports = router;