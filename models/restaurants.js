const mongoose = require("mongoose");
const restaurantsschema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: true,
  },

  restaurantDescription: {
    type: String,
    required: true,
  },
  restaurantStreet: {
    type: String,
    required: true,
  },
  promo_code:{
    type : String
  },
  otp_code:{
      type: Number
  },
  otp_status:{
      type: Boolean,
      default : false
  },
  otp_type:{
      type:String,
      enum:["signup","forget-password"],
      default:"signup"
  },

  // restaurantRating: {
  //     type: Number,
  //     default: ''
  // },
  // restaurantReviews: {
  //     type: String,
  //     default: ''
  // },
  // restaurantCountry: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  //   ref: "countries",
  // },
  // restaurantCity: {
  //   type: String,
  //   required: true,
  // },
  // restaurantZip: {
  //   type: String,
  // },
  restaurantEmail: {
    type: String,
    required: true,
  },
  restaurantPassword: {
    type: String,
    required: true,
  },
  restaurantPortfolio: [
    {
      type: String,
      required: false,
    },
  ],

  restaurantImage: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  },

  // restaurantVideo: [
  //   {
  //     type: String,
  //     required: false,
  //   },
  // ],

  status: {
    enum: ["pending", "approved", "rejected"],
    type: String,
    default: "pending",
    required: true,
  },

  restaurantInterest: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "interests",
    },
  ],
  restaurantdescrition:{
      type : String
  },

  restaurantPromo:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "promocode",
    }],

    Postannouncements : {
      type: mongoose.Schema.Types.ObjectId,
    //  required: true,
      ref: 'Postannouncements'
  },

  restaurantCreatedOn: {
    type: Date,
    default: Date.now,
  },
});

restaurantsschema.virtual("id").get(function () {
  return this._id.toHexString();
});

restaurantsschema.set("toJSON", {
  virtuals: true,
});
exports.Restaurants = mongoose.model("restaurants", restaurantsschema);
exports.restaurantsschema = restaurantsschema;
