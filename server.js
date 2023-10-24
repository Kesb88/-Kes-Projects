/*************************************************************************************
* WEB322 - 2237 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Kester Bascillo
* Student ID    : 133266221
* Course/Section: WEB322 NEE
*
**************************************************************************************/

const path = require("path");
const rentals = require("./models/rentals-db");
const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const { title } = require("process");
const app = express();
// Make contents folder public

app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "/contents")));

app.use(express.urlencoded({ extended: false }));
// Add your routes here
// e.g. app.get() { ... }


app.get("/", (req, res) => {
    const featuredRentals = rentals.getFeaturedRentals();
    res.render("home",{
        rentals: featuredRentals,
        title: "Libby's",
        isMain: true
    });
});
app.get("/rentals", (req, res) => {
    const allRentals = rentals.getRentalsByCityAndProvince();
    res.render("rentals",{
        rentals: allRentals,
        title: "Rentals",
        isMain: false,
        footerRentals: true
    });
   
 });

 function isValidEmail(email){
    const verifyEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return verifyEmail.test(email);
 }
 function isValidPassword(password){
    const oneUpperCaseLetter = /[A-Z]/;
    const oneLowerCaseLetter = /[a-z]/;
    const oneSpecialCharacter = /[@#$%^&+=*-_!]/;
    const minSize = 8;
    const maxSize = 12;

    if(!password)
    {
        return "You must enter a password";
    }
    if(!oneUpperCaseLetter.test(password) || !oneLowerCaseLetter.test(password) || !oneSpecialCharacter.test(password) || password.length < minSize || password.length > maxSize)
    {
        return "You must have at least one upper & lower case letter, one special character and a password length between 8 - 12 characters";
    }

    return "valid";
 }
 function validFirstName(name){
    const specCharactersAndNumbers = /[^a-zA-Z]+/;

    if(!name)
    {
        return "You must enter a first name";
    }
    else if(name.length < 2 )
    {
        return "First name has to be more than two characters";
    }
    else if(specCharactersAndNumbers.test(name))
    {
        return "First name cannot have special characters or numbers";
    }
    else{
        return "valid";
    }
 }
 function validLastName(name){
    const specCharactersAndNumbers = /[^a-zA-Z]+/;

    if(!name)
    {
        return "You must enter a last name";
    }
    else if(name.length < 2 )
    {
        return "Last name has to be more than two characters";
    }
    else if(specCharactersAndNumbers.test(name))
    {
        return "Last name cannot have special characters or numbers";
    }
    else{
        return "valid";
    }
 }


app.get("/sign-up", (req, res) => {
    const values = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    };
    res.render("sign-up",{
        title: "Sign-up",
        values: values,
        validation: {}
    });
});

app.post("/sign-up", (req, res) => {

   let passedValidation = true;
   let validation = {};
   const { firstName, lastName, email, password } = req.body;

   const firstNameResult = validFirstName(firstName)
   if(firstNameResult !== "valid")
   {
     passedValidation = false;
     validation.firstName = [firstNameResult]
   } 
   const lastNameResult = validLastName(lastName)
   if(lastNameResult !== "valid")
   {
     passedValidation = false;
     validation.lastName = [lastNameResult]
   } 
   
    if(!email){
        passedValidation = false;
        validation.email = "You must enter an email";
    }
    else if(!isValidEmail(email))
    {
        passedValidation = false;
        validation.email = "You must enter a valid email";
    }
    const passwordResult = isValidPassword(password);

    if(passwordResult !== "valid" )
    {
        passedValidation = false;
        validation.password = [passwordResult];
    }
    if(passedValidation){
        res.send("Success");
    }
    else{
        res.render("sign-up", {
        title: "Sign-up",
        values: req.body,
        validation
    });

}});

app.get("/log-in", (req, res) => {
    res.render("log-in",{
        title: "Log-in"
    });
});

// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);