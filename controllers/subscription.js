// const { Subscription } = require('../models/subscription');
// const express = require('express');
// const router = express.Router();


// //create


// router.post("/createsubsription", async (req, res) => {
//     try {
//         let createsubsription = new Subscription({
    
//             name: req.body.name,
//             posts: req.body.posts,
//             promocodes: req.body.promocodes,
//             duration: req.body.duration,
//             price: req.body.price
    
//         })
    
      
    
//         createsubsription = await createsubsription.save();
    
//         if (!createsubsription) {
//             res.status(400).json({
//                 success: false,
//                 message: 'user not subscribe'
//             })
//         }
//         res.status(200).json({
//             success: true,
//             message: createsubsription
//         })

//     } catch (err) {

//         res.status(200).json({ success: false, message: err.message })
//     }

// })

// //get 
// router.get("/getsubsription", async (req, res) => {
//     try {
//         let getsubsription = await Subscription.find();
    
//         if (!getsubsription) {
//             res.status(200).json({
//                 success: false,
//                 message: 'user not subscribe'
//             })
//         }
//         res.status(200).json({
//             success: true,
//             message: getsubsription
//         })
        
//     } catch (err) {

//         res.status(200).json({ success: false, message: err.message })
//     }

// })

// //get by id
// router.get("/getsubsriptionbyid/:id", async (req, res) => {
//     try {
//         let getsubsriptionbyid = await Subscription.findById(req.params.id);
    
//         if (!getsubsriptionbyid) {
//             res.status(400).json({
//                 success: false,
//                 message: 'user not subscribe'
//             })
//         }
//         res.status(200).json({
//             success: true,
//             message: getsubsriptionbyid
//         })

//     } catch (err) {

//         res.status(200).json({ success: false, message: err.message })
//     }

// })

// //update by id
// router.put("/updatesubsriptionbyid/:id", async (req, res) => {
//     try {
//         let updatesubsriptionbyid = await Subscription.findByIdAndUpdate(req.params.id, {
    
//             Basic: req.body.Basic,
//             Essential: req.body.Essential,
//             Premium: req.body.Premium,
//             userid: req.body.userid
    
    
//         }, { new: true });
    
//         if (!updatesubsriptionbyid) {
//             res.status(400).json({
//                 success: false,
//                 message: 'user not subscribe'
//             })
//         }
//         res.status(200).json({
//             success: true,
//             message: updatesubsriptionbyid
//         })

//     } catch (err) {

//         res.status(200).json({ success: false, message: err.message })
//     }

// })
// //delete by id

// router.delete("/deletesubsriptionbyid/:id", async (req, res) => {
//     try {
//         let deletesubsriptionbyid = await Subscription.findByIdAndDelete(req.params.id);
    
//         if (!deletesubsriptionbyid) {
//             res.status(400).json({
//                 success: false,
//                 message: 'user not subscribe'
//             })
//         }
//         res.status(200).json({
//             success: true,
//             message: deletesubsriptionbyid
//         })

//     } catch (err) {

//         res.status(200).json({ success: false, message: err.message })
//     }

// })


// //count subcription

// router.get('/countSubscription', async (req, res) => {
//     try {
//         let countSubscription = await Subscription.estimatedDocumentCount();
    
    
//         if (!countSubscription) {
//             return res.status(400).json({ success: false, message: "something went wrong" })
//         }
//         return res.status(200).json({
//             success: true,
//             countSubscription: countSubscription
//         })

//     } catch (err) {

//         res.status(200).json({ success: false, message: err.message })
//     }
// })

// module.exports = router;