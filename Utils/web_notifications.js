const admin = require("firebase-admin");

const serviceAccount = require('../Utils/websnotification-firebase-adminsdk-fq828-acc881c1fa.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const WebNotification = ({deviceToken,title,body}) => {
  const message = {
    token: deviceToken ,
    notification: {
      title: title ,
      body: body ,
    },
  };

  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.error('Error sending message:', error);
    });
};

module.exports = { WebNotification };
