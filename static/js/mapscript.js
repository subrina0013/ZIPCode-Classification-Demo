
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
var mymap = loadOpenstreetMap('mapid', [51.505, -0.09], 13);

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
		console.log(response)
	})
}

mymap.on('click', onMapClick);
