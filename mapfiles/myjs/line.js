var poly;
var anotherCircle;

var line;

var drama = new Array();
var dramaArray = new Array();

var radarCapLineArray = new Array();

var trackStartPoint;

var start;
var alreadyDistance = 0;

var endState = new Boolean(true);

var polyOptions = {       
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    editable: false,
    draggable: false                
};

var createDiv = function(point,direc,type){
	var marker = new google.maps.Marker({
		position: point,
		map: map,
		visible: false
	});

	var label = new Label({
		map: map,
		visible:true
	},direc);
	label.bindTo('position', marker);
	if(type=="distance"){
		label.bindTo('text',marker,'title');
	}else if(type=="position"){
		label.bindTo('text', marker, 'position');
	}
	poly.markerarray.push(marker);
	poly.labelarray.push(label);
	marker.label = label;
	return marker;
};

var getMousePosition = function (e) {
	var posX = 0, posY = 0;
	e = e || window.event;
	if (typeof e.pageX !== "undefined") {
		posX = e.pageX;
		posY = e.pageY;
	} else if (typeof e.clientX !== "undefined") {
		posX = e.clientX +
		(typeof document.documentElement.scrollLeft !== "undefined" ? document.documentElement.scrollLeft : document.body.scrollLeft);
		posY = e.clientY +
		(typeof document.documentElement.scrollTop !== "undefined" ? document.documentElement.scrollTop : document.body.scrollTop);
	}
	return {
		left: posX,
		top: posY
	};
};

var getLine = function(id,array){
	for(var i = 0;i<array.length;i++){
		if(id == array[i].id){
			return array[i];
		}
	}
	return null;
};

var deleteTrack = function(id,drama_id){
	if(drama){
		if(drama[0].dramaId == drama_id){
			for(var j=0,len2=drama.length;j<len2;j++){
				if(id == drama[j].id){
					drama[j].flightPath.setMap(null);
					drama.splice(j,1);
					return;
				}
			}
		}
	}
	for(var i=0,len1=dramaArray.length;i<len1;i++){
		var currentDrama = dramaArray[i];
		if(currentDrama&&currentDrama[0].dramaId==drama_id){
			for(var j=0,len2=currentDrama.length;j<len2;j++){
				if(id == currentDrama[j].id){
					currentDrama[j].flightPath.setMap(null);
					currentDrama.splice(j,1);
					return;
				}
			}
		}
	}	
};

var getTrack = function(id,drama_id){
	for(var i=0,len1=dramaArray.length;i<len1;i++){
		var currentDrama = dramaArray[i];
		if(currentDrama&&currentDrama[0].dramaId==drama_id){
			for(var j=0,len2=currentDrama.length;j<len2;j++){
				if(id == currentDrama[j].id){
					return currentDrama[j];
				}
			}
		}
	}
};

var overTrack=function(flag){
	if(endState==false){
		if(poly){
			poly.setMap(null);
			google.maps.event.clearListeners(poly,'click');
			google.maps.event.clearListeners(poly,'dblclick');
			google.maps.event.clearListeners(map,'mousemove');
			google.maps.event.clearListeners(map,'click');
			for(var i=0;i<poly.markerarray.length;i++){
				poly.markerarray[i].setMap(null);
				poly.markerarray[i]=null;
				poly.labelarray[i].setMap(null);
				poly.labelarray[i]=null;
			}
			poly = null;
			start = trackStartPoint;
		}
		if(anotherCircle){
			anotherCircle.setMap(null);
			anotherCircle = null;
		}
	}
	if(flag==1){
		trackStartPoint = null;
		start = null;
	}
};

//画圆弧
var drawArc = function(center, initialBearing, deltaBearing, radius) { 
	var d2r = Math.PI / 180;   // degrees to radians 
	var r2d = 180 / Math.PI;   // radians to degrees 

	var points = 32; 

	//radius = radius*111*1000;

	// find the raidus in lat/lon 
	var rlat = (radius / 6378137.0) * r2d; 
	var rlng = rlat / Math.cos(center.lat() * d2r); 

	var extp = new Array();

	if(deltaBearing<0){
		deltaBearing+=360;
	}

	deltaBearing = deltaBearing/points;

	for (var i=0; (i < points+1); i++) { 
		extp.push(center.DestinationPoint(initialBearing + i*deltaBearing, radius)); 
	} 
	return extp;
};

google.maps.LatLng.prototype.DestinationPoint = function (brng, dist) {
	var R = 6378137.0; 
	var brng = brng.toRad();
	var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();
	var lat2 = Math.asin( Math.sin(lat1)*Math.cos(dist/R) + 
	                      Math.cos(lat1)*Math.sin(dist/R)*Math.cos(brng) );
	var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(dist/R)*Math.cos(lat1), 
	                             Math.cos(dist/R)-Math.sin(lat1)*Math.sin(lat2));

	return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
};

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
};

