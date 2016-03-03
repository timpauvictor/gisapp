var __startingCoords = [43.240, -79.848];
var __zoomLevel = 12;
var __map;
var __shapeLayers = [];
var __activatedLayers = [];
var compostMarkers = [];
var landfillMarkers = [];
var municipalMarkers = [];
var privateMarkers = [];
var geolocation = undefined;

function loadMap() {
    __map = L.map("map").setView(__startingCoords, __zoomLevel);
    console.log('map created');
    L.esri.basemapLayer("Topographic").addTo(__map);
    console.log('topographic layer added');
}

function addPolygonShapeFile(path) { //generic function to add shapeFiles to the map, then stores the added shpfile object in an array
    console.log("attempting to load shapefile from " + path);
    var shpfile = new L.Shapefile(path, {
        onEachFeature: function(feature, layer) {
            if (feature.properties) {
                layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                    return k + ": " + feature.properties[k];
                }).join("<br />"), {
                    maxHeight: 200
                });
            }
        }
    });
    shpfile.once("data:loaded", function() {
        console.log("finished loading from " + path);
        __map.invalidateSize(); //leaflet has a bug where you either invalidate the size or
        // the tiles don't load properly
    });
    __shapeLayers.push(shpfile);
    // console.log(shpfile.attribute('alt'));
    __activatedLayers.push(false);
}

function addMarkerShapeFile(path, arr) { //generic function to add shapeFiles to the map, then stores the added shpfile object in an array
    console.log("attempting to load shapefile from " + path);
    var shpfile = new L.Shapefile(path, {
        onEachFeature: function(feature, layer) {
            if (feature.properties) {
                // if (feature.properties.Hours) {
                // 	feature.properties.Hours.replace(/â/g, "-");
                // 	console.log(feature.properties.Hours.search(/â/));
                // }
                arr.push(feature);
                // console.dir(arr);
                layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                    return k + ": " + feature.properties[k];
                }).join("<br />"), {
                    maxHeight: 200
                });
            }
        }
    });
    shpfile.once("data:loaded", function() {
        console.log("finished loading from " + path);
        __map.invalidateSize(); //leaflet has a bug where you either invalidate the size or
        // the tiles don't load properly
    });
    __shapeLayers.push(shpfile);
    __activatedLayers.push(false);
}


function toggleLayer(index) {
    if (geolocation != undefined) {
        __map.removeLayer(geolocation);
    } else {
        //do nothing
    }
    if (__activatedLayers[index] === false) {
        __shapeLayers[index].addTo(__map);
        __activatedLayers[index] = true;
    } else {
        __map.removeLayer(__shapeLayers[index]);
        __activatedLayers[index] = false;
    }
}

function clearAllLayers() {
    for (var i = 0; i < __shapeLayers.length; i++) {
        __map.removeLayer(__shapeLayers[i]);
        __activatedLayers[i] = false;
    }
}

function findMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            if (geolocation != undefined) {
                __map.removeLayer(geolocation);
            }
            var marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(__map);
            marker.bindPopup("<b><center>This is you!</center></b><br> The <b>nearest private</b> recycling location is " + findNearestMarker(position, privateMarkers) + "The <b>nearest municipal</b> recycling location is " + findNearestMarker(position, municipalMarkers) + "The <b>nearest landfill</b> location is " + findNearestMarker(position, landfillMarkers) + "The <b>nearest compost</b> location is " + findNearestMarker(position, compostMarkers));
            // marker.openPopup();
            geolocation = marker;
            __map.setView([position.coords.latitude, position.coords.longitude], 18);
            marker.openPopup();
        });
    } else {
        //show a search bar
    }
}

function addFindMeButton() {
    L.easyButton('icon ion-android-locate larger', function() {
            findMe();
        },
        "Find my location").addTo(__map);
}

function addMunicipalRecyclingButton() {
    L.easyButton('icon ion-refresh larger', function() {
            toggleLayer(2);
        },
        "Display municipal recycling locations").addTo(__map);
}

function addPrivateRecyclingButton() {
    L.easyButton('icon ion-loop larger', function() {
            toggleLayer(3);
        },
        "Display private recycling locations").addTo(__map);
}

function addCompostButton() {
    L.easyButton("icon ion-leaf larger", function() {
            toggleLayer(4);
        },
        "Display composting facility locations").addTo(__map);
}

function addLandFillButton() {
    L.easyButton("icon ion-android-delete larger", function() {
            toggleLayer(5);
        },
        "Display landfill locations").addTo(__map);
}

function toRad(value) {
    return value * Math.PI / 180;
}

