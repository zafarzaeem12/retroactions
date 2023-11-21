// const mongoose = require('mongoose');
// const subscriptionsschema = new mongoose.Schema({

//     name: {
//         type: String,
//         required: true,
//     },

//     posts: {
//         type: Number,
//         required: true,
//     },
//     promocodes: {
//         type: String
//     },
//     duration: {
//         type: Number,
//         required: true
//     },
//     price: {
//         type: Number,
//         required: true
//     },    
// })

// subscriptionsschema.virtual('id').get(function () {
//     return this._id.toHexString();
// });

// subscriptionsschema.set('toJSON', {
//     virtuals: true,
// });
// exports.Subscription = mongoose.model('subscriptions', subscriptionsschema);
// exports.subscriptionsschema = subscriptionsschema;