var rentals =  [
      {
        headline:"Yellowhead Trail", 
        numSleeps:4, 
        numBedrooms: 2, 
        numBathrooms: 1, 
        pricePerNight: 170, 
        city:"Edmonton", 
        province:"Alberta", 
        imageUrl: "house3.jpg", 
        featuredRentals: true,
      },
      {
        headline:"Lakeside Drive",
        numSleeps:8, 
        numBedrooms: 4, 
        numBathrooms: 3, 
        pricePerNight: 225, 
        city:"Edmonton", 
        province:"Alberta", 
        imageUrl: "house4.jpg", 
        featuredRentals: false
      },
      {
        headline:"Malone Way", 
        numSleeps:2, 
        numBedrooms: 1, 
        numBathrooms: 1, 
        pricePerNight: 80, 
        city:"Edmonton", 
        province:"Alberta", 
        imageUrl: "house5.jpg", 
        featuredRentals: true
      },
      {
        headline:"Pine Drive",
        numSleeps:7, 
        numBedrooms: 3, 
        numBathrooms: 2, 
        pricePerNight: 175, 
        city:"Edmonton", 
        province:"Alberta", 
        imageUrl: "house6.jpg", 
        featuredRentals: false
      },
      {
        headline:"Sparling Court", 
        numSleeps:3, 
        numBedrooms: 2, 
        numBathrooms: 1, 
        pricePerNight: 90, 
        city:"Edmonton", 
        province:"Alberta", 
        imageUrl: "house7.jpg", 
        featuredRentals: false
      },
      {
        headline:"Tammarack Gate", 
        numSleeps:10, 
        numBedrooms: 5, 
        numBathrooms: 4, 
        pricePerNight: 250, 
        city:"Edmonton", 
        province:"Alberta", 
        imageUrl: "house8.jpg", 
        featuredRentals: true
      },

      {
        headline:"Brant Street", 
        numSleeps:6, 
        numBedrooms: 3, 
        numBathrooms: 1.5, 
        pricePerNight: 165, 
        city:"Toronto", 
        province:"Ontario", 
        imageUrl: "house1.jpg", 
        featuredRentals: true
      },
      {
        headline:"Lakeshore Boulevard", 
        numSleeps:2, 
        numBedrooms: 1, 
        numBathrooms: 1, 
        pricePerNight: 75, 
        city:"Toronto", 
        province:"Ontario", 
        imageUrl: "house2.jpg", 
        featuredRentals: true
      },
     { 
        headline:"Avenue Road", 
        numSleeps:6, 
        numBedrooms: 3, 
        numBathrooms: 2, 
        pricePerNight: 155, 
        city:"Toronto", 
        province:"Ontario", 
        imageUrl: "house9.jpg", 
        featuredRentals: false
      },
      {
        headline:"Forest Hill", 
        numSleeps:8, 
        numBedrooms: 4, 
        numBathrooms: 3, 
        pricePerNight: 200, 
        city:"Toronto", 
        province:"Ontario", 
        imageUrl: "house10.jpg", 
        featuredRentals: false
      },
      {
        headline:"SummerHill Drive", 
        numSleeps:3, 
        numBedrooms: 1, 
        numBathrooms: 1, 
        pricePerNight: 65, 
        city:"Toronto", 
        province:"Ontario", 
        imageUrl: "house11.jpg", 
        featuredRentals: false
      },
      {
        headline:"Rosedale Street",     
        numSleeps:6, 
        numBedrooms: 2, 
        numBathrooms: 2, 
        pricePerNight: 140, 
        city:"Toronto", 
        province:"Ontario", 
        imageUrl: "house12.jpg", 
        featuredRentals: false
      }
  ];
module.exports.getRentalsByCityAndProvince = function(){
    const allRentals = {};

    for (const rental of rentals) {
      const { city, province } = rental;
      const cityProvince = `${city}, ${province}`;
  
      if (!allRentals[cityProvince]) {
        allRentals[cityProvince] = {
          cityProvince: cityProvince,
          rentals: [],
        };
      }
      allRentals[cityProvince].rentals.push(rental);
    }
    const allGroupedRentals = Object.values(allRentals);
    return allGroupedRentals;
};
  
module.exports.getFeaturedRentals = function(){
    let filtered = [];  
    for(let i = 0; i < rentals.length; i++){
        if(rentals[i].featuredRentals){
            filtered.push(rentals[i]);
        }
    }
    return filtered;
};
