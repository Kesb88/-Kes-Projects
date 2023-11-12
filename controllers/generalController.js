const express = require("express");
const router = express.Router();
const rentals = require("../models/rentals-db");
const userModel = require("../models/userModel");
const bcryptjs = require("bcryptjs");

router.get("/", (req, res) => {
    const role = req.session.role;
    const featuredRentals = rentals.getFeaturedRentals();
    res.render("general/home",{
        rentals: featuredRentals,
        title: "Libby's",
        isMain: true,
        role
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


router.get("/sign-up", (req, res) => {
    const values = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    };
    res.render("general/sign-up",{
        title: "Sign-up",
        values: values,
        validation: {}
    });
});

router.post("/sign-up", (req, res) => {

   let passedValidation = true;
   let validation = [];
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
  const formData = require('form-data');
  const Mailgun = require('mailgun.js');

  const API_KEY = process.env.MG_API_KEY;
  const DOMAIN = process.env.MG_DOMAIN;

  const mailgun = new Mailgun(formData);
  const client = mailgun.client({ username: 'api', key: API_KEY });

  const msg = {
    to: email,
    from: "Libby's Rental Properties<bascillok@gmail.com>",
    subject: "Libby's Rental Team",
    html: `
      <p>Hello ${firstName} ${lastName}</p>
      <p>Welcome to Libby's rental properties</p>
      <p>This is a message from Kester Basciilo at Libby's</p>
    `
  }
   userModel.findOne({ email })
  .then(userExist => {
    if(userExist){
        passedValidation = false;
        validation.email = "Email already exists";
        res.render("general/sign-up", {
            title: "Sign-up",
            values: req.body,
            validation
          });
    }else{
        const newUser = new userModel({
            firstName,
            lastName,
            email,
            password
        })
        newUser.save()
            .then(userSaved => {
                console.log(`User ${userSaved.firstName} has been successfully added to database..`);
                client.messages.create(DOMAIN, msg)
                .then(() => {
                    res.redirect("/welcome");
                })
                .catch(err => {
                    console.error('Error sending email...', err);
                    res.render("general/sign-up", {
                        title: "Sign-up",
                        values: req.body,
                        validation
                    });
                });
                
            })
            .catch(err => {
                console.error(`Error, user could not be added.. ${err}`);
                res.render("general/sign-up", {
                    title: "Sign-up",
                    values: req.body,
                    validation
                  });
            });
        }
    })
    .catch(error => {
        console.error('Error, failed checking email...', error);
        res.render("general/sign-up", {
          title: "Sign-up",
          values: req.body,
          validation
        });
      });
} else {
  res.render("general/sign-up", {
    title: "Sign-up",
    values: req.body,
    validation,
  });
}
});

router.get("/log-in", (req, res) => {
    const values = {
        email: '',
        password: ''
    };
    res.render("general/log-in",{
        title: "Log-in",
        values: values,
        validation: {},
        role: req.body.role
    });
});
router.post("/log-in", (req, res) => {

 
    let passedValidation = true;
    let validation = [];

    const { email, password, role } = req.body;

    if(!password){
        passedValidation = false;
        validation.password = "Enter a valid password";
    }
    if(!email){
        passedValidation = false;
        validation.email = "Enter a valid email address"
    }

    if(passedValidation){
        userModel.findOne({ email })
        .then(user => {
            if(user){
                bcryptjs.compare(password, user.password)
                .then(matchedPsw => {
                    if(matchedPsw){
                        
                        req.session.user = user;

                        if (user && role === "clerk") {
                            req.session.role = "clerk";
                            res.redirect("/rentals/list");
                        } else {
                            req.session.role = "customer";
                            res.redirect("/cart");
                        }
                    }
                    else{
                        passedValidation = false;
                        validation.password = ("Password did not match database password");
                
                        res.render("general/log-in",{
                            title: "Log-in",
                            values: req.body,
                            validation
                        });
                    }
                })
                .catch(err => {
                    passedValidation = false;
                    validation.password = ("Password validation failed.." + err);
            
                    res.render("general/log-in",{
                        title: "Log-in",
                        values: req.body,
                        validation
                    });
                });
            }
            else{
                passedValidation = false;
                validation.email = ("Email was not found in database");
        
                res.render("general/log-in",{
                    title: "Log-in",
                    values: req.body,
                    validation
                });
            }
    
        })
        .catch(err => {
            validation.push("Error, user could not be found in database.. " + err);
            console.error(validation[0]);
    
            res.render("general/log-in",{
                title: "Log-in",
                values: req.body,
                validation
            });
         });
    }
    else{
        res.render("general/log-in",{
            title: "Log-in",
            values: req.body,
            validation
        });
    } 
   
});

router.get("/welcome", (req, res) => {
    res.render("general/welcome",{
        title: "Welcome Page"
    });
});
router.get("/cart", (req, res) => {
    const role = req.session.role;
    if(!req.session.user || req.session.role !== "customer"){
        res.status(401).send("You are not authorized to view this page");
        return;
    }
    res.render("general/cart", {
        title: "Rental Cart",
        role

    });
});
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/log-in");
})


module.exports = router;

