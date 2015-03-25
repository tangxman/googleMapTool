//画圆弧
function drawArc(center, initialBearing, deltaBearing, radius) { 
  var d2r = Math.PI / 180;   // degrees to radians 
  var r2d = 180 / Math.PI;   // radians to degrees 

  var points = 32; 

  // find the raidus in lat/lon 
  var rlat = (radius / 6378137.0) * r2d; 
  var rlng = rlat / Math.cos(center.lat() * d2r); 

  var extp = new Array();

  deltaBearing = deltaBearing/points;
  for (var i=0; (i < points+1); i++) { 
    extp.push(center.DestinationPoint(initialBearing + i*deltaBearing, radius)); 
  } 
  extp.push(center);
  return extp;
}

google.maps.LatLng.prototype.DestinationPoint = function (brng, dist) {
  var R = 6378137.0; 
  var brng = brng.toRad();
  var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();
  var lat2 = Math.asin( Math.sin(lat1)*Math.cos(dist/R) + 
                        Math.cos(lat1)*Math.sin(dist/R)*Math.cos(brng) );
  var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(dist/R)*Math.cos(lat1), 
                               Math.cos(dist/R)-Math.sin(lat1)*Math.sin(lat2));

  return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
}

google.maps.LatLng.prototype.Bearing = function(otherLatLng) {
    var from = this;
    var to = otherLatLng;
    if (from.equals(to)) {
      return 0;
    }
    var lat1 = (Math.PI * from.lat()) / 180;
    var lon1 = (Math.PI * from.lng()) / 180;
    var lat2 = (Math.PI * to.lat()) / 180;
    var lon2 = (Math.PI * to.lng()) / 180;
    var angle = - Math.atan2( Math.sin( lon1 - lon2 ) * Math.cos( lat2 ), Math.cos( lat1 ) * Math.sin( lat2 ) - Math.sin( lat1 ) * Math.cos( lat2 ) * Math.cos( lon1 - lon2 ) );
    if ( angle < 0.0 ) angle  += Math.PI * 2.0;
    if ( angle > Math.PI ) angle -= Math.PI * 2.0; 
    return parseFloat(angle.toDeg());

}

google.maps.LatLng.prototype.distanceFrom = function(otherLatLng) { 
    distance = google.maps.geometry.spherical.computeDistanceBetween(this, otherLatLng) / 1609;

    return distance;
}


Number.prototype.toRad = function () {
  return this * Math.PI / 180;
};


Number.prototype.toDeg = function () {
  return this * 180 / Math.PI;
};

Number.prototype.toBrng = function () {
  return (this.toDeg() + 360) % 360;
};

