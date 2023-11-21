const mongoose = require('mongoose');
const userreviewsschema = new mongoose.Schema({

    userreviews: {
        type: String,
        required: true,
    },
    userrating: {
        type: Number,
        required: true
    },
    restaurantid:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'restaurants'
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },

    userreviewsCreatedOn: {
        type: Date,
        default: Date.now
    }
})

userreviewsschema.virtual('id').get(function () {
    return this._id.toHexString();
});

userreviewsschema.set('toJSON', {
    virtuals: true,
});
exports.UserReviews = mongoose.model('userreviews', userreviewsschema);
exports.userreviewsschema = userreviewsschema;