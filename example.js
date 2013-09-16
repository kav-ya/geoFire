var geoFire = require('./geoFire.js'),
    Firebase = require('Firebase');

var geoRef = new Firebase('https://kavya.firebaseio.com/geo'),
    geo = new geoFire(geoRef);

var mission = {"lat": 37.757008, "lon": -122.421237 };

// Car in Haight-Ashbury, car in South Beach
geo.searchAroundLoc(mission["lat"], mission["lon"], 7, function(results) {
        var cars = [];
        for (var ix = 0; ix < results.length; ix++) {
            cars.push(results[ix]['id']);
        }
        console.log('Cars within 7 kilometers of the Mission = ');
        console.log(cars.join(', '));
        console.log(' ');
    });

// User 'Nuri'
geo.searchAroundId(1, 5, function(results) {
        var users = [];
        for (var ix = 0; ix < results.length; ix++) {
            users.push(results[ix]['name']);
        }
        console.log('Users within 5 kilometers of car1' = );
        console.log(users.join(', '));
        console.log(' ');
        process.exit();
    });