const express = require("express");
const router = express.Router();
const rentalModel = require("../models/rentalModel");
const userModel = require("../models/userModel");
const bcryptjs = require("bcryptjs");

router.get("/", (req, res) => {
    const role = req.session.role;
    rentalModel.find({ featuredRentals: true })
    .then((featuredRentals) => {
        res.render("general/home",{
            rentals: featuredRentals,
            title: "Libby's",
            isMain: true,
            role
        });
    })
    .catch(err => {
        console.error("Error fetching featured rentals", err);
    })
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
        values,
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

    if(!req.session.user){
        res.status(401).send("You are not authorized to view this page");
    }
    res.render("general/welcome",{
        title: "Welcome Page"
    });
});
router.get("/cart", (req, res) => {
    const role = req.session.role;

    if (!req.session.user || req.session.role !== "customer") {
        res.status(401).send("You are not authorized to view this page");
        return;
    }

    const rentalId = req.query.rentalId;
    const removeRental = req.query.removeRental;
    const updatedNights = req.query.nights;
    let addRentalMessage = '';
    let removeRentalMessage = '';

    if (removeRental) {
        const removedRental = req.session.cart.find(rental => rental.rentalId === removeRental);

        if (removedRental) {
            req.session.cart = req.session.cart.filter(rental => rental.rentalId !== removeRental);
            removeRentalMessage = `You removed item from the cart.`;
        } else {
            removeRentalMessage = 'Rental not found in the cart.';
        }
    }

    if (rentalId) {
        req.session.cart = req.session.cart || [];
        const existingRental = req.session.cart.find(rental => rental.rentalId === rentalId);

        if (existingRental) {
            existingRental.nights = updatedNights;
        } else {
            req.session.cart.push({ rentalId, nights: 1});
        }

        rentalModel.findById(rentalId)
            .then((addedRental) => {
                console.log('Fetched rental details:', addedRental);
                req.session.addedRental = addedRental;
                addRentalMessage = `You added ${addedRental.headline} to the cart!`;
                console.log('Rental added to cart:', existingRental);
            })
            .catch(err => {
                console.log('Error adding rental', err);
            });
    }

    let subtotal = 0;
    let tax = 0;
    let total = 0;

    if (req.session.cart?.length > 0) {
        rentalModel.find({ _id: { $in: req.session.cart.map(item => item.rentalId) } })
            .then((cartRentals) => {
                subtotal = req.session.cart.reduce((acc, rental) => {
                    const cartRental = cartRentals.find(item => item._id.toString() === rental.rentalId);
                    if (cartRental) {
                        return acc + (cartRental.pricePerNight * rental.nights);
                    }
                    return acc;
                }, 0);

                const taxed = process.env.TAX_RATE;
                tax = subtotal * taxed;
                total = subtotal + tax;

                res.render("general/cart", {
                    title: "Rental Cart",
                    role,
                    rentals: cartRentals,
                    cart: req.session.cart,
                    tax: tax.toFixed(2),
                    total: total.toFixed(2),
                    subtotal: subtotal.toFixed(2),
                    req,
                    addRentalMessage,
                    removeRentalMessage
                });

                req.session.addedRental = null;
            })
            .catch(err => {
                console.log("Error adding rentals into cart", err);
            });
    } else {
        res.render("general/cart", {
            title: "Rental Cart",
            role,
            rentals: [],
            subtotal,
            tax,
            total,
            req,
            addRentalMessage,
            removeRentalMessage,
        });
    }
});
router.post("/cart", (req, res) => {
    
    const user = req.session.user.email;
    req.session.cart = req.session.cart || [];

    const formData = require('form-data');
    const Mailgun = require('mailgun.js');
  
    const API_KEY = process.env.MG_API_KEY;
    const DOMAIN = process.env.MG_DOMAIN;
  
    const mailgun = new Mailgun(formData);
    const client = mailgun.client({ username: 'api', key: API_KEY });

    const rentalInfo = req.session.cart.map(item => item.rentalId);

    rentalModel.find({ _id: { $in: rentalInfo }})
    .then((cartRentals) => {
    const msg = {
        to: user,
        from: "Libby's Rental Properties<bascillok@gmail.com>",
        subject: "Libby's Rental Team",
        html: `
        <h3>Thank you ${req.session.user.firstName}, for placing your order!</h3>
                    <p>Order Receipt</p>
                    <ul>
                        ${req.session.cart.map(cartItem => {
                            const rental = cartRentals.find(item => item._id.toString() === cartItem.rentalId);
                            return `
                                <li>
                                    <strong>Rental:</strong> ${rental.headline}<br>
                                    <strong>City:</strong> ${rental.city}<br>
                                    <strong>Province:</strong> ${rental.province}<br>
                                    <strong>Number of Nights:</strong> ${cartItem.nights}<br>
                                    <strong>Price per Night:</strong> $${(rental.pricePerNight).toFixed(2)}<br>
                                    <strong>Total Price:</strong> $${(rental.pricePerNight * cartItem.nights).toFixed(2)}<br>
                                </li>
                                <br>
                            `;
                        })}
                    </ul>
                `,
            };
            client.messages.create(DOMAIN, msg)
            .then(() => {
                console.log("Order details sent successfully");
                req.session.cart = [];
                res.redirect("/cart");
            })
            .catch(err => {
                console.log("Error sending order details email", err);
            }); 
        })
});
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/log-in");
})


module.exports = router;

