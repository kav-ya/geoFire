function Car(id, make, color, lat, lon) {
    this.id = id;
    this.make = make;
    this.color = color;
}
	
Car.prototype.getId = function() {
    return this.id;
};

Car.prototype.getMake = function() {
    return this.make;
};

Car.prototype.getColor = function() {
    return this.color;
};

function geoStart() {
    // Console text
    document.getElementById('title').innerText = "";
    document.getElementById('console').innerText = "First, insert the locations " +
        "of the cars and the user into Firebase.";
    
    // Insert btn
    drawInsertBtn();
    
    // Behind text
    document.getElementById('behindtitle').innerText = "Behind the scenes:";
    
    var elt = document.createElement('a');
    elt.setAttribute('href',geoLink);
    elt.innerHTML = geoLink;
    elt.target = '_blank';
    elt.id = "forgelink";
    document.getElementById('behind').innerText = "insertByLoc() and insertById() are called.\n\n" +
        "See the Firebase data at:\n";
    document.getElementById('behind').appendChild(elt);
}

function drawInsertBtn() {
    var btn = document.createElement("input");
    btn.type = "button";
    btn.class = "lebtn";
    btn.id = "insertBtn";
    btn.name = "insertBtn";
    btn.value = "Insert locations!";
    btn.onclick = geoInsert;

    var con = document.getElementById('centerdiv');
    con.appendChild(btn);
}

function geoInsert() {
    geo.insertById(car1Pos["lat"], car1Pos["lon"], car1.getId(), car1);
    geo.insertById(car2Pos["lat"], car2Pos["lon"], car2.getId(), car2);
    geo.insertById(car3Pos["lat"], car3Pos["lon"], car3.getId(), car3);
    geo.insertByLoc(origin["lat"], origin["lon"], requester, drawSearchBtn);
}

function drawSearchBtn() {
    // Remove insert btn
    var elt = document.getElementById('insertBtn');
    elt.parentNode.removeChild(elt);

    // Console text
    document.getElementById('console').innerText = "You can now search for " +
        "cars within some distance from the user.";

    // Search btn
    var radius = document.createElement("input");
    radius.type = "text";
    radius.id = "radius";
    radius.name = "radius";
    radius.defaultValue = "7";

    var btn = document.createElement("input");
    btn.type = "button";
    btn.class = "lebtn";
    btn.id = "searchBtn";
    btn.name = "searchBtn";
    btn.value = "Find cars!";
    btn.onclick = geoFind;

    var con = document.getElementById('centerdiv');
    con.appendChild(radius);
    con.appendChild(btn);

    // Behind text
    behindText = "searchAroundLoc() is called with the location coordinates of the user" +
        " and the distance you provide.";
    document.getElementById('behind').innerText = behindText;
}

function geoFind() {
    var arg = document.getElementById('radius').value;
    var radius = (arg) ? parseInt(arg) : 0;
    geo.searchAroundLoc(origin["lat"], origin["lon"], radius, printCars);
}

function printCars(results) {
    // Remove search btns, old text
    var element = document.getElementById('radius');
    element.parentNode.removeChild(element);

    element = document.getElementById('searchBtn');
    element.parentNode.removeChild(element);

    var cars = [];
    for (var ix = 0; ix < results.length; ix++) {
        if (results[ix]['id']) {
            cars.push(results[ix]['id']);
        };
    }
    if (cars.length === 0) {
        // Console, behind text
        consoleText = "Sorry, there are no cars within the requested distance!";
        document.getElementById('console').innerText = consoleText;
        document.getElementById('behindtitle').innerText = "";
        document.getElementById('behind').innerText = "";
    } else {       
        // Create map overlays
        createResultMarkers(cars);

        // Console
        consoleText = (cars.length === 1) ? ("Car" + carId +  "is within the requested distance.\n\nNow dispatch it."):
            ("Cars " + cars.join(", ") + (" are within the requested distance.\n\nNow dispatch the closest car."));
        document.getElementById('console').innerText = consoleText;
       
        // Dispatch btn
        var carId = cars[0];
        createDispatchBtn(carId);

        // Behind text
        document.getElementById('behindtitle').innerText = "Behind the scenes:";
        document.getElementById('behind').innerText = "updateLocById() is called with the Id of the closest car.\n\n" +
            "Then, getLocById() is called to retrieve its new location and reposition it on the map.";
    }
}

