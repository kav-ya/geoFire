var geoFire = require('./geoFire.js'),
    Firebase = require('Firebase');

// To save location data to Firebase, geoFire needs a Firebase reference;
// this is where data is saves
var refName = randomString(10);
var geoRef = new Firebase('https://'+refName+'.firebaseio-demo.com/geo');
    geo = new geoFire(geoRef);

var mission = [37.757008, -122.421237];

// Car in Haight-Ashbury, car in South Beach
geo.searchAroundLoc(mission[0], mission[1], 7, function(results) {
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

/** Generates a random string **/
function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
