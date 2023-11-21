const mongoose = require('mongoose');
const notificationschema = mongoose.Schema({

    title: {
        type: String,
    },
    subtitle: {
        type: String,
    },
    notificationtype: {
        type: String,
        enum: ["admin", "announcement", "restaurant", "review"]
        , default: "admin"
    },

    userid: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    toallUser: {
        type: Boolean,
        default: false
    },
    // restaurantid: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'restaurants'
    // }
})

exports.Notification = mongoose.model('notification', notificationschema);
// exports.notificationschema = notificationschema;