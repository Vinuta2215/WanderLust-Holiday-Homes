
const Listing = require("../models/listing"); 


module.exports.index = async (req, res) => { 
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { listings: allListings });

};


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs", { listing: {} });
};


module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({ 
            path: "reviews", 
            populate: { path: "author"}})
        .populate("owner");
    if(!listing) {
        req.flash("error", "listing you requested for does not exist")
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};


module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing( req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    res.redirect("/listings");
};


module.exports.renderEditForm = async (req, res ) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "listing you requested for does not exist")
        res.redirect("/listings");
    }
 
    let originalImageUrl = listing.image.url; 
        originalImageUrl= originalImageUrl.replace("upload", "/upload/w_250")
        res.render("listings/edit.ejs", { listing, originalImageUrl });
};


module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined") {
        let url = req.file.path; 
        let filename = req.file.filename;  
        listing.image = { url, filename }; 
        await listing.save();    
    }
    req.flash("success","Listing Updated!!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "listing deleted");
    res.redirect("/listings");
};

// controllers/listings.js
// Add this function to your existing controller

module.exports.filterListingsByCategory = async (req, res) => {
    const { category } = req.query;
    let filter = {};
    
    switch(category) {
      case "Trending":
        filter = { category: "Trending" };
        break;
      case "Rooms":
        filter = { category: "Rooms" };
        break;
      case "Iconic Cities":
        // Get listings from iconic cities (you might need to adjust this based on your data structure)
        const iconicCities = ["Paris", "New York", "Tokyo", "London", "Rome"];
        filter = { location: { $in: iconicCities } };
        break;
      case "Castles":
        filter = { category: "Castles" };
        break;
      case "Mountain Views":
        filter = { category: "Mountain Views" };
        break;
      case "Camping":
        filter = { category: "Camping" };
        break;
      case "Amazing Nature":
        filter = { category: "Amazing Nature" };
        break;
      case "Farms":
        filter = { category: "Farms" };
        break;
      case "Arctic":
        // You could filter by countries in Arctic regions
        const arcticCountries = ["Iceland", "Norway", "Finland", "Sweden", "Russia", "Canada", "Greenland"];
        filter = { country: { $in: arcticCountries } };
        break;
      case "Boats":
        filter = { category: "Boats" };
        break;
      default:
        // No filter, show all listings
        break;
    }
    
    const listings = await Listing.find(filter).populate("owner");
    res.render("listings/index", { listings });
  };

  // Add this to controllers/listings.js
module.exports.searchListings = async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim() === '') {
    return res.redirect('/listings');
  }
  
  // Create a case-insensitive search query for multiple fields
  const searchQuery = {
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
      { country: { $regex: q, $options: 'i' } }
    ]
  };
  
  const listings = await Listing.find(searchQuery).populate("owner");
  res.render("listings/index", { listings, searchQuery: q });
};