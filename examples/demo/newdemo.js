var cars = {},
    map;

var geoRef = new Firebase("https://munigeo.firebaseio.com/sf-muni/geo/geoFire");
var hashRef = geoRef.child("/dataByHash");
var idRef = geoRef.child("/dataById");

function initialize() {
    loc = new google.maps.LatLng(37.7789, -122.3917);
    var mapOptions = {
        center: loc,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map-canvas"),
                              mapOptions);
}

idRef.once("value", function(snapshot) {
        snapshot.forEach(function(car) {
                createCar(car.val(), car.name());
            });
    });

idRef.on("child_changed", function(snapshot) {
        var marker = cars[snapshot.name()];
        if (typeof marker === 'undefined') {
            createCar(snapshot.val(), snapshot.name());
        }
        else {
            console.log("Going to call animatedMoveTo");
            var loc = geoRef.decode(snapshot.val().geohash);
            marker.animatedMoveTo(loc[0], loc[1]);//snapshot.val().lat, snapshot.val().lon);
        }
    });

idRef.on("child_removed", function(snapshot) {
        console.log("CHILD REMOVED");
        var marker = cars[snapshot.name()];
        if (typeof marker !== 'undefined') {
            marker.setMap(null);
            delete cars[snapshot.name()];
        }
    });

function createCar(car, firebaseId) {
    var latLon = new google.maps.LatLng(car.lat, car.lon);
    var dirColor = car.dirTag && car.dirTag.indexOf('OB') > -1 ? "7094FF" : "FF6262";
    var iconType = car.vtype == 'bus' ? 'bus' : 'locomotive'; // 'train' looks nearly identical to bus at rendered size
    var marker = new google.maps.Marker({ icon: 'http://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=' + iconType + '|bbT|'+ car.routeTag+'|' + dirColor + '|eee',
                                          position: latLon,
                                          map: map });
    cars[firebaseId] = marker;
}

/* Helper functions */
function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function feq (f1, f2) {
    return (Math.abs(f1 - f2) < 0.000001);
}


// Vikrum's hack to animate/move the Marker class                                                                                                                                                
// based on http://stackoverflow.com/a/10906464 
google.maps.Marker.prototype.animatedMoveTo = function(toLat, toLng) {

    console.log("In animatedMoveto!");

    var fromLat = this.getPosition().lat();
    var fromLng = this.getPosition().lng();

    if(feq(fromLat, toLat) && feq(fromLng, toLng)) {
        console.log("Return boohoo");
        return;
    }
    // store a LatLng for each step of the animation
    var frames = [];
    for (var percent = 0; percent < 1; percent += 0.005) {
        curLat = fromLat + percent * (toLat - fromLat);
        curLng = fromLng + percent * (toLng - fromLng);
        frames.push(new google.maps.LatLng(curLat, curLng));
    }

    move = function(marker, latlngs, index, wait) {
        marker.setPosition(latlngs[index]);
        if(index != latlngs.length-1) {
            // call the next "frame" of the animation
            setTimeout(function() {
                    move(marker, latlngs, index+1, wait);
                }, wait);
        }
    }
    
    // begin animation, send back to origin after completion
    move(this, frames, 0, 25);
}
    
function Car(id, make, color, lat, lon) {
    this.id = id;
    this.make = make;
    this.color = color;
}