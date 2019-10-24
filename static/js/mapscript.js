this.loadOpenstreetMap = function(divMapId, centerCoordinate, zoomLevel) {
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

function polystyle(feature) {
    return {
        fillColor: 'gray',
        weight: 2,
        opacity: 1,
        color: 'blue',  //Outline color
        fillOpacity: .5
    };
}
L.geoJSON(orlando_outside_boundary, {style: polystyle}).addTo(mymap);

function getCorrespondingFeature(zipCode) {
  var geojsonFeature = {}
  for (i = 0; i < orlando[0].features.length; i++) {
    if (orlando[0].features[i].properties.zipc == zipCode) {
      geojsonFeature = orlando[0].features[i];
      break;
    }
  }
  return geojsonFeature;
}

function getPolygonLayer(geojsonFeature, color) {
  return L.geoJSON(geojsonFeature, {
    onEachFeature: function(feature, layer) {
      //console.log(feature)
      layer.bindPopup("<h2> ZIPCode: " + feature.properties.zipc + "</h2>");
    }
  }).setStyle({
    color: color
  });
}

function getMarker(latlng, annotation) {
  //latlng should be an array like [lat, lng]
  console.log(latlng[1])
  return L.marker(latlng).bindPopup("<h2> Tweet: " + annotation + ', ' + latlng[0] + ', ' + latlng[1] + "</h2>");
}

function populateZipsOnMap(zipWithProbs) {
  // prob -> probability
  maxProbKey = null;
  maxProbValue = 0;
  Object.keys(zipWithProbs).forEach(function(key, index) {
    //console.log(zipWithProbs)
    zipCode = key
    var geojsonFeature = getCorrespondingFeature(zipCode);
    currentProbValue = zipWithProbs[key][0]
    if (currentProbValue > maxProbValue) {
      maxProbValue = currentProbValue
      maxProbKey = key
    }

    // creating zip polygon on two conditions. if probability
    // is (<=.5 and >0) and >.5
    if (currentProbValue <= 0.5 && currentProbValue > 0) {
      var zipCodePolygonLayer = getPolygonLayer(geojsonFeature, 'blue');
      zipCodePolygonLayer.addTo(itemsFeatureGroup)
    }
    if (currentProbValue > 0.5) {
      var zipCodePolygonLayer = getPolygonLayer(geojsonFeature, 'red');
      zipCodePolygonLayer.addTo(itemsFeatureGroup)
    }
  });
  //console.log(itemsFeatureGroup.getBounds())
  var geojsonFeature = getCorrespondingFeature(maxProbKey);
  var zipCodePolygonLayer = getPolygonLayer(geojsonFeature, 'red');
  zipCodePolygonLayer.addTo(itemsFeatureGroup)
}

function populateCandidatesOnMap(candidates, locations, annotations) {
  for (var i = 0; i < candidates.length; i++) {
    getMarker(locations[i].reverse(), annotations[i]).addTo(itemsFeatureGroup)
  }
}

function generateDynamicTable(zipWithProbs) {
  var myTableDiv = document.getElementById("myDynamicTable")
  var table = document.createElement('TABLE')
  table.border = '1'
  // var caption = document.createElement('CAPTION')
  // caption.innerHTML = "Zip with Probability"
  // table.appendChild(caption)
  var tableBody = document.createElement('TBODY')
  table.appendChild(tableBody)

  var trHeaderRow = document.createElement('TR')
  tableBody.appendChild(trHeaderRow)
  var trProbRow = document.createElement('TR')
  tableBody.appendChild(trProbRow)
  for (var i = 0; i < zipWithProbs.length; i++) {
    var th = document.createElement('TH')
    th.innerHTML = zipWithProbs[i].zip
    trHeaderRow.appendChild(th)

    td = document.createElement("TD")
    td.innerHTML = zipWithProbs[i].prob
    trProbRow.appendChild(td)
  }
  myTableDiv.innerHTML = ""
  myTableDiv.appendChild(table)
}

function sort(zipWithProbs) {
  zips = []
  Object.keys(zipWithProbs).forEach(function(key, index) {
    zips.push({
      "zip": key,
      "prob": zipWithProbs[key][0]
    })
  })
  zips.sort(function(a, b) {
    return b.prob - a.prob
  });
  return zips;
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
    data: {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    }
  }).done(function(response) {
    itemsFeatureGroup.clearLayers()
    response = JSON.parse(response);
    zip_with_probs = JSON.parse(response.zip_with_probs)
    console.log(response)
    populateZipsOnMap(zip_with_probs)
    populateCandidatesOnMap(response.candidates, response.candidate_loc, response.candidate_annotation)
    generateDynamicTable(sort(zip_with_probs))
    openNav()
    mymap.fitBounds(itemsFeatureGroup.getBounds())
  });
}

function onRefresh(){
  itemsFeatureGroup.clearLayers();
  var myTableDiv = document.getElementById("myDynamicTable")
  myTableDiv.innerHTML = '';
}

mymap.on('click', onMapClick);

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
  document.getElementById("mySidenav").style.width = "350px";
  document.getElementById("mapid").style.marginLeft = "350px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("mapid").style.marginLeft = "0";
}
