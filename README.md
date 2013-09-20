geoFire
=======
**geoFire** is a helper library for location-based operations in [Firebase](https://www.firebase.com/).
It provides functions to store data for location querying in Firebase, 
and perform location queries such as location updates and localized searches.
geoFire stores the location coordinates of a data point as its [geohash] (http://en.wikipedia.org/wiki/Geohash) internally.

To use the geoFire library, include the geoFire.js script and create a geoFire object with the Firebase reference your data
will be stored at:

    var geoRef = new Firebase('https://abc.firebaseio-demo.com'),
        geo = new geoFire(geoRef);

You can see your Firebase data by navigating to the geoRef url.

The geoFire library provides functions to:
1. Store/remove data in Firebase for location queries:
       - insertByLoc
       - insertById
       - removeById

2. Perform location queries:
       - getLocById
       - updateLocById
       
3. Perform localized searches:
       - searchAroundLoc
       - searchAroundId

The library also has helper functions to:
4. Convert between latitude, longitude pairs and geohashes:
       - encode
       - decode

5. Convert between miles and kilometers:
       - miles2km
       - km2miles


1. Storing/removing data for location queries:
----------------------------------
###insertByLoc(latLon, data, [onComplete])

Inserts data solely by location. If the insert is successful, the optional callback function (if provided) is called with a null argument;
if the insert fails, an error message is printed to console.

    var car1 = { id: 1, make: "Tesla" };

    // No callback function.
    geo.insertByLoc([37.771393, -122.447104], car1); 

     // With a callback function.
    geo.insertByLoc([37.771393, -122.447104], car1, function() { console.log("Insert done!"); });

###insertById(latLon, id, data, [onComplete])

Inserts data by location and a client-provided identifer. If the insert is successful, the optional callback function (if provided) is called
with a null argument; if the insert fails, an error message is printed to console.
**Data that is inserted using this function can be queried using the client-provided Id.**

    var car2 = { id: 2, make: "BMW" };

    // No callback function.
    geo.insertById([37.780314, -122.513698], car2.id, car2);

    // With a callback function.
    geo.insertById([37.780314, -122.513698], car2.id, car2, function() { console.log("Insert done!); });

###removeById(id, [onComplete])

Removes a data point that was inserted using `insertById` and calls the optional callback function, if provided. The 
callback is passed a null argument on success and an Error on failure.

    // No callback function.
    geo.removeById(car2.id);

    // With a callback function.
    geo.removeById(car2.id, function(error) { if(!error) console.log("Remove done!"); });

2. Performing location queries:
----------------------------


###getLocById(id, callback)

Retrieves the location of a data point that was inserted by Id. The location is passed to the callback function as an array with two elements: array[0]-> latitude, array[1]-> longitude.

    geo.getLocById(car2.id, cb); // calls cb([37.780314, -122.513698])

###updateLocById(newLatLon, id)
Updates the location of a data point that was inserted by Id.
    
    geo.updateLocById([36.01234, -121.51369], car2.id);





Generating a geohash:
---------------------
###encode(latLon, hashLength)

Generates the geohash of a latitude and longitude pair. The pair is passed in as an array, with array[0]-> latitude and array[1]-> longitude.
The length of the geohash, as indicated by the hashLength, indicates its precision.

    var geo = new geoFire('https://kavya.firebaseio.com/geo');

    var data = { name: Nuri };
    var loc = [37.757008, -122.421237]; // loc[0] is the latitude, loc[1] is the longitude
    var geohash = geo.encode(loc, data); // geohash = "9q8yy1rwd2mt" 

Retrieving a location:
----------------------
###decode(geohash)

Returns the latitude and longitude from a geohash, as a array with two elements: array[0]-> latitude, array[1]-> longitude

    var location = geo.decode("q8yy1rwd2mt");
    var latitude = location[0]; // latitude = 37.757008
    var longitude = location[1]; // longitude = -122.421237


***
geoFire provides two functions to get the data points surrounding a point:

###searchAroundLoc(latLon, searchRadius, callback)

Finds all data points within the searchRadius from the source point. The source point is specified by its latitude and longitude (in an array),
the searchRadius is in kilometers. The data points are **sorted by distance** and passed to the callback function.

    geo.searchAroundLoc([37.771393, -122.447104], 5, cb);

###searchAroundId(id, searchRadius, callback)

Finds all data points within the searchRadius from the source point. The source point is specified by its id,
the searchRadius is in kilometers. The data points are **sorted by distance** and passed to the callback function.

    geo.searchAroundId(car2.id, 5, cb);