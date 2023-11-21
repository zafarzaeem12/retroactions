const mongoose = require("mongoose");
const userschema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userPassword: {
    type: String,
    required: false,
  },
  devices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "device",
    },
  ],
  viewrest: {
    type: Number,
    default: 0,
  },

  userImage: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  },
  userStreet: {
    type: String,
    default: "",
  },
  userLastOnline: {
    type: String,
    default: "",
  },
  userSaveRestaurant: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurants",
    },
  ],
  subscription: {
    type: String,
    ref: "usersubscriptions",
  },
  is_subscripted:{
    type : Boolean,
    default : false
  },

  userCountry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "countries",
  },
  restaurantPromo:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "promocode",
  }],
  userInterest: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "interests",
    },
  ],
  userReview: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userreviews",
    },
  ],
  userType: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  notificationStatus: { type: Boolean, default: true },
  usersCreatedOn: {
    type: Date,
    default: Date.now,
  },
  isDeleted: { type: Boolean, default: false },
});

userschema.virtual("id").get(function () {
  return this._id.toHexString();
});

userschema.set("toJSON", {
  virtuals: true,
});
exports.Users = mongoose.model("users", userschema);
exports.userschema = userschema;