google.maps.LatLng.prototype.distanceFrom = function(otherLatLng) {	
	  var distance = google.maps.geometry.spherical.computeDistanceBetween(this, otherLatLng) / 1609;

	  return distance;
};


Number.prototype.toRad = function () {
  return this * Math.PI / 180;
};


Number.prototype.toDeg = function () {
  return this * 180 / Math.PI;
};

Number.prototype.toBrng = function () {
  return (this.toDeg() + 360) % 360;
};


function Line(id){
	overTrack(0);
    var movepositionmarker,movedistancemarker;
    var markerarray = [];
    var labelarray = [];          
    poly = new google.maps.Polyline(polyOptions);
    poly.setMap(map);
    poly.markerarray = markerarray;
    poly.labelarray = labelarray;
    if(trackStartPoint){
        var path = poly.getPath();
        path.push(trackStartPoint);
        path.push(trackStartPoint);
        endState = false;
        start = trackStartPoint;
    }else{
        google.maps.event.addListenerOnce(map, 'click', function(event){
	        var path = poly.getPath();
	        start = event.latLng;
	        path.push(start);
	        endState = false;
	        createDiv(start,"down","position");
	        createDiv(start,"top","distance").setTitle("起点");
	    });
    }
    movepositionmarker = createDiv(null,"down","position");
    movedistancemarker = createDiv(null,"top","distance");
    google.maps.event.addListener(map,'mousemove',function(event){
    	var path = poly.getPath();
		path.pop(); 
		path.push(event.latLng);
		movepositionmarker.setPosition(event.latLng);
		if(start){
			movedistancemarker.setPosition(event.latLng);
			movedistancemarker.setTitle((alreadyDistance+start.distanceFrom(event.latLng)).toFixed(2)+"公里");
		}		
    });
    google.maps.event.addListener(poly, 'click', function(event){
		var path = poly.getPath();
		var end = event.latLng;	
		path.push(end);
		alreadyDistance += start.distanceFrom(event.latLng);			
		start = end;
		createDiv(end,"down","position");
		createDiv(end,"top","distance").setTitle(alreadyDistance.toFixed(2)+"公里");
	});

	google.maps.event.addListenerOnce(poly, 'dblclick', function(event){
		var path = poly.getPath();
		var end = event.latLng;	
		path.push(end);			
		trackStartPoint = end;
		endState = true;
		google.maps.event.clearListeners(poly,'click');
		google.maps.event.clearListeners(map,'mousemove');
		alreadyDistance += start.distanceFrom(event.latLng);
		start = end;
		createDiv(end,"down","position");
		createDiv(end,"top","distance").setTitle(alreadyDistance.toFixed(2)+"公里");
		movepositionmarker.label.setMap(null);
		movedistancemarker.label.setMap(null);
		movepositionmarker = null;
		movedistancemarker = null;
	});

	google.maps.event.addListenerOnce(map,'rightclick',function(event){
		overTrack(1);
	});
}

function createLine()
{
	line = new Line(returnLineId());
}

var updateLine = function(x,y,id){
	var capline = getLine(id,radarCapLineArray);
	if(!capline){
		capline = new google.maps.Polyline(polyOptions);
		capline.id = id;
		capline.setMap(map);
		radarCapLineArray.push(capline);
	}
	var path = capline.getPath();
	var point = new google.maps.LatLng(x,y);
	path.push(point);
};


function Circle(id){
	if(id!=-1){
		this.id = id;
		this.dramaId = dramaId;
		this.objType = objTypes.CIRCLE;
		var mode = google.maps.drawing.OverlayType.CIRCLE;
		drawingManager.setDrawingMode(mode);
	}
}

function createCircle(){
	drawRadar = 0;
	//clearSelection();
	var circle = new Circle(returnLineId());

}

