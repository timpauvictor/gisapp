var __startingCoords = [43.240, -79.848];
var __zoomLevel = 12;
var __map;
var __shapeLayers = [];

function loadMap() {
	__map = L.map("map").setView(__startingCoords, __zoomLevel);
	console.log('map created');
	L.esri.basemapLayer("Topographic").addTo(__map);
	console.log('topographic layer added');
}

function addShapeFile(path) { //generic function to add shapeFiles to the map, then stores the added shpfile object in an array
	console.log("attempting to load shapefile " + path);
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
	shpfile.addTo(__map);
	shpfile.once("data:loaded", function() {
		console.log("finished loaded shapefile");
	});
	__shapeLayers.push(shpfile);
}

function mainRunner() {
	loadMap(); //loads map and adds it to div
	addShapeFile("../data/LeafYardServices.zip");
	addShapeFile("../data/Recycling.zip");
	
}

mainRunner();
