const { UserSubscription } = require('../models/usersubscription');
const express = require('express');
const router = express.Router();
const Joi = require("joi");
const { Users } = require('../models/users');
const { default: mongoose } = require('mongoose');

const CronJob = require("cron").CronJob;

//create


router.post("/createusersub", async (req, res) => {
  try {
    const validator = Joi.object({
      user: Joi.string().required(),
      subscription: Joi.string(),
      price: Joi.number().required(),
      startsAt: Joi.string().pattern(/\d{4}-\d{2}-\d{2}/, 'custom format').required(),
      expiresAt: Joi.string().pattern(/\d{4}-\d{2}-\d{2}/, 'custom format').required(),
    })

    const { error } = validator.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    let createsubsription = new UserSubscription({
      user: req.body.user,
      subscription: req.body.subscription,
      startsAt: new Date(req.body.startsAt),
      expiresAt: new Date(req.body.startsAt).setDate((new Date(req.body.startsAt)).getDate()+10),
      price: req.body.price
    });

    createsubsription = await createsubsription.save();

    if (!createsubsription) {
      res.status(400).json({
        success: false,
        message: 'User not subscribed.'
      });
    }
    await Users.findOneAndUpdate({
      _id: req.body.user
    }, { subscription: mongoose.Types.ObjectId(createsubsription._id) , is_subscripted : true })

    res.status(200).json({
      success: true,
      message: "Subscription purchased successfully",
      data: createsubsription
    });
  } catch (error) {

    res.status(200).json({ success: false, message: error.message })
  }
});


//get 
router.get("/getusersub", async (req, res) => {
  try {
    const { id } = req.query
    let getsubsription = await UserSubscription.find({ user: id });

    if (!getsubsription) {
      res.status(200).json({
        success: false,
        message: 'user not subscribe'
      })
    }
    res.status(200).json({
      success: true,
      message: getsubsription
    })

  } catch (err) {

    res.status(200).json({ success: false, message: err.message })
  }
})
const job = new CronJob("* * * * * *", async (req, res) => {
  try {
    const date = new Date()
    const data = await UserSubscription.find({ expiresAt: { $lt: date } })
    
    data.map(async(item)=>{
      if(item.price==10){
        await UserSubscription.findByIdAndUpdate(item._id,{
          expiresAt: new Date(item.expiresAt.setMonth(item.expiresAt.getMonth()+1))          
        })
            }
      if(item.price==50){
        await UserSubscription.findByIdAndUpdate(item._id,{
          expiresAt: new Date(item.expiresAt.setMonth(item.expiresAt.getMonth()+6))          
        })
      }

      if(item.price==90){
        await UserSubscription.findByIdAndUpdate(item._id,{
          expiresAt: new Date(item.expiresAt.setYear(item.expiresAt.getYear()+1))          
        })
      }

      // await Users.findByIdAndUpdate(item.user,{subscription: null})
    })
    // await UserSubscription.deleteMany({ expiresAt: { $lt: date } })

    
  } catch (e) { }
});

job.start();


module.exports = router;