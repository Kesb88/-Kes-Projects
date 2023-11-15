const express = require("express");
const rentalModel = require("../models/rentalModel");
const router = express.Router();

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
    res.render("rentals/list", {
        title: "Rental List",
        role
    });
});
 router.get("/logout", (req, res) => {
    res.session.destroy();
    res.redirect("/log-in");
});
router.get("/add", (req, res) => {

});
router.post("/add", (req, res) => {

});
router.get("/edit/:id", (req, res) => {

});
router.post("/edit/:id", (req, res) => {

});
router.get("/remove/:id", (req, res) => {

});
router.post("/remove/:id", (req, res) => {

});
 module.exports = router;