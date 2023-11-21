const mongoose = require("mongoose");
const restaurantspromoschema = new mongoose.Schema({
 
  promo_code:{
    type : String
  },
  promo_activation_code:{
    type : Number
  },

  promo_code_limit : {
    type : Number,
    min : 1,
    max : 10
  },

  promo_code_type : {
    type : String,
    enum : ['wholeRestuarent' , 'item' , 'deal'],
    default : 'wholeRestuarent'
  },

  itemName : {
    type : String
  },
  itemImage : {
    type : String
  },

  dealImage:{
    type : String
  },
  dealName:[{ 
    name :{ type : String }
  }],


  promo_code_discount : {
    type : Number,
    default : 0
  },

  restaurantsName:{
    type : String
  },

  generatedBy :{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'restaurants'
  },

  usedBy : [{
    userid:{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'users',
     }
}],

  promo_code_validity: {
    type : String
  },

  is_promo_code_disable: {
    type : Boolean,
    default : false
  },
  
   promo_description: {
    type : String
  },
  
    announcement_id:{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Announcements',
     }

});

// restaurantspromoschema.virtual("id").get(function () {
//   return this._id.toHexString();
// });

// restaurantspromoschema.set("toJSON", {
//   virtuals: true,
// });
exports.Restaurants_Promo = mongoose.model("promocode", restaurantspromoschema);
exports.restaurantspromoschema = restaurantspromoschema;
