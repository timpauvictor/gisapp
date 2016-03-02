var __startingCoords = [43.240, -79.848];
var __zoomLevel = 12;
var __map;
var __shapeLayers = [];
var __activatedLayers = [];
var __customMarkers = []; //0 is always our current location as long as we have it

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
				console.log(feature);
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

function addMarkerShapeFile(path) { //generic function to add shapeFiles to the map, then stores the added shpfile object in an array
	console.log("attempting to load shapefile from " + path);
	var shpfile = new L.Shapefile(path, {
		onEachFeature: function(feature, layer) {
			if (feature.properties) {
				console.log(feature);
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


function toggleLayer(index) {
	if (__customMarkers[0] != undefined) {
		__map.removeLayer(__customMarkers[0]);
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
		navigator.geolocation.getCurrentPosition(showPosition);
	} else {
		//show a search bar
	}
}

function showPosition(position) {
	if (__customMarkers["geolocation"] != undefined) {
		__map.removeLayer(__customMarkers[0]);
	}
	var marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(__map);
	__customMarkers[0] = marker;
	__map.setView([position.coords.latitude, position.coords.longitude], 18);	
}

function addFindMeButton() {
	L.easyButton( 'icon ion-android-locate larger',function() {
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

function mapSetup() {
	loadMap(); //loads map and adds it to div
	addPolygonShapeFile("../data/wasteday.zip");
	addPolygonShapeFile("../data/LeafYardServices.zip");
	addMarkerShapeFile("../data/municipal.zip");
	addMarkerShapeFile("../data/private.zip");
	addFindMeButton();
	addPrivateRecyclingButton();
	addMunicipalRecyclingButton();

}

mapSetup();
