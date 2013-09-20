geoFire
=======
**geoFire** is a helper library for location-based operations in [Firebase](https://www.firebase.com/).  
It provides functions to store data for location querying in Firebase, 
and perform location queries such as location updates and localized searches.
geoFire stores the location coordinates of a data point as a [geohash] (http://en.wikipedia.org/wiki/Geohash) in Firebase.

Using the geoFire library
------------------------
To use the geoFire library, include the **geoFire.js** file and create a geoFire object with the Firebase reference your data
will be stored at:

    var geoRef = new Firebase('https://abc.firebaseio-demo.com'),
        geo = new geoFire(geoRef);

You can see your Firebase data at any time by navigating to the geoRef url.

The geoFire library provides functions to:  
  1. [Store/ remove data in Firebase for location queries](#-storing-removing-data-for-location-queries):  
    - [insertByLoc](#insert1)  
    - [insertById](#insert2)  
    - [removeById](#remove)

  2. [Perform location queries](#query):  
    - [getLocById](#get)  
    - [updateLocById](#update)

  3. [Perform localized searches] (#search):  
    - [searchAroundLoc](#search1)  
    - [searchAroundId](#search2)

The library also has helper functions to:  
  4. [Convert between latitude, longitude pairs and geohashes](#loc):  
    - [encode](#encode)  
    - [decode](#decode)

  5. [Convert between miles and kilometers](#dist):  
    - [miles2km](#miles)  
    - [km2miles](#km)

<a id="save"></a> Storing/ removing data for location queries:
------------------------------------------------------------
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

Removes the data point with the specified Id; the data point must have been inserted using `insertById`.
`removeById` does not return anything; it calls the optional callback function, if provided, with 
null on success/Error on failure.

    // No callback function.
    geo.removeById(car2.id);

    // With a callback function.
    geo.removeById(car2.id, function(error) { if(!error) console.log("Remove done!"); });

Performing location queries:
----------------------------
###getLocById(id, callback)

Gets the location of the data point with the specified Id; the data point must have been inserted using `insertById`.
`getLocById` does not return anything; it calls the callback function with the location as a [latitude, longitude] array on success/null on failure.

    geo.getLocById(car2.id, function(latLon) { console.log("Lat, Lon = ", latLon[0], latLon[1]); });

###updateLocById(newLatLon, id)

Updates the location of the data point with the specified Id; the data point must have been inserted using `insertById`.
`updateLocById` does not return anything on success; on failure, an error message is printed to console.
    
    geo.updateLocById([36.01234, -121.51369], car2.id);

Performing localized searches:
-----------------------------
###searchAroundLoc(latLon, distance, callback)

Finds all data points that are within the specified distance from the source point. The source point is passed as a [latitude, longitude] array and
the distance is in kilometers. `searchAroundLoc` does not return anything; it passes an array of the matching data points, **sorted by distance**, to the callback function.
Each data point in the array is represented as a [latitude, longitude] array.

    geo.searchAroundLoc([37.771393, -122.447104], 5, function(array) { 
                                                                        for (var i = 0; i < array.length; i++)
                                                                            console.log("latLon of a found point = ", array[i]);
                                                                     });

###searchAroundId(id, distance, callback)

Finds all data points that are within the specified distance from the source point. The source point is specified by its Id, hence it must have been inserted using
`insertById`. The distance is in kilometers. `searchAroundId` does not return anything; it passes an array of the matching data points, **sorted by distance**, to the callback function.
Each data point in the array is represented as a [latitude, longitude] array.

   geo.searchAroundId(car2.id, 5, function(array) {
                                                    for (var i = 0; i < array.length; i++)
                                                        console.log("latLon of a found point = ", array[i]);
                                                   });

**NOTE: You can convert between miles and kilometers with the miles2km and km2miles functions**

Location/Geohash conversion:
---------------------------



###encode(latLon, precision)

Generates a geohash of the specified precision for the [latitude, longitude] pair, specified as an array.

    var loc = [37.757008, -122.421237];
    var geohash = geo.encode(loc, 12); // geohash = "9q8yy1rwd2mt" 

###decode(geohash)

Returns the location of the center of the bounding box the geohash represents;
the location is returned as a [latitude, longitude] array.

    var location = geo.decode("q8yy1rwd2mt");
    var latitude = location[0]; // latitude = 37.757008
    var longitude = location[1]; // longitude = -122.421237

Mile/Kilometer conversion:
--------------------------
###miles2km(miles)
###km2miles(kilometers)