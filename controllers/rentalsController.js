const express = require("express");
const rentals = require("../models/rentals-db");
const router = express.Router();

router.get("/rentals", (req, res) => {
    const role = req.session.role;
    const allRentals = rentals.getRentalsByCityAndProvince();
    res.render("rentals/rentals",{
        rentals: allRentals,
        title: "Rentals",
        isMain: false,
        footerRentals: true,
        role
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


 module.exports = router;