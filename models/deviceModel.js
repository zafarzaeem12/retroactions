const mongoose = require('mongoose');
const deviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "auth",
    },
    status: {
      type: String,
      enum: ["active", "disactive"],
      default: "active",
    },
    lastSeen: {
      type: Date,
      default: Date.now(),
    },
    deviceType: {
      type: String,
      enum: ["android", "postman", "mac"],
      default: null,
    },
    deviceMAC: {
      type: String,
      default: null,
    },
    deviceToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);



exports.Device = mongoose.model("device", deviceSchema);
exports.deviceSchema = deviceSchema;



