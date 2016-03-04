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
var dirLayer = undefined;
var accessToken = "nothing";
var directionPoints = [];
var compostIcon = L.icon({
    iconUrl: './img/compostingMarker.png',
    iconSize: [32, 32]
});
var landfillIcon = L.icon({
    iconUrl: './img/garbageMarkers.png',
    iconSize: [32, 32]
});
var municipalIcon = L.icon({
    iconUrl: './img/municipalMarkers.png',
    iconSize: [32, 32]
});
var privateIcon = L.icon({
    iconUrl: './img/privateMarkers.png',
    iconSize: [32, 32]
});

var legend = false;

var garLegend = L.control({ position: 'bottomright' });

garLegend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'legend'),
        labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < labels.length; i++) {
        // console.log(labels[i]);
        div.innerHTML +=
            '<i style="background:' + getGarbageColor(labels[i]) + '"></i> ' +
            labels[i] + '<br>';
    }

    return div;
};

function getGarbageColor(garDay) {
    if (garDay === "Monday") {

        return '#d50000'

    } else if (garDay === "Tuesday") {

        return '#4A148C'

    } else if (garDay === "Wednesday") {

        return '#FFFF00'

    } else if (garDay === "Thursday") {

        return '#01579B'

    } else if (garDay === "Friday") {

        return '#004D40'

    }
}

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
            // console.log(feature.properties);
            var garDay = feature.properties.DAY;
            if (garDay === "Monday") {
                layer.setStyle({
                    fillColor: '#d50000',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                });
            } else if (garDay === "Tuesday") {
                layer.setStyle({
                    fillColor: '#4A148C',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                });
            } else if (garDay === "Wednesday") {
                layer.setStyle({
                    fillColor: '#FFFF00',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                });
            } else if (garDay === "Thursday") {
                layer.setStyle({
                    fillColor: '#01579B',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                });
            } else if (garDay === "Friday") {
                layer.setStyle({
                    fillColor: '#004D40',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
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
                if (arr === compostMarkers) {
                    layer.setIcon(compostIcon);
                } else if (arr === landfillMarkers) {
                    layer.setIcon(landfillIcon);
                } else if (arr === municipalMarkers) {
                    layer.setIcon(municipalIcon);
                } else if (arr === privateMarkers) {
                    layer.setIcon(privateIcon);
                }
                arr.push(feature);
                layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                    return "<span class=\"markerTitle\"><b>" + k + "</b></span>" + "<span class=\"markerText\">" + feature.properties[k] + "</span>";
                }).join("<br />"), {
                    maxHeight: 300
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
    if (index === 0) {
        if (legend) {
            __map.removeControl(garLegend);
            legend = false;
        } else if (!legend) {
            garLegend.addTo(__map);
            legend = true;
        }
    }

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
    var nearestName = "";
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

function requestToken() {
    var jQueryPromise = $.post("https://www.arcgis.com/sharing/rest/oauth2/token/", {
        "client_id": "sgUcR9ZoyDrlRvQe",
        "client_secret": "70233a89178d4b0aa8b678b6e1fc05a8",
        "grant_type": "client_credentials"
    })
    var realPromise = Promise.resolve(jQueryPromise);
    realPromise.then(function(val) {
        valObj = JSON.parse(val);
        accessToken = valObj.access_token;
    });
}

function addressGeocode(startCoords, endAddress) {
    L.esri.Geocoding.geocode().text(endAddress).run(function(err, results, response) {
        showDirections(startCoords, [results.results[0].latlng.lat, results.results[0].latlng.lng]);
    })
}

function showDirections(startCoords, endCoords) {
    console.log("routing from: " + startCoords + "to: " + endCoords);
    var stops = startCoords[1] + ", " + startCoords[0] + "; " + endCoords[1] + ", " + endCoords[0];
    var getPromise = $.get("http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve", {
        "token": accessToken,
        "stops": stops,
        "f": "json"
    })
    var realPromise = Promise.resolve(getPromise);
    realPromise.then(function(val) {
        valObj = JSON.parse(val);
        directionPoints = valObj.routes.features[0].geometry.paths[0];
        drawDirections(directionPoints);
    });
}

function drawDirections(points) {
    // console.log(points);
    // var myPolyline = L.polyline(points, {
    //     color: 'red'
    // });
    // myPolyline.addTo(__map);


    var pointA = new L.LatLng(28.635308, 77.22496);
    var pointB = new L.LatLng(28.984461, 77.70641);
    var pointList = [pointA, pointB];

    var firstpolyline = new L.Polyline(pointList, {
        color: 'red',
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
    });
    firstpolyline.addTo(map);
}

function fetchDirections(startCoords, endAddress) { //helper function since this is asynchronous and that still blows my mind
    addressGeocode(endAddress);
}

function onMapClick(e) {
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


function mapSetup() {
    requestToken();
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
// toggleLayer(0);
toggleLayer(2);
// toggleLayer(3);
// toggleLayer(4);
// toggleLayer(5);
// drawDirections();
// console.dir(privateMarkers);
