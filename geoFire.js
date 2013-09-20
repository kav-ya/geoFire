(function () {  
    var BITS = [16, 8, 4, 2, 1];
    
    var BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
    
    var NEIGHBORS = {
        "north": {
            "even" : "p0r21436x8zb9dcf5h7kjnmqesgutwvy",
            "odd"  : "bc01fg45238967deuvhjyznpkmstqrwx",
        },
        "east": {
            "even" : "bc01fg45238967deuvhjyznpkmstqrwx",
            "odd"  : "p0r21436x8zb9dcf5h7kjnmqesgutwvy"
        },
        "south": {
            "even" : "14365h7k9dcfesgujnmqp0r2twvyx8zb",
            "odd"  : "238967debc01fg45kmstqrwxuvhjyznp"
        },
        "west": {
            "even" : "238967debc01fg45kmstqrwxuvhjyznp",
            "odd"  : "14365h7k9dcfesgujnmqp0r2twvyx8zb"
        }
    };
    
    var BORDERS = {
        "north" : { "even" : "prxz",     "odd"  : "bcfguvyz" },
        "east"  : { "even" : "bcfguvyz", "odd"  : "prxz"     },
        "south" : { "even" : "028b",     "odd"  : "0145hjnp" },
        "west"  : { "even" : "0145hjnp", "odd"  : "028b"     }
    };

    var noop = function() {};
    
    /**
     * Generate a geohash of the specified precision/string length
     * from the [latitude, longitude] pair, specified as an array.
     */
    function encode(latLon, precision) {
        var lat = latLon[0],
            lon = latLon[1],
            hash = "",
            hashVal = 0,
            bits = 0,
            even = 1,
            latRange = { "min":  -90, "max":  90 },
            lonRange = { "min": -180, "max": 180 },
            val, range, mid;
                    
        precision = Math.min(precision || 12, 22);
        
        if (lat < latRange["min"] || lat > latRange["max"])
            throw "Invalid latitude specified! (" + lat + ")";
        
        if (lon < lonRange["min"] || lon > lonRange["max"])
            throw "Invalid longitude specified! (" + lon + ")";
        
        while (hash.length < precision) {
            val = (even) ? lon : lat;
            range = (even) ? lonRange : latRange;
            
            mid = (range["min"] + range["max"]) / 2;
            if (val > mid) {
                    hashVal = (hashVal << 1) + 1;
                    range["min"] = mid;
            } else {
                hashVal = (hashVal << 1) + 0;
                    range["max"] = mid;
            }
            
            even = !even;
            if (bits < 4) {
                bits++;
                } else {
                    bits = 0;
                    hash += BASE32[hashVal].toString();
                    hashVal = 0;
            }
        }
        
        return hash;
    }
    
    function halve_interval(interval, decimal, mask) {
        var mid = (interval["min"] + interval["max"]) / 2;
        if (decimal & mask)
            interval["min"] = mid;
        else
            interval["max"] = mid;
    }

    /**                                                                                                              
     * Decode the geohash to get the location of the center of the bounding box it represents;
     * the [latitude, longitude] coordinates of the center are returned as an array.
     */ 
    function decode(hash) {
        var latRange = { "min": -90, "max": 90 },
            lonRange = { "min": -180, "max": 180 },
            even = 1,
            lat, lon, decimal, mask, interval;

        for (var i = 0; i < hash.length; i++) {
            decimal = BASE32.indexOf(hash[i]);
            
            for (var j = 0; j < 5; j++) {
                interval = (even) ? lonRange : latRange;
                mask = BITS[j];
                halve_interval(interval, decimal, mask);
                even = !even;
            }
        }
        
        lat = (latRange["min"] + latRange["max"]) / 2;
        lon = (lonRange["min"] + lonRange["max"]) / 2;
        
        return [lat, lon];
    }

    function deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    function rad2deg(rad) {
        return rad * 180 / Math.PI;
    }
    
    function rad2km(rad) {
        return 6371 * rad;
    }
    
    function deg2km(deg) {
        return rad2km(deg2rad(deg));
    }

    /**
     * Converts miles to kilometers
     */
    function miles2km(miles) {
        return miles * 1.60934;
    }
    
    /**         
     * Converts kilometers to miles
     */
    function km2miles(kilometers) {
        return kilometers * 0.621371;
    }

    /**
     * Calculate the distance between two points on a globe, via Haversine
     * formula, in kilometers. This is approximate due to the nature of the
     * Earth's radius varying between 6356.752 km through 6378.137 km.
     */
    function dist(lat1, lon1, lat2, lon2) {
        var radius = 6371, // km
            dlat = deg2rad(lat2 - lat1),
            dlon = deg2rad(lon2 - lon1),
            a, c;

        a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dlon / 2) * Math.sin(dlon / 2);
        
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radius * c;
    }

    /**
     * Calculate the distance between two points specified by their geohashes.
     * The distance is calculated in kilometers, using the Haversine formula.
     */
    function distByHash(hash1, hash2) {
        var loc1 = decode(hash1);
        var loc2 = decode(hash2);
        return dist(loc1[0], loc1[1], loc2[0], loc2[1]);
    }

    /**
     * Calculate the dimensions of the bounding box for the specified geohash,
     * in kilometers. This method is even more approximate.
     */
    function dimensions(hash) {
        var length = hash.length,
            parity = (length % 2) ? 1 : 0,
            a = 5 * length - parity;
        
        return {
            "height" : deg2km(180 / Math.pow(2, a / 2)),
            "width"  : deg2km(180 / Math.pow(2, (a - 1) / 2))
                };
    }
  
    function neighbor(hash, dir) {
        hash = hash.toLowerCase();
        
        var lastChar = hash.charAt(hash.length - 1),
            type = (hash.length % 2) ? "odd" : "even",
            base = hash.substring(0, hash.length-1);
        
        if (BORDERS[dir][type].indexOf(lastChar) != -1) {        
            if (base.length <= 0)
                return "";
            base = neighbor(base, dir);
        }

        return base + BASE32[NEIGHBORS[dir][type].indexOf(lastChar)];
    }

    function neighbors(hash) {
        var neighbors = [];
        neighbors.push(neighbor(hash, "north"));
        neighbors.push(neighbor(hash, "south"));
        neighbors.push(neighbor(hash, "east"));
        neighbors.push(neighbor(hash, "west"));
        neighbors.push(neighbor(neighbors[0], "east"));
        neighbors.push(neighbor(neighbors[0], "west"));
        neighbors.push(neighbor(neighbors[1], "east"));
        neighbors.push(neighbor(neighbors[1], "west"));
        return neighbors;
    }
  
    function values(obj) {
        var values = [];
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                values.push(obj[key]);
            }
        }
        return values;
    }
    
    function geoFire(firebaseRef) {
        this._firebase = firebaseRef;
        this._agents = this._firebase.child('agents');
    }

    geoFire.prototype.dimensions = geoFire.dimensions = dimensions;
    geoFire.prototype.dist = geoFire.dist = dist;
    geoFire.prototype.distByHash = geoFire.distByHash = distByHash;
    geoFire.prototype.neighbor = geoFire.neighbor = neighbor;
    geoFire.prototype.neighbors = geoFire.neighbors = neighbors;
    geoFire.prototype.miles2km = geoFire.miles2km = miles2km;
    geoFire.prototype.km2miles = geoFire.km2miles = km2miles;
    geoFire.prototype.encode = geoFire.encode = encode;
    geoFire.prototype.decode = geoFire.decode = decode;

    /**
     * Store data by location, specified by a latitude, longitude array.
     */
    geoFire.prototype.insertByLoc = function insertByLoc(latLon, data, cb) {
        data.hash = encode(latLon);
        this._firebase.child(data.hash).push(data, function(error) {
                cb = cb || noop;
                if (!error)
                    cb();
                else
                    console.log("geoFire.insertByLoc error");
            });
    };
    
    /**
     * Store data by location (a latitude, longitude array) and
     * a user-provided id.
     * The data can be queried by location or by id. 
     */
    geoFire.prototype.insertById = function insertById(latLon, id, data, cb) {
        var self = this;
        data.hash = encode(latLon);
        this._firebase.child(data.hash).child(id).set(data, function(error) {
                if (!error) { // TODO: Return error at this point too
                    self._agents.child(id).set(data, function(error) {               
                            cb = cb || noop;
                            if (!error)
                                cb();
                            else
                                console.log("geoFire.insertById error");
                        });
                }
            });
    };

    /**
     * Delete the data point with the specified id.
     */
    geoFire.prototype.removeById = function removeById(id, [onComplete]) {
        var self = this;
        this._agents.child(id).once('value', 
                                    function (snapshot) {
                                        var data = snapshot.val();
                                        self._firebase.child(data.hash).child(id).remove(function(error) {
                                                if (!error)
                                                    self._agents.child(id).remove(onComplete);                                                    
                                            });
                                    });
    };

    /**
     * Update the location of the data point with the specified id.
     */
    geoFire.prototype.updateLocById = function updateLocById(latLon, id) {
        var self = this;
        this._agents.child(id).once('value',
                                    function (snapshot) {
                                        var data = snapshot.val();
                                        if (data === null)
                                            console.log("geoFire.updateLocById error: Invalid Id argument.");
                                        self.insertById(latLon, id, data);
                                        self._firebase.child(data.hash).child(id).remove();
                                    });
    };

    /**
     * Get the location of the data point with the specified id; 
     * the retrieved location is passed to the callback function
     * as a [latitude, longitude] array or null.
     */
    geoFire.prototype.getLocById = function getLocById(id, cb) {
        var self = this;
        this._agents.child(id).once('value',
                                    function (snapshot) {
                                        var data = snapshot.val(),
                                            arg = (data === null) ? null : (self.decode(data.hash));
                                        cb(arg);
                                    });
    };

    /**
     * Find all data points within the specified radius, in kilometers,
     * from the specified latitude, longitude pair, passed in as an array.
     * The matching points are returned in distance sorted order.
     */
    geoFire.prototype.searchAroundLoc = function searchAroundLoc(latLon,
                                                                 radius,
                                                                 cb) {
        var hash = encode(latLon);
        this.searchRadius(hash, radius, cb);
    };  

    /**
     * Find all data points within the specified radius, in kilometers,                                                                                                                                                             
     * from the point with the specified id.
     * The matching points are returned in distance sorted order.
     */
    geoFire.prototype.searchAroundId = function searchAroundId(id, radius, cb) {
        var self = this;
        this._agents.child(id).once('value',
                                  function (snapshot) {
                                      var data = snapshot.val();
                                      self.searchRadius(data.hash, radius, cb);
                                  });
    };

  /**
   * Find all data points within the specified radius, in kilometers,
   * from the point with the specified geohash.
   * The matching points are returned in distance sorted order.
   */
    geoFire.prototype.searchRadius = function searchRadius(srcHash, radius,
                                                               cb) {
        var self = this;
        var hash = srcHash,
            neighborPrefixes = [],
            matches = [],
            matchesFiltered = [],
            i = 0, resultHandler;

      // An approximation of the bounding box dimension per hash length.
        var boundingBoxShortestEdgeByHashLength = [ null, 5003.771699005143,
                                                    625.4714623756429,
                                                    156.36786559391072,
                                                    19.54598319923884,
                                                    4.88649579980971,
                                                    0.6108119749762138 ];
        var zoomLevel = 6;
        while (radius > boundingBoxShortestEdgeByHashLength[zoomLevel])
            zoomLevel -= 1;
        
        hash = hash.substring(0, zoomLevel);

        // TODO: Be smarter about this, and only zoom out if actually optimal.
        queries = this.neighbors(hash);
        queries.push(hash);

        // Get unique list of neighbor hashes.
        var uniquesObj = {};
        for (var ix = 0; ix < queries.length; ix++) {
            if (queries[ix].length > 0)
                uniquesObj[queries[ix]] = queries[ix];
        }
        queries = values(uniquesObj);
        delete uniquesObj;
        
        resultHandler = function(snapshot) {

            // Compile the results for each of the queries as they return.
            var matchSet = snapshot.val();
            
            for (var hash in matchSet) {
                for (var pushId in matchSet[hash]) {
                    matches.push(matchSet[hash][pushId]);
                }
            }

            // Wait for each of the queries to return before filtering and sorting.
            if (++i == queries.length) {
                
                // Filter the returned queries using the specified radius.
                for (var jx = 0; jx < matches.length; jx++) {
                    var match = matches[jx],
                        pointDist = distByHash(srcHash, match['hash']);
                    
                    if (pointDist <= radius) {
                        match.dist = pointDist;
                        matchesFiltered.push(match);
                    }
                }
	      
                // Sort the results by radius.
                matchesFiltered.sort(function(a, b) {
                        return a['dist'] - b['dist'];
                    });
	      	      
                cb(matchesFiltered);
            }
        };

        for (var ix = 0; ix < queries.length; ix++) {
            var startPrefix = queries[ix].substring(0, zoomLevel);
            var endPrefix = startPrefix;
            
            endPrefix = startPrefix + "~";
	  
            this._firebase
                .startAt(null, startPrefix)
                .endAt(null, endPrefix)
                .once('value', resultHandler);
        }
    };
    
    if (typeof module === "undefined") {
        self.geoFire = geoFire;
    } else {
        module.exports = geoFire;
    }
})();
