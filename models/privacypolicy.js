const mongoose = require('mongoose');

const privacypolicyschema = new mongoose.Schema({

    privacypolicy: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
})
exports.PrivacyPolicy = mongoose.model('privacypolicy', privacypolicyschema);
exports.privacypolicyschema = privacypolicyschema;