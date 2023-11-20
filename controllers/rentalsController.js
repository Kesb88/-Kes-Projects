const express = require("express");
const rentalModel = require("../models/rentalModel");
const router = express.Router();
const path = require("path");
const fs  = require("fs");

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
    headline: "",
    imageUrl: ""
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
            console.log("Rental image added to list page"); 
            rentalModel.find()
            .then(() => {
              res.redirect("/rentals/list");
            })
            .catch(err => {
              console.log("Error rendering added rentals", err);
            });
          })
          .catch(err => {
            console.log("Error adding rental image", err);
          })
        })
        .catch(err => {
          console.log("Error adding rental image to folder", err);
        });
        console.log("Rental added to database");
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

  const values = {
    imageUrl: ""
  }
  const rentalId = req.params.id;
  const role = req.session.role;

  if(!req.session.user || req.session.role !== "clerk"){
    res.status(401).send("You are not authorized to view this page");
    return;
}
  rentalModel.findById(rentalId)
    .then((rentals) => {
      if(!rentals){
        console.log("Rentals not found");
      }
      const oldImageFile = rentals.imageUrl;

      const oldImage = path.join(__dirname, "../contents/images/", oldImageFile);

        if(fs.existsSync(oldImage)){
          fs.unlinkSync(oldImage);
          console.log("Old image has been remove from images folder");
        }
        else{
          console.log("Old image not found");
        } 
      console.log("Rentals found", rentals);
      res.render("rentals/edit", {
        title: "Edit Rental",
        values,
        rentals,
        role,
        validation: {}
      });
    })
    .catch(err => {
      console.log("Error fetching rentals for edit page", err);
    })

});
router.post("/edit/:id", (req, res) => {

  const rentalId = req.params.id;
  const role = req.session.role;
  const updatedRental = req.body;

  let passedValidation = true;
  let validation = [];


  const extensions = ['.jpeg', '.png', '.gif', '.jpg'];
  const rentalImage = req.files.imageUrl;
  const { name, ext } =  path.parse(rentalImage.name);

    if(!extensions.includes(ext.toLowerCase())){
      passedValidation = false;
      validation.imageUrl = "Image format must be '.jpeg', '.png', '.gif', '.jpg'";
    }
    const originalFileName = `${name}${ext}`;

    if(!passedValidation){

      res.render("rentals/edit", {
        title: "Edit Rentals",
        values: req.body,
        validation: {},
        role,
        rentals: {}
      });
      return;
    } 

  rentalImage.mv(`contents/images/${originalFileName}`)
    .then(() => {

        rentalModel.findByIdAndUpdate(rentalId, { imageUrl: originalFileName, ...updatedRental }, { new: true })
        .then((updatedRental) => {
          if(!updatedRental){
            console.log("Rental image not found");
            return;
          } 
          console.log("Rental image updated");
          res.redirect("/rentals/list");
        })
        .catch(err => {
          console.log("Error updating rental data", err); 
          res.render("rentals/edit", {
            title: "Rental List",
            rentals: {},
            values: req.body,
            role,
            validation: {}
          });     
        });
      })
      .catch(err => {
        console.log("Rental image failed to update", err);
      });
});
router.get("/remove/:id", (req, res) => {

  const role = req.session.role;
  const rentalId = req.params.id;

  if(!req.session.user || req.session.role !== "clerk"){
    res.status(401).send("You are not authorized to view this page");
    return;
}

  rentalModel.findById(rentalId)
    .then((rentals) => {
      if(!rentals){
        console.log("Rental not found");
        return;
      }
      res.render("rentals/remove",{
        title: "Remove Rental",
        rentals,
        role
      }); 
    })
    .catch(err => {
      console.log("Error finding rental", err);
    })

});
router.post("/remove/:id", (req, res) => {

  const rentalId = req.params.id;
  const removeRental = req.body.confirmed === "true";

  if(!removeRental){
    console.log("No confirmation provided");
    res.redirect("/rentals/list");
    return;
  }

  rentalModel.findByIdAndDelete(rentalId)
  .then((removeData) => {
    if(!removeData){
      console.log("Rental not found"); 
      res.redirect("/rentals/list");
      return; 
    }
    const removeImage = path.join(__dirname,"../contents/images/", removeData.imageUrl);

    if (fs.existsSync(removeImage)) {
      fs.unlinkSync(removeImage);
      console.log("Rental deleted successfully");
      res.redirect("/rentals/list");
    } else {
      console.log("Image file not found");
    }
  })
  .catch(err => {
    console.log("Error removing rental", err);
    res.redirect("/rentals/list");
  })
});
 module.exports = router;