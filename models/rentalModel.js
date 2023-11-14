const mongoose  = require("mongoose");

const rentalSchema = new mongoose.Schema({
  headline: String,     
  numSleeps: Number, 
  numBedrooms: Number, 
  numBathrooms: Number, 
  pricePerNight: Number, 
  city: String, 
  province: String, 
  imageUrl: String, 
  featuredRentals: Boolean
});

const rentalModel = mongoose.model("rentals", rentalSchema);

module.exports = rentalModel;