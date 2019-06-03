this.loadOpenstreetMap = function (divMapId, centerCoordinate, zoomLevel) {
        var tileLayerUrl = 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png';
        var tileLayerAttribution = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';

        var map = buildMap(divMapId, centerCoordinate, zoomLevel);
        L.tileLayer(tileLayerUrl, {
            attribution: tileLayerAttribution
        }).addTo(map);

        return map;
    };

function buildMap(divMapId, centerCoordinate, zoomLevel) {
        var map = new L.Map(divMapId, {
            center: centerCoordinate,
            zoom: zoomLevel,
            scrollWheelZoom: true
        });
        return map;
    };
var mymap = loadOpenstreetMap('mapid', [28.540196, -81.387911], 13);
var drawnItems = new L.FeatureGroup();
mymap.addLayer(drawnItems);

function getCorrespondingFeature(zipCode) {
	var geojsonFeature = {}
	for(i=0; i<orlando[0].features.length; i++){
		if(orlando[0].features[i].properties.zipc == zipCode){
			geojsonFeature = orlando[0].features[i];
			break;
		}
	}	
	return geojsonFeature;
}

function getPolygonLayer(geojsonFeature){
	return L.geoJSON(geojsonFeature, {
		onEachFeature: function(feature, layer){
			console.log(feature)
	        layer.bindPopup("<h2> ZIPCode: " + feature.properties.zipc + "</h2>");
		}
	});
}


var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);

	console.log(e.latlng)
	$.ajax({
		type: "POST",
		url: "http://localhost:5000/calculate",
		data: {lat: e.latlng.lat, lng: e.latlng.lng}
	}).done(function(response){
		console.log(response);
		console.log(orlando);
		var zipCode = response;
		var geojsonFeature = getCorrespondingFeature(zipCode);
		var zipCodePolygonLayer = getPolygonLayer(geojsonFeature);
		drawnItems.addLayer(zipCodePolygonLayer);
		mymap.fitBounds(zipCodePolygonLayer.getBounds());
		//drawnItems.removeLayer(zipCodePolygonLayer);		
	});
}

mymap.on('click', onMapClick);
mymap.on('draw:created', function (e) {
    var type = e.layerType,
      layer = e.layer;
    drawnItems.clearLayers();
});

var dummyProbabilities = {
	"mainPrediction": 32801,
	"otherPredictions": [
		{"32802": ".7"},
		{"32804": ".3"},
		{"32805": ".4"},
		{"32808": ".5"}
	]
}

