geoFire
=======
**geoFire** is a helper library for location-based operations in [Firebase](https://www.firebase.com/).
It provides functions to generate [geohashes](http://en.wikipedia.org/wiki/Geohash), store data for location queries and
perform location queries such as location updates and localized searches.

Generating a geohash:
---------------------
###encode(latitude, longitude, hashLength)

Generates the geohash of the latitude and longitude. The length of the geohash, as indicated by the hashLength, indicates its precision.

    var geo = new geoFire('https://kavya.firebaseio.com/geo');
    var geohash = geo.encode(37.757008, -122.421237, 12); // geohash = "9q8yy1rwd2mt" 

Retrieving a location:
----------------------
###decode(geohash)

Returns the latitude and longitude from a geohash, as a dictionary with two keys: "lat" and "lon"

    var location = geo.decode("q8yy1rwd2mt");
    var latitude = location["lat"]; // latitude = 37.757008
    var longitude = location["lon"]; // longitude = -122.421237

Storing data for location queries:
----------------------------------
###insertByLoc(latitude, longitude, data, [callback])

Inserts data solely by location. If the insert is successful, the callback function (if provided) is called;
if the insert fails, an error message is printed to console.

    var car1 = { id: 1, make: "Tesla" };
    geo.insertByLoc(37.771393, -122.447104, car1, cb);

###insertById(latitude, longitude, id, data, [callback])

Inserts data by location and a client-provided identifer. If the insert is successful, the callback function (if provided) is called;
if the insert fails, an error message is printed to console.
Data that is inserted using this function can be queried using the client-provided Id.

    var car2 = { id: 2, make: "BMW" };
    geo.insertById(37.780314, -122.513698, car2.id, car2, cb);

###removeById(id)

Removes a data point that was inserted by Id.

    geo.removeById(car2.id);

Performing location queries:
----------------------------
geoFire supports the following operations on data points inserted by Id:

###getLocById(id, callback)

Retrieves the location of a data point that was inserted by Id. The location is passed to the callback function as a dictionary with two keys: "lat" and "lon".

    geo.getLocById(car2.id, cb); // calls cb({ "lat": 37.780314,"lon":-122.513698 })

###updateLocById(newLatitude, newLongitude, id)
Updates the location of a data point that was inserted by Id.
    
    geo.updateLocById(newLat2, newLon2, car2.id);

***
geoFire provides two functions to get the data points surrounding a point:

###searchAroundLoc(latitude, longitude, searchRadius, callback)

Finds all data points within the searchRadius from the source point. The source point is specified by its latitude and longitude,
the searchRadius is in kilometers. The data points are **sorted by distance** and passed to the callback function.

    geo.searchAroundLoc(37.771393, -122.447104, 5, cb);

###searchAroundId(id, searchRadius, callback)

Finds all data points within the searchRadius from the source point. The source point is specified by its id,
the searchRadius is in kilometers. The data points are **sorted by distance** and passed to the callback function.

    geo.searchAroundId(car2.id, 5, cb);