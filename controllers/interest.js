const { Interests } = require('../models/interest');
const express = require('express')
const router = express.Router();

//create interest
router.post('/createinterest',

    async (req, res) => {
        try {

            let createinterest = new Interests({

                interestName: req.body.interestName


            })
            createinterest = await createinterest.save()
            if (!createinterest) {
                return res.status(400).json({
                    success: false,
                    message: 'something went wrong'
                })
            }
            res.status(200).json({ success: true, data: createinterest })

        } catch (err) {

            res.status(200).json({ success: false, message: err.message })
        }
    })

//get interest

router.get('/getinterest', async (req, res) => {
    try {

        let getinterest = await Interests.find().sort({ interestCreatedOn: -1 });
        if (!getinterest) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }
        res.status(200).json({ success: true, data: getinterest })
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }
})
//get interest by id
router.get('/getinterestbyid/:id', async (req, res) => {
    try {

        let getinterestbyid = await Interests.findById(req.params.id);
        if (!getinterestbyid) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }
        res.status(200).json({ success: true, data: getinterestbyid })
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }
})
//update interest by id
router.put('/updateinterestbyid/:id', async (req, res) => {
    try {

        let updateinterestbyid = await Interests.findByIdAndUpdate(req.params.id, {
            interestName: req.body.interestName
        }, { new: true });
        if (!updateinterestbyid) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }
        res.status(200).json({ success: true, data: updateinterestbyid })
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }
})

//delete interest by id
router.delete('/deleteinterestbyid/:id', async (req, res) => {
    try {
        let deleteinterestbyid = await Interests.findByIdAndDelete(req.params.id);
        if (!deleteinterestbyid) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }
        res.status(200).json({ success: true, data: deleteinterestbyid })

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }
})

//count interest 

router.get('/countinterest', async (req, res) => {
    try {
        let countinterest = await Interests.estimatedDocumentCount();
        if (!countinterest) {
            return res.status(400).json({ success: false, message: "something went wrong" })
        }
        res.status(200).json({ success: true, countinterest: countinterest })

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }

})


module.exports = router;