// Define the overlay, derived from google.maps.OverlayView
var offset={
    top:[-50,-20],
    down:[-50,0],
    left:[-100,0],
    right:[0,0]
};

function Label(opt_options,direc) {
  // Initialization
  this.setValues(opt_options);

  // Label specific
  var span = this.span_ = document.createElement('span');
  span.style.cssText = 'position: relative; left:'+offset[direc][0]+'%; top: '+offset[direc][1]+'px; ' +
  'white-space: nowrap; border: 1px solid blue; ' +
  'padding: 2px; background-color: white';


  var div = this.div_ = document.createElement('div');
  div.appendChild(span);
  div.style.cssText = 'position: absolute; display: none';
};
Label.prototype = new google.maps.OverlayView;


// Implement onAdd
Label.prototype.onAdd = function() {
  var pane = this.getPanes().overlayImage;
  pane.appendChild(this.div_);


  // Ensures the label is redrawn if the text or position is changed.
  var me = this;
  this.listeners_ = [
    google.maps.event.addListener(this, 'position_changed', function() { me.draw(); }),
    google.maps.event.addListener(this, 'visible_changed', function() { me.draw(); }),
    google.maps.event.addListener(this, 'text_changed', function() { me.draw(); })
  ];
};

// Implement onRemove
Label.prototype.onRemove = function() {
 this.div_.parentNode.removeChild(this.div_);

 // Label is removed from the map, stop updating its position/text.
 for (var i = 0, I = this.listeners_.length; i < I; ++i) {
   google.maps.event.removeListener(this.listeners_[i]);
 }
};

// Implement draw
Label.prototype.draw = function() {
 var projection = this.getProjection();
 var position = projection.fromLatLngToDivPixel(this.get('position'));
 if(position && typeof position !== 'undefined'){
  var div = this.div_;
  div.style.left = position.x  + 'px';
  div.style.top = position.y  + 'px';
  div.style.display = 'block';
  var str = this.get('text');
  if(typeof str === 'object'){
    var lat = str.lat().toFixed(2);
    var lng = str.lng().toFixed(2);
    this.span_.innerHTML = "("+lat+","+lng+")";
  }else{
    this.span_.innerHTML = str;
  }  
 }
 

};
