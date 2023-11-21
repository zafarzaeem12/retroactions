const Joi = require("joi");

module.exports.restaurantBodyUpdateValidator = Joi.object({
  restaurantName: Joi.string(),
  restaurantDescription: Joi.string(),
  restaurantStreet: Joi.string(),
  // restaurantCountry: Joi.string(),
  // restaurantCity: Joi.string(),
  // restaurantZip: Joi.string(),
  restaurantEmail: Joi.string(),
  restaurantPassword: Joi.string(),
  
  restaurantInterest: Joi.array(),
  // deleteVideos: Joi.array(),
  deletePortfolio: Joi.array(),
  // deleteVideos: Joi.string(),
  deletePortfolio: Joi.string(),
  deleteImages: Joi.string(),
  deleteImages: Joi.array(),

});

module.exports.restaurantFilesUpdateValidator = Joi.object({
  restaurantImage: Joi.array().length(1),
  // restaurantVideo: Joi.array().min(1).max(2),
  restaurantPortfolio: Joi.array().min(1).max(5),
});
