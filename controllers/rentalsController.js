const express = require("express");
const rentalModel = require("../models/rentalModel");
const router = express.Router();
const path = require("path");

router.get("/rentals", (req, res) => {
  const role = req.session.role;

  rentalModel.find()
    .then((rentals) => {
      if(!rentals || rentals.length === 0){
        return res.render("rentals/rentals", {
            title: "Rentals",
            isMain: false,
            footerRentals: true,
            role,
          });
        }
      const rentalsByCityAndProvince = {};

      rentals.forEach((rental) => {
        const cityProvince = rental.city + ', ' + rental.province;

        if (!rentalsByCityAndProvince[cityProvince]) {
          rentalsByCityAndProvince[cityProvince] = [];
        }

        rentalsByCityAndProvince[cityProvince].push(rental);
      });

      console.log(rentalsByCityAndProvince);

      res.render("rentals/rentals", {
        rentalsByCityAndProvince,
        title: "Rentals",
        isMain: false,
        footerRentals: true,
        role,
      });
    })
    .catch((err) => {
      console.error("Error fetching all rentals", err);
    });
});
 router.get("/list",(req, res) => {
    const role = req.session.role;
    if(!req.session.user || req.session.role !== "clerk"){
        res.status(401).send("You are not authorized to view this page");
        return;
    }
    rentalModel.find().sort({ headline: 1 })
    .then((rentals) => {
      res.render("rentals/list", {
        title: "Rental List",
        rentals,
        isMain: false,
        role
    });
    })
   .catch(err => {
      console.error("Error fetching rentals", err);
   })
});
 router.get("/logout", (req, res) => {
    res.session.destroy();
    res.redirect("/log-in");
});
router.get("/add", (req, res) => {
  const values = { 
    headline: ""
  }
  const role = req.session.role;
  if(!req.session.user || req.session.role !== "clerk"){
    res.status(401).send("You are not authorized to view this page");
    return;
}
  res.render("rentals/add", {
    title: "Add Rentals",
    role,
    values,
    validation: {}

  });

});
router.post("/add", (req, res) => {
  const role = req.session.role;
 
  let passedValidation = true;
  let validation = [];
  const { headline, 
          numSleeps, 
          numBedrooms, 
          numBathrooms, 
          pricePerNight, 
          city, 
          province, 
          imageUrl, 
          featuredRentals 
        } = req.body;

  rentalModel.findOne({ headline })
  .then((rentalExists) => {
    if(rentalExists){
      passedValidation = false;
      validation.headline = "Headline already exit";
      res.render("rentals/add", {
        title: "Add Rentals",
        values: req.body,
        validation,
        role
      });
    }
    else{
      const extensions = ['.jpeg', '.png', '.gif', '.jpg'];
      const rentalImage = req.files.imageUrl;
      const { name, ext } =  path.parse(rentalImage.name);

      if(!extensions.includes(ext.toLowerCase())){
        passedValidation = false;
        validation.imageUrl = "Image format must be '.jpeg', '.png', '.gif', '.jpg'";
      }
      const originalFileName = `${name}${ext}`;

      if(!passedValidation){
        res.render("rentals/add", {
          title: "Add Rentals",
          values: req.body,
          validation,
          role
        });
        return;
      }     
      const addRental = {
        headline, 
        numSleeps, 
        numBedrooms, 
        numBathrooms, 
        pricePerNight, 
        city, 
        province, 
        imageUrl, 
        featuredRentals
      };

      rentalModel.create(addRental)
      .then((newRental) => {

        rentalImage.mv(`contents/images/${originalFileName}`)
        .then(() => {
          rentalModel.updateOne({
            _id: newRental._id
          }, {
            imageUrl: originalFileName
          })
          .then(() => {
            console.log("Rental image updated");
            
            rentalModel.find()
            .then((rentals) => {
              res.render("rentals/list", {
                title: "Rental List",
                rentals,
                role,
                isMain: false
              });
            })
            .catch(err => {
              console.log("Error rendering updated rentals", err);
            });
          })
          .catch(err => {
            console.log("Error updating rental image", err);
          })
        })
        .catch(err => {
          console.log("Error adding rental image to folder", err);
        });
        console.log("Rental added to database", newRental);
      })
      .catch(err => {
        console.log("Error adding rental to database", err);
      })
    }
  })
  .catch(err => {
    console.error("Error checking for existing rental", err);
  });

});
router.get("/edit/:id", (req, res) => {
  const rentalId = req.params.id;

});
router.post("/edit/:id", (req, res) => {
  const rentalId = req.params.id;
});
router.get("/remove/:id", (req, res) => {
  const rentalId = req.params.id;
});
router.post("/remove/:id", (req, res) => {
  const rentalId = req.params.id;
});
 module.exports = router;