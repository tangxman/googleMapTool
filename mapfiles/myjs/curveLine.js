var marker1, marker2;
var circle, line;
var icons = Array();
var infoWnd = new google.maps.InfoWindow();
var bearingLabelDiv;

function createIcons() {
  icons = Array();
  var url;
  for (var n = 65; n < 67; n++) {
    var icon = new google.maps.MarkerImage('images/radar.png');
    icons.push(icon);
  }
}

function doLoad() {

  bearingLabelDiv = document.createElement("div");
  bearingLabelDiv.style.padding = 1;
  bearingLabelDiv.style.backgroundColor = "#EEE";
  bearingLabelDiv.style.borderColor = "#aaa";
  bearingLabelDiv.style.fontSize = "1.5em";
  
  
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(bearingLabelDiv);
}

function drawCircle(center, radius, bearing) {

  if (!circle) {
    circle = new google.maps.Polygon({
      strokeColor : '#000000',
      strokeWeight : 2,
      strokeOpacity : 1,
      fillColor : '#000000',
      fillColor : 0.15,
      map : map
    });
  }

  var circlePoints = Array();

  // radians
  var d = radius / 3963.189;

  // radians
  var lat1 = (Math.PI / 180) * center.lat();
  // radians
  var lng1 = (Math.PI / 180) * center.lng();

  for (var a = bearing - 180; a < bearing + 1; a++) {
    var tc = (Math.PI / 180) * a;
    var y = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(tc));
    var dlng = Math.atan2(Math.sin(tc) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(y));
    var x = ((lng1 - dlng + Math.PI) % (2 * Math.PI)) - Math.PI;
    // MOD function
    var point = new google.maps.LatLng(parseFloat(y * (180 / Math.PI), 10), parseFloat(x * (180 / Math.PI), 10));
    circlePoints.push(point);
  }

  circlePoints.push(circlePoints[0]);
  if (d < 1.5678565720686044) {
    circle.setPath(circlePoints);
  } else {
    circle.setPath(circlePoints);
  }
}

function calculateBearing() {
  var p1 = marker1.getPosition();
  var p2 = marker2.getPosition();

  var lat1 = p1.lat() * (Math.PI / 180);
  var lon1 = p1.lng() * (Math.PI / 180);
  var lat2 = p2.lat() * (Math.PI / 180);
  var lon2 = p2.lng() * (Math.PI / 180);

  var d = 2 * Math.asin(Math.sqrt(Math.pow((Math.sin((lat1 - lat2) / 2)), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow((Math.sin((lon1 - lon2) / 2)), 2)));
  var bearing = Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)) / -(Math.PI / 180);
  bearing = bearing < 0 ? 360 + bearing : bearing;

  // 0 degrees at 3 o'clock and counting couterclockwise
  var bearing = 360 - bearing + 90;

  bearingLabelDiv.innerHTML = 'Bearing: ' + bearing % 360;

  distance = google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1609;
  drawCircle(marker1.getPosition(), distance, bearing);

  if (!line) {
    line = new google.maps.Polyline({
      strokeColor : '#0000ff',
      strokeWeight : 2,
      strokeOpacity : 1,
      map : map
    });
  }
  line.setPath([marker1.getPosition(), marker2.getPosition()]);
}

function calculatePoint() {
  var startLat = marker1.getPosition().lat();
  var startLon = marker1.getPosition().lng();

  //in miles.
  var distance = 100;

  // 0 degrees at 3 o'clock and counting couterclockwise, so 90 is due north)
  var bearing = 0;

  var radiansLat = (distance / 3963.189) * (180 / Math.PI);
  var radiansLng = radiansLat / Math.cos(startLat * (Math.PI / 180));
  var radiansBearing = bearing * (Math.PI / 180);

  var destLon = startLon + (radiansLng * Math.cos(radiansBearing));
  var destLat = startLat + (radiansLat * Math.sin(radiansBearing));
  var destPoint = new google.maps.LatLng(parseFloat(destLat, 10), parseFloat(destLon, 10));

  marker2 = setMarker(marker2, destPoint, 'Lat: ' + destPoint.lat() + '<br>Lon: ' + destPoint.lng(), 'Destination', icons[1]);

  calculateBearing();
}

function setMarker(marker, point, html, title, icon) {
  if (marker) {
    marker.setPosition(point);
    return marker;
  }

  marker = new google.maps.Marker({
    position : point,
    title : title,
    icon : new google.maps.MarkerImage('images/radar.png'),
    draggable : true,
    map : map
  });
  google.maps.event.addListener(marker, 'click', function() {
    infoWnd.setContent(html);
    infoWnd.open(map, marker);
  });
  google.maps.event.addListener(marker, 'drag', function() {
    calculateBearing();
  });
  return marker;
}

function load() {
 createIcons();
 doLoad();
  marker1 = setMarker(marker1, new google.maps.LatLng(31.728167146023935,110.56640625), 'Center', 'Center', icons[0]);
  calculatePoint();
}