function getDistance(pos1, pos2) { //using the haversine formula!
    //it might not be the closest to drive to, but whatever
    var R = 6371000; // metres, earth's distance
    var p1 = toRad(pos1[0]);
    var p2 = toRad(pos2[0]);
    var deltaP = toRad(pos2[0] - pos1[0]);
    var deltaL = toRad(pos2[1] - pos1[1]);

    var a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
        Math.cos(p1) * Math.cos(p2) *
        Math.sin(deltaL / 2) * Math.sin(deltaL / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c;
    return d;
}

function findNearestMarker(position, featureArr) {
    var lowestIndex = 0;
    var lowestDistance = Infinity; //good luck being greater than that!
    for (var i = 0; i < featureArr.length; i++) {
        featureCoords = [featureArr[i].geometry.coordinates[1], featureArr[i].geometry.coordinates[0]]; //for some reason it stores them backwards, beats me im just a code monkey
        var distance = getDistance([position.coords.latitude, position.coords.longitude], featureCoords);
        if (distance < lowestDistance) {
            lowestDistance = distance;
            lowestIndex = i;
        }
    }
    // console.log(position);
    // console.log(featureArr[lowestIndex]);
    // console.log(lowestDistance);
    var nearestName = "";
    // console.log(featureArr[lowestIndex].);
    if (featureArr[lowestIndex].properties.Name) {
        nearestName = featureArr[lowestIndex].properties.Name;
    } else {
        nearestName = "Nameless";
    }

    var nearestAddress = featureArr[lowestIndex].properties.Address;
    var htmlAddressBeginning = "<a onclick=\"addressGeocode([" + position.coords.latitude + ", " + position.coords.longitude + "],&#34;" + nearestAddress + "&#34;)\"" + " href=\"javascript:void(0)\">";
    // console.log(htmlAddressBeginning);
    var htmlAddressEnding = "</a>";
    // console.log(nearestName + " at " + htmlAddressBeginning + nearestAddress + htmlAddressEnding + "<br>");
    return nearestName + " at " + htmlAddressBeginning + nearestAddress + htmlAddressEnding + "<br>";
}

function addressGeocode(startCoords, endAddress) {
    L.esri.Geocoding.geocode().text(endAddress).run(function(err, results, response) {
    	showDirections(startCoords, [results.results[0].latlng.lat, results.results[0].latlng.lng]);
    })
}

function showDirections(startCoords, endCoords) {
    console.log("routing from: " + startCoords + "to: " + endCoords);
    L.Routing.control({
        waypoints: [
            L.latLng(startCoords),
            L.latLng(endCoords)
        ]
    }).addTo(__map);
}

function fetchDirections(startCoords, endAddress) { //helper function
   endCoords = addressGeocode(endAddress);  
}

function onMapClick(e) {
    if (__activatedLayers[0] || __activatedLayers[1]) {
        var snackbarContainer = document.querySelector('#error-toast');
        var innerMessage = "";
        if (__activatedLayers[0]) {
            innerMessage = "Oops! Turn off Garbage Pickup Days overlay via the side menu before making a custom marker!";
        } else if (__activatedLayers[1]) {
            innerMessage = "Oops! Turn off Leaf and Yard Services overlay via the side menu before making a custom marker!";
        } else {
            innerMessage = "Some error occured";
        }
        var data = {
            message: innerMessage
        }
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    } else {
        var popup = L.popup();
        popup.setLatLng(e.latlng);
        var position = { //this is hideous oh my god but i didn't want to rewrite code so whatever it works
                coords: {
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                }
            }
            // console.log(position);
        popup.setContent("<b><center>This is your custom waypoint!</center></b><br> The <b>nearest private</b> recycling location is " + findNearestMarker(position, privateMarkers) + "The <b>nearest municipal</b> recycling location is " + findNearestMarker(position, municipalMarkers) + "The <b>nearest landfill</b> location is " + findNearestMarker(position, landfillMarkers) + "The <b>nearest compost</b> location is " + findNearestMarker(position, compostMarkers));
        popup.openOn(__map);
    }
}



function mapSetup() {
    loadMap(); //loads map and adds it to div

    //load out shapefiles, having to keep track of the layers here is probably the dumbest thing I've done
    addPolygonShapeFile("../data/wasteday.zip"); //layer 0
    addPolygonShapeFile("../data/LeafYardServices.zip"); //layer 1
    addMarkerShapeFile("../data/municipalnew.zip", municipalMarkers); //layer 2
    addMarkerShapeFile("../data/privatenew.zip", privateMarkers); //layer 3
    addMarkerShapeFile("../data/composting_facilities.zip", compostMarkers); //layer 4
    addMarkerShapeFile("../data/landfills.zip", landfillMarkers); //layer 5

    __map.invalidateSize(); //just in case that bug rears it's ugly head
    //load our buttons
    addFindMeButton();
    addPrivateRecyclingButton();
    addMunicipalRecyclingButton();
    addCompostButton();
    addLandFillButton();
}

mapSetup();
__map.on('click', onMapClick);
toggleLayer(0);
toggleLayer(2);
toggleLayer(3);
