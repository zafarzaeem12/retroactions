const mongoose = require('mongoose');

const postannouncementsschema = new mongoose.Schema({

    restaurantName: {
        type: String,
        required: true
    },
    restaurantStreet: {
        type: String,
        required: true
    },
    // restaurantRating: {
    //     type: Number,
    //     required: true
    // },
    restaurantDescription: {
        type: String,
        required: true
    },
    restaurantImage:{
        type: String,
        required: true
    },
    postLink:{
        type : String,
    },
    postImage:{
        type : String
    },
    post_announcementCreatedOn: {
        type: Date,
        default: Date.now
    },
    post_description:{
         type : String
    }
})

// announcementsschema.virtual('id').get(function () {
//     return this._id.toHexString();
// });

// announcementsschema.set('toJSON', {
//     virtuals: true,
// });
exports.Postannouncment = mongoose.model('Postannouncements', postannouncementsschema);
exports.postannouncementsschema = postannouncementsschema;