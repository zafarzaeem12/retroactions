const mongoose = require('mongoose');
const usersubscriptionsschema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    subscription: {
        type: String
    },
    startsAt: {
        type: Date,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
})

usersubscriptionsschema.virtual('id').get(function () {
    return this._id.toHexString();
});

usersubscriptionsschema.set('toJSON', {
    virtuals: true,
});
exports.UserSubscription = mongoose.model('usersubscriptions', usersubscriptionsschema);
// exports.usersubscriptionsschema = usersubscriptionsschema;