const express = require("express");
const router = express.Router();
const rentalModel = require("../models/rentalModel");
const rentals = require("../models/rentals-db");

router.get("/rentals", (req, res) => {
  const role = req.session.role;

  if (!req.session.user || req.session.role !== "clerk") {
    res.status(401).render("general/error", {
      title: "Restricted Access",
      message: "You are not authorized to add rentals",
      role,
    });
    return;
  }

  rentalModel
    .find()
    .then((rentalExist) => {
      if (rentalExist.length > 0) {
        res.render("load-data/rentals", {
          title: "Load Rentals",
          role,
          message: "exist",
        });
      } else {
        rentalModel
          .insertMany(rentals)
          .then(() => {
            res.render("load-data/rentals", {
              title: "Load Rentals",
              role,
              message: "added",
            });
          })
          .catch((err) => {
            console.error("Error adding rentals to database", err);
          });
      }
    })
    .catch((err) => {
      console.error("Error checking for existing rentals", err);
    });
});

module.exports = router;
