const { PrivacyPolicy } = require('../models/privacypolicy');
const express = require('express');
const router = express.Router();

router.post('/privacy', async (req, res) => {
    try {

        const data = await  PrivacyPolicy.find({})
        if(data.length>0){
    
            return res.status(400).json({ success: false, message: 'you already have one privacy kindly update it' })
        }
        let createprivacy = new PrivacyPolicy({
            privacypolicy: req.body.privacypolicy
        })
        createprivacy = await createprivacy.save();
        if (!createprivacy) {
            return res.status(400).json({ success: false, message: 'createprivacy not create' })
        }
        return res.status(200).json({ success: true, data: createprivacy });
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }
})

router.put('/privacy/:id', async (req, res) => {
    try {

        const { id } = req.params
        const updateprivacy = await PrivacyPolicy.findByIdAndUpdate(id, req.body)
        if (!updateprivacy) {
            return res.status(400).json({ success: false, message: 'privacy not updated' })
        }
        return res.status(200).json({ success: true, message: "privacy updated successfully" });
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }
})

router.get('/privacy', async (req, res) => {
    try {

        let getprivacy = await PrivacyPolicy.find();
    
        if (!getprivacy) {
            return res.status(400).json({ success: false, message: 'privacy policy not get' })
        }
        return res.status(200).json({ success: true, data: getprivacy[0] });
    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }

})

module.exports = router;