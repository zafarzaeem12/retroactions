const {Device} = require('../models/deviceModel')
const {Users} = require('../models/users')
 const linkUserDevice = async (authId, deviceToken, deviceType) => {
  // check if all arguments are provided and are of type string
  if (
    !authId ||
    !deviceToken ||
    !deviceType ||
    typeof deviceToken !== "string" ||
    typeof deviceType !== "string"
  ) {
    return { error: "Invalid arguments" };
  }
  // check if deviceToken is valid
  // if ( !deviceToken.match( /^[a-f0-9]{64}$/ ) )
  // {
  //   return { error: 'Invalid device token' };
  // }
  // check if device token is already linked to another user

  try {
    const existingDevice = await Device.findOne({
      deviceToken,
      user: { $ne: authId },
    });

    if (existingDevice) {
      // if device is already linked to another user, remove it from that user
      await Users.findByIdAndUpdate(existingDevice.user, {
        $pull: { devices: existingDevice._id },
        $addToSet: { loggedOutDevices: existingDevice._id },
      });
    }

    const device = await Device.findOneAndUpdate(
      {
        deviceToken,
      },
      {
        $set: {
          deviceType,
          user: authId,
          $setOnInsert: { createdAt: new Date() },
          status: "active",
          lastSeen: new Date(),
          deviceToken,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    await Users.findByIdAndUpdate(authId, {
      $addToSet: { devices: device._id },
      $pull: { loggedOutDevices: device._id },
    });
    return { device };
  } catch (e) {
    return { error: "Error while linking device" };
  }
};

 const unlinkUserDevice = async (authId, deviceToken, deviceType) => {
  // check if all arguments are provided and are of type string
  if (
    !authId ||
    !deviceToken ||
    !deviceType ||
    typeof deviceToken !== "string" ||
    typeof deviceType !== "string"
  ) {
    return { error: "Invalid arguments" };
  }
  // check if deviceToken is valid
  // if ( !deviceToken.match( /^[a-f0-9]{64}$/ ) )
  // {
  //   return { error: 'Invalid device token' };
  // }
  // check if device token is already linked to another user

  try {
    const existingDevice = await Device.findOne({
      deviceToken,
      user: authId,
    });

    if (existingDevice) {
      // if device is already linked to another user, remove it from that user
      await Users.findByIdAndUpdate(existingDevice.user, {
        $pull: { devices: existingDevice._id },
        $addToSet: { loggedOutDevices: existingDevice._id },
      });

      await Device.findOneAndUpdate(
        {
          deviceToken,
        },
        {
          status: "disactive",
          lastSeen: new Date(),
        }
      );
    }

    
  } catch (e) {
    return { error: "Error while linking device" };
  }
};
module.exports = { linkUserDevice,unlinkUserDevice };