function circleArc(id){
	var centerPoint,startPoint,endPoint;
	var startBearing,endBearing,radius;
	overTrack(0);
	var movepositionmarker,movedistancemarker;
	var markerarray = [];
    var labelarray = [];
	poly = new google.maps.Polyline(polyOptions);
	poly.setMap(map);
	poly.markerarray = markerarray;
    poly.labelarray = labelarray;
	if(trackStartPoint){
		startPoint = trackStartPoint;
		movepositionmarker = createDiv(null,"down","position");
		movedistancemarker = createDiv(null,"top","distance");
		google.maps.event.addListener(map,'mousemove',function(event){
    		centerPoint = event.latLng;
    		startBearing = centerPoint.Bearing(startPoint);
    		radius = centerPoint.distanceFrom(startPoint)*1600;
	    	var arcPts = drawArc(centerPoint,startBearing, 360, radius);
	   	 	poly.setPath(arcPts);
	   	 	movepositionmarker.setPosition(centerPoint);
	   	 	movedistancemarker.setPosition(centerPoint);
	   	 	movedistancemarker.setTitle(startPoint.distanceFrom(centerPoint).toFixed(2)+"公里");
    	});

    	google.maps.event.addListenerOnce(map,'click',function(event){	
    		google.maps.event.clearListeners(map,'mousemove');
    		createDiv(event.latLng,"down","position");
    		createDiv(event.latLng,"top","distance").setTitle(startPoint.distanceFrom(centerPoint).toFixed(2)+"公里");
    	});
    	endState = false;
	}else{
		google.maps.event.addListenerOnce(map,'click',function(event){
    		startPoint = event.latLng;
    		createDiv(startPoint,"down","position");
    		createDiv(startPoint,"top","distance").setTitle("起点");
    		movepositionmarker = createDiv(null,"down","position");
			movedistancemarker = createDiv(null,"top","distance");
    		google.maps.event.addListener(map,'mousemove',function(event){
	    		centerPoint = event.latLng;
	    		startBearing = centerPoint.Bearing(startPoint);
	    		radius = centerPoint.distanceFrom(startPoint)*1600;
		    	var arcPts = drawArc(centerPoint,startBearing, 360, radius);
		   	 	poly.setPath(arcPts);
		   	 	movepositionmarker.setPosition(centerPoint);
		   	 	movedistancemarker.setPosition(centerPoint);
	   	 		movedistancemarker.setTitle(startPoint.distanceFrom(centerPoint).toFixed(2)+"公里");
	    	});
	    	google.maps.event.addListenerOnce(map,'click',function(event){
	    		google.maps.event.clearListeners(map,'mousemove');
	    		createDiv(event.latLng,"down","position");
    			createDiv(event.latLng,"top","distance").setTitle(startPoint.distanceFrom(event.latLng).toFixed(2)+"公里");
	    	});
    	});
    	endState = false;
	}

	google.maps.event.addListenerOnce(poly,'click',function(event){
    	endPoint = event.latLng;
    	endBearing = centerPoint.Bearing(endPoint);
    	start = endPoint;
    	var arcPts = drawArc(centerPoint,startBearing, endBearing-startBearing, radius);
		poly.setPath(arcPts); 

		var anotherOptions = polyOptions;
		var orincolor = polyOptions.strokeColor;
		anotherOptions.strokeColor = '#32CD32';
		anotherCircle = new google.maps.Polyline(anotherOptions);
		anotherCircle.setMap(map);
		polyOptions.strokeColor = orincolor;	   	

		var anotherPath = drawArc(centerPoint,endBearing, startBearing-endBearing, radius);
		anotherCircle.setPath(anotherPath);

		createDiv(endPoint,"down","position");
		

		google.maps.event.addListenerOnce(map, 'click', function(event){
			var selectPoint = event.latLng;
			var selectBearing = centerPoint.Bearing(selectPoint);

			var selectOffSet = selectBearing-startBearing;
			var endOffSet = endBearing-startBearing;
			if(selectOffSet<0&&endOffSet>0){
				selectOffSet+=360;
			}else if(selectOffSet>0&&endOffSet<0){
				endOffSet+=360;
			}
			var radius = centerPoint.distanceFrom(startPoint);
			if(endBearing<0){
				endBearing+=360;
			}
			if(endOffSet<selectOffSet){
				poly.setPath(anotherCircle.getPath());
				var pathArray = poly.getPath().getArray();
				trackStartPoint = pathArray[0];
				alreadyDistance +=(360-endBearing).toRad()*radius;
				createDiv(endPoint,"top","distance").setTitle(alreadyDistance.toFixed(2)+"公里");
			}else{
				var pathArray = poly.getPath().getArray();
				trackStartPoint = pathArray[pathArray.length-1];
				alreadyDistance +=endBearing.toRad()*radius;
				createDiv(endPoint,"top","distance").setTitle(alreadyDistance.toFixed(2)+"公里");				
			}
			anotherCircle.setMap(null);
			anotherCircle = null;			
			endState = true;
			movepositionmarker.label.setMap(null);
			movedistancemarker.label.setMap(null);
			movepositionmarker = null;
			movedistancemarker = null;
		});
    });

	google.maps.event.addListenerOnce(map,'rightclick',function(event){
		overTrack(1);
	});
	
}

function createCirArc(){
	//clearDrawingMode();
	//clearSelection();
	line = new circleArc(returnLineId());
}

var addLinesToQt = function(){
	if(drama.length!=0){
		newDramaId();
	}
	var trackId;
	for(var i=0,len1 = dramaArray.length;i<len1;i++)
	{
		var currentDrama = dramaArray[i];
		for(var j=0,len2 = currentDrama.length;j<len2;j++){
			var currentLine = currentDrama[j];
			trackId = currentLine.dramaId;
			var pathArr = currentLine.flightPath.getPath().getArray();
			for(var k=0,len3=pathArr.length;k<len3-1;k++)
			{
				opera_option.setLine(pathArr[k].lng(),pathArr[k].lat(),pathArr[k+1].lng(),pathArr[k+1].lat(),currentLine.id);
			}
		}
		opera_option.push_back_track_slot(trackId);
	}
};