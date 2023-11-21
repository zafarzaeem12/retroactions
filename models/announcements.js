const mongoose = require('mongoose');

const announcementsschema = new mongoose.Schema({

    announcementName: {
        type: String,
        //required: true
    },
    announcementDescription: {
        type: String,
        //required: true
    },
    announcementCountry: {
        type: String,
        //required: false
    },
    announcementCity: {
        type: String,
        //required: false
    },
    announcementStreet: {
        type: String,
        default: ''
    },

    announcementType:{
        type : String,
        enum : ['desc' , 'promo-code', 'post'],
        default : 'desc'
    },

    announcementRestaurants: {
        type: mongoose.Schema.Types.ObjectId,
       // required: true,
        ref: 'restaurants'
    },
    Postannouncements : {
        type: mongoose.Schema.Types.ObjectId,
      //  required: true,
        ref: 'Postannouncements'
    },
    announcementCreatedOn: {
        type: Date,
        default: Date.now
    }




})

announcementsschema.virtual('id').get(function () {
    return this._id.toHexString();
});

announcementsschema.set('toJSON', {
    virtuals: true,
});
exports.Announcements = mongoose.model('Announcements', announcementsschema);
exports.announcementsschema = announcementsschema;