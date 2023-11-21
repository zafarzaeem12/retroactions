const  server = require('https')
const { createServer } =require("http");
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv/config');
const bodyparser = require('body-parser');
const api = process.env.API_URL;
const fs = require("fs")
const path = require('path');
var cors = require('cors')


//route

const restaurantsroute = require('./controllers/restaurants');
const announcementsroute = require('./controllers/announcements');
const interestroute = require('./controllers/interest');
const userroute = require('./controllers/users');

const countryroute = require('./controllers/country');
const userreviews = require('./controllers/userreviews');
const termsandcondition = require('./controllers/termsandcondition');
const privacypolicy = require('./controllers/privacypolicy');
const  subscriptions = require('./controllers/subscription');
const usersubscriptions = require('./controllers/usersubscriptions');
const notification = require('./controllers/noitification');

//middleware

// parse application/x-www-form-urlencoded
//app.use(express.static(path.join(__dirname + '/public/uploads/images')));
app.use(bodyparser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyparser.json())
app.use(cors())

app.use('/public/uploads/images', express.static(path.join(__dirname, 'public/uploads/images')));


app.use(`${api}`, restaurantsroute);
app.use(`${api}`, announcementsroute);
app.use(`${api}`, interestroute);
app.use(`${api}`, userroute);

app.use(`${api}`, countryroute);
app.use(`${api}`, userreviews);
app.use(`${api}`, termsandcondition);
app.use(`${api}`, privacypolicy);

app.use(`${api}`, usersubscriptions);
app.use(`${api}`, notification);
app.get('/', (req, res) => {
    res.send(`${api}/oo`)
});
//app.use("/uploads/images", express.static("/uploads/images"));


//connectivity code
mongoose.set('strictQuery', false);
mongoose.connect(process.env.COLLECTION)
    .then(() => {
        console.log('database is connected')
        console.log(api);
    })
    .catch(() => {
        console.log('database is not connected')
    })

// ------------------------- this is server code please excute if run on server start -------------------------------------

const serverSSL = {
  key: fs.readFileSync(
    // "/home/retroactionapide/ssl/keys/c31a8_303e5_f7cba9287167de16dce01c08280bc6cd.key"
    "/home/retroactionapide/ssl/keys/ba82d_79289_d166b110a7fd621f9640a44131430a57.key"
  ),
  cert: fs.readFileSync(
      
    // "/home/retroactionapide/ssl/certs/retroactionapi_dev_thesuitchstaging_com_c31a8_303e5_1727869858_42eacdf229dceae98dce7d8c9e7be292.crt"
    "/home/retroactionapide/ssl/certs/retroactionapi_dev_thesuitchstaging_com_ba82d_79289_1704153599_bbcc635a90a29bec20589732a672f4cd.crt"
  ),
  ca: fs.readFileSync("/home/retroactionapide/ssl/certs/ca.crt")
}
const httpsServer = server.createServer(serverSSL,
    app
  )
const PORT = process.env.PORT;

httpsServer.listen(PORT, () => { console.log(`App listening on port ${PORT}!`); });
//-------------------------------- this is server code please excute if run on server end -----------------------------------------

// -------------------this is a local code excute if run on local server start -----------------------------------------------

// const httpServer = createServer(app);

// const port = process.env.PORT || 3000;


// -------------------this is a local code excute if run on local server end -----------------------------------------------

// httpServer.listen(port, async () => {

//   console.log("Server listening on port " + port);
// });
