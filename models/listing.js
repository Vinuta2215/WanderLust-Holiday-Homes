const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },

    description: String,

    image: {
       url: String,
       filename: String,
    },

    price: Number,

    location: String,

    country: String,

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],

    owner: 
        {
        type: Schema.Types.ObjectId,
        ref: "User",
        },
    
        category: {
          type: String,
          enum: ["Trending", "Rooms", "Iconic Cities", "Castles", "Mountain Views", "Camping", "Amazing Nature", "Farms", "Arctic", "Boats"],
          required: true
        },      
});


listingSchema.post("findOneAndDelete", async (listing) => {
  if(listing) {
    await Review.deleteMany({_id: {$in: listing.reviews}});
  }
});

//CREATING MODULE
const Listing = mongoose.model("Listing", listingSchema) ;

//and exporting this model to app.js with
module.exports = Listing;