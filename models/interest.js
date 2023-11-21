const mongoose = require('mongoose');
const interestschema = new mongoose.Schema({

    interestName:
    {
        type: String,
        required: true
    },
    interestCreatedOn: {
        type: Date,
        default: Date.now
    }

})
interestschema.virtual('id').get(function () {
    return this._id.toHexString();
});

interestschema.set('toJSON', {
    virtuals: true,
});
exports.Interests = mongoose.model('interests', interestschema);
exports.interestschema = interestschema;