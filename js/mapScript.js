var __startingCoords = [43.240, -79.848];
var __zoomLevel = 12;
var __map;
var __shapeLayers = [];
var __activatedLayers = [];

function loadMap() {
	__map = L.map("map").setView(__startingCoords, __zoomLevel);
	console.log('map created');
	L.esri.basemapLayer("Topographic").addTo(__map);
	console.log('topographic layer added');
}

function addShapeFile(path) { //generic function to add shapeFiles to the map, then stores the added shpfile object in an array
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
	__activatedLayers.push(false);
}

function toggleLayer(index) {
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


function mainRunner() {
	loadMap(); //loads map and adds it to div
	addShapeFile("../data/wasteday.zip");
	addShapeFile("../data/LeafYardServices.zip");
	addShapeFile("../data/Recycling.zip");
	// setTimeout({ __map.invalidateSize() }, 500);
}

mainRunner();
