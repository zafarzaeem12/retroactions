const { TermsandCondition } = require('../models/termsandcondition');
const express = require('express');
const router = express.Router();


router.post('/terms', async (req, res) => {
    try {
        const data = await TermsandCondition.find({})
        if (data.length > 0) {
    
            return res.status(400).json({ success: false, message: 'you already have one terms and condition kindly update it' })
        }
        let create = new TermsandCondition({
    
            termsandconditions: req.body.termsandconditions
    
        })
    
        create = await create.save();
    
        if (!create) {
            res.status(400).json({ succes: false, message: 'termsandconditions not create' })
        }
        res.status(200).json({ success: true, data: create })

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }
})

router.put('/terms/:id', async (req, res) => {
    try {
        const { id } = req.params
        const updateterms = await TermsandCondition.findByIdAndUpdate(id, req.body)
        if (!updateterms) {
            return res.status(400).json({ success: false, message: 'Terms not updated' })
        }
        return res.status(200).json({ success: true, message: "terms updated successfully" });

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }
})

router.get('/terms', async (req, res) => {
    try {
        let getterms = await TermsandCondition.find();
    
    
        if (!getterms) {
            res.status(400).json({ succes: false, message: 'termsandconditions not create' })
        }
        res.status(200).json({ success: true, data: getterms[0] })

    } catch (err) {

        res.status(200).json({ success: false, message: err.message })
    }

})



module.exports = router;