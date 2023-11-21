const mongoose = require('mongoose');

const termsandconditionschema = new mongoose.Schema({

    termsandconditions: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
})
exports.TermsandCondition = mongoose.model('termsandcondition', termsandconditionschema);
exports.termsandconditionschema = termsandconditionschema;