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
var itemsFeatureGroup = new L.FeatureGroup();
mymap.addLayer(itemsFeatureGroup);

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

function getPolygonLayer(geojsonFeature, color){
	return L.geoJSON(geojsonFeature, {
		onEachFeature: function(feature, layer){
			//console.log(feature)
	        layer.bindPopup("<h2> ZIPCode: " + feature.properties.zipc + "</h2>");
		}
	}).setStyle({
		color: color	
	});
}

function populateZipsOnMap(zipWithProbs){
	// prob -> probability
	maxProbKey = null;
	maxProbValue = 0;
	Object.keys(zipWithProbs).forEach(function(key, index){
		//console.log(zipWithProbs)
		zipCode = key
		var geojsonFeature = getCorrespondingFeature(zipCode);
		currentProbValue = zipWithProbs[key][0]
		if(currentProbValue > maxProbValue){
			maxProbValue = currentProbValue
			maxProbKey = key
		}
		
		// creating zip polygon on two conditions. if probability 
		// is (<=.5 and >0) and >.5
		if(currentProbValue <= 0.5 && currentProbValue > 0){
			var zipCodePolygonLayer = getPolygonLayer(geojsonFeature, 'blue');
			zipCodePolygonLayer.addTo(itemsFeatureGroup)
		}
		if(currentProbValue > 0.5){
			var zipCodePolygonLayer = getPolygonLayer(geojsonFeature, 'red');
			zipCodePolygonLayer.addTo(itemsFeatureGroup)
		}
	});
	//console.log(itemsFeatureGroup.getBounds())
	var geojsonFeature = getCorrespondingFeature(maxProbKey);
	var zipCodePolygonLayer = getPolygonLayer(geojsonFeature, 'red');
	zipCodePolygonLayer.addTo(itemsFeatureGroup)
	mymap.fitBounds(itemsFeatureGroup.getBounds())
}

var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);

	$.ajax({
		type: "POST",
		url: "http://localhost:5000/calculate",
		data: {lat: e.latlng.lat, lng: e.latlng.lng}
	}).done(function(response){
		itemsFeatureGroup.clearLayers()
		response = JSON.parse(response);
		populateZipsOnMap(response)
	});
}

mymap.on('click', onMapClick);


