 var FCM = require("fcm-node");

var serverKey =
"AAAA-zF7bm4:APA91bHpTTQq2CTIvmWXU4BdV4kmJ-7cujJcAPzEU5L92HxL6IPO5l8yc1_uZawKZdKI4pJfRiRQyqvgQw0n4KwXvFNSxHp6DVLfRisnQBD_Fu7wt61uOfDlTBpLOsLWHJeQrMQR7Ygm"; //put your server key here
var fcm = new FCM(serverKey);

const push_notifications = (notification_obj) => {
  console.log(notification_obj)
  var message = {
    to: notification_obj.deviceToken,
    collapse_key: "your_collapse_key",

    notification: {
      title: notification_obj.title,
      body: notification_obj.body,
    },
  };

  fcm.send(message, function (err, response) {
    
    if (err) {
      console.log("err", err);
    } else {
      console.log("response", response);
    }
  });
};

 module.exports = { push_notifications };

