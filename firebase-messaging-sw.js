importScripts('https://www.gstatic.com/firebasejs/7.14.6/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.6/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyDRnMF28BcaQzYuDjJBegVOQrk6bRIYdGA",
    authDomain: "websnotification.firebaseapp.com",
    projectId: "websnotification",
    storageBucket: "websnotification.appspot.com",
    messagingSenderId: "1623252486",
    appId: "1:1623252486:web:98d0a422f161b0bb78ad87",
    measurementId: "G-J8MCYJS60L"
  };

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    console.log(payload);
    const notification = JSON.parse(payload);
    const notificationOption = {
        body: notification.body,
        icon: notification.icon
    };
    return self.registration.showNotification(payload.notification.title, notificationOption);
});