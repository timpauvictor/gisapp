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
		navigator.geolocation.getCurrentPosition(function(position) {
			if (__customMarkers[0] != undefined) {
				__map.removeLayer(__customMarkers[0]);
			}
			var marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(__map);
			marker.bindPopup(); //TODO: fill this in
			__customMarkers[0] = marker;
			__map.setView([position.coords.latitude, position.coords.longitude], 18);	
		});
	} else {
		//show a search bar
	}
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

function mapSetup() {
	loadMap(); //loads map and adds it to div

	//load out shapefiles
	addPolygonShapeFile("../data/wasteday.zip"); //layer 0
	addPolygonShapeFile("../data/LeafYardServices.zip"); //layer 1
	addMarkerShapeFile("../data/municipal.zip", municipalMarkers); //layer 2
	addMarkerShapeFile("../data/private.zip", privateMarkers); //layer 3
	addMarkerShapeFile("../data/composting_facilities.zip", compostMarkers); //layer 4
	addMarkerShapeFile("../data/landfills.zip", landfillMarkers); //layer 5

	//load our buttons
	addFindMeButton();
	addPrivateRecyclingButton();
	addMunicipalRecyclingButton();
	addCompostButton();
	addLandFillButton();

	

}

mapSetup();