function createDispatchBtn(carId) {
    var btn = document.createElement("input");
    btn.type = "button";
    btn.class = "lebtn";
    btn.id = "dispatchBtn";
    btn.name = "dispatchBtn";
    btn.value = "Dispatch closest!";
    btn.onclick = function() { dispatch(carId); };

    var con = document.getElementById('centerdiv');
    con.appendChild(btn);
}

// This function uses the fact that: if a car has been dispatched,
// it is *guaranteed* to be car1
function dispatch(carId) {
    resultMarkerMap["1"].setIcon("select.png");
    if (resultMarkerMap["2"] != undefined)
        resultMarkerMap["2"].setVisible(false);
    if (resultMarkerMap["3"] != undefined)
        resultMarkerMap["3"].setPosition(null);

    // Text
    var consoleText = "Car " + carId + " is on its way...";
    document.getElementById('console').innerText = consoleText;
    document.getElementById('centerdiv').innerText = "";
    document.getElementById('behindtitle').innerText = "";
    document.getElementById('behind').innerText = "";

    var midPos = { "lat": 37.762776, "lon": -122.435553 };
    geo.updateLocById(midPos["lat"], midPos["lon"], carId);

    // Mid-point                                                                                                                                                                                           
    window.setTimeout(function() {
            geo.getLocById(carId, function(currentPos) {
                    var midLoc = new google.maps.LatLng(currentPos["lat"], currentPos["lon"]);
                    car1Marker.setPosition(midLoc);
                    resultMarkerMap[carId].setPosition(midLoc);
                });

            // Here
            var hereLoc = { "lat": 37.758552, "lon": -122.423521 };
            geo.updateLocById(hereLoc["lat"], hereLoc["lon"], carId);

            window.setTimeout(function() {
                    geo.getLocById(carId, function(currentPos) {
                            consoleText = "Car " + carId + " is here!";
                            document.getElementById('console').innerText = consoleText;
                            var hereLoc = new google.maps.LatLng(currentPos["lat"], currentPos["lon"]);
                            car1Marker.setPosition(hereLoc);
                            resultMarkerMap[carId].setPosition(hereLoc);
                            window.setTimeout(endDemo, 2000);
                        });
                }, 2000);
        }, 1000);
}

function endDemo(){
    // Text                                                                                                                                                                                                
    var consoleText = "Thanks for playing!";
    document.getElementById('console').innerText = consoleText;
    document.getElementById('console').style.color = "#EC8916";
    document.getElementById('console').style.textAlign = "center";
}

function createResultMarkers(cars) {
    var time = 100;
    var resImage = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#4D88BF',
        fillOpacity: 0.35,
        strokeColor: '#4D88BF',
        strokeOpacity: 0.75,
        strokeWeight: 1,
        scale: 20
    };

    for (var i = 0; i < cars.length; i++) {
        var loc = new google.maps.LatLng(posMap[cars[i]]["lat"],
                                         posMap[cars[i]]["lon"]);

        var resMarker = new google.maps.Marker({
                position: loc,
                map: map,
                icon: resImage,
                draggable: false,
                animation: google.maps.Animation.DROP
            });
        
        resultMarkerMap[cars[i]] = resMarker;
    }
}

function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var posMap = {}; // Only used to create the map markers
var resultMarkerMap = {};

var car1 = new Car(1, "BMW", "Black");
var car1Pos = { "lat": 37.771393, "lon":-122.447104 };
posMap["1"] = car1Pos;

var car2 = new Car(2, "Mercedes", "White");
var car2Pos = { "lat": 37.780314, "lon": -122.513698 };
posMap["2"] = car2Pos;

var car3 = new Car(3, "Tesla", "Red");
var car3Pos = { "lat": 37.778805, "lon": -122.391645 };
posMap["3"] = car3Pos;

var requester = { "name": "Nuri" };
var origin = {"lat": 37.757008, "lon": -122.421237 };