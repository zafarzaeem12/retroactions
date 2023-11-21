const mongoose = require('mongoose');

const countryschema = new mongoose.Schema({

    userCountry: {
        type: String,
        required: true
    },


    userCountryCreatedOn: {
        type: Date,
        default: Date.now
    }




})

countryschema.virtual('id').get(function () {
    return this._id.toHexString();
});
countryschema.set('toJSON', {
    virtuals: true,
});
exports.Country = mongoose.model('countries', countryschema);
exports.countryschema = countryschema;