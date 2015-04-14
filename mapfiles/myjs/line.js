var poly = new Object();
poly.endState = true;
poly.currentAlreadyDistance = 0;
poly.lastPolyEndPoint = null;

var dramaArray = new Array();
var radarLineArray = new Array();
var drawingLineArray = new Array();

var track = new Track(GenerateId(),new Array(),new Array());

var polyOptions = {       
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    editable: false,
    draggable: false                
};

var select_area;

var createDiv = function(combineobject,point,direc,type){
	var marker = new google.maps.Marker({
		position: point,
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
	combineobject.markerarray.push(marker);
	marker.label = label;
	return marker;
};

var drawArc = function(center, initialBearing, deltaBearing, radius) { 
	var d2r = Math.PI / 180;   // degrees to radians 
	var r2d = 180 / Math.PI;   // radians to degrees 

	var points = 32; 

	//radius = radius*111*1000;

	//radius = radius/1609;

	var rlat = (radius / 6378137.0) * r2d; 
	var rlng = rlat / Math.cos(center.lat() * d2r); 

	var extp = new Array();

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
	var c = this.lat()*Math.PI/180,d = otherLatLng.lat()*Math.PI/180;
	var e = this.lng()*Math.PI/180,f = otherLatLng.lng()*Math.PI/180;
	var distance = 2*Math.asin(Math.sqrt(Math.pow(Math.sin((c-d)/2.0),2)+Math.cos(c)*Math.cos(d)*Math.pow(Math.sin((e-f)/2.0),2)));
	return distance*6378137;
};


Number.prototype.toRad = function () {
  return this * Math.PI / 180;
};


Number.prototype.toDeg = function () {
  return this * 180 / Math.PI;
};

google.maps.Polyline.prototype.endState = false;

google.maps.Polyline.prototype.endPoint = null;

function Track(drama_id,drama,target_array){
	this.dramaId = drama_id;
	this.drama = drama;
	this.targetArray = target_array;
}

var createTrack = function(size,point_array,batch_count,type,type_id,delay){
	line = new Object;
	line.id = GenerateId();
	line.dramaId = track.dramaId;
	point_array = point_array.split("-");
	poly = new google.maps.Polyline(polyOptions);
	poly.markerarray = [];
	var path = poly.getPath();	
	for(var i=0;i<point_array.length;i+=2){
		path.push(new google.maps.LatLng(parseFloat(point_array[i+1]),parseFloat(point_array[i])));
	}
	poly.setMap(map);
	line.flightPath = poly;
	line.property = 'line';
	track.drama.push(line);
	drawingLineArray.push(line);
	placeLineTarget(track.dramaId,batch_count,type,type_id,delay);
	google.maps.event.addListener(poly,'dblclick',function(event){	

		lineSettings.targetBatchArrayClear();
		lineSettings.turningPointArrayClear();

		var added_distance = 0;
		var path = poly.getPath();
		for(var i = 1;i<path.getLength();i++){
			var turningPoint = path.getAt(i);
			added_distance+=path.getAt(i-1).distanceFrom(turningPoint);
			lineSettings.turningPoint_push(turningPoint.lng(),turningPoint.lat(),added_distance/1000);
		}						
		lineSettings.updateLine(line.id,line.dramaId, poly.getPath().getAt(0).lng(),poly.getPath().getAt(0).lat());
	});

	google.maps.event.addListener(poly,'click',function(event){
		setSelection(line);
	});
};

var getTrack = function(drama_id){
	if(track.dramaId == drama_id){
		return track;
	}
	for(var i=0,len1=dramaArray.length;i<len1;i++){
		if(dramaArray[i].dramaId==drama_id){
			return dramaArray[i];
		}
	}
};

var clearRadarCapLine = function(){
	for(var i=0,m=radarLineArray.length;i<m;i++){
		radarLineArray[i].setMap(null);
	}
	radarLineArray.splice(0,radarLineArray.length);
};

var clearUnfinishedPoly = function(){
	poly.setMap(null);
	google.maps.event.removeListener(poly.map_click_listener);
	google.maps.event.removeListener(poly.mouse_move_listener);
	google.maps.event.removeListener(poly.map_right_click_listener);
	google.maps.event.removeListener(poly.poly_click_listener);
	for(var i=poly.markerarray.length-1;i>=0;i--){
		poly.markerarray.pop().label.setMap(null);
	}
	if(typeof poly.anotherCircle !== 'undefined'){
		poly.anotherCircle.setMap(null);
		poly.anotherCircle = null;
	}
}

var overTrack=function(){
	if(poly.endState==false){
		clearUnfinishedPoly();
	}		
	poly.endPoint = null;
	poly.currentAlreadyDistance = null;
	if(track.drama.length>0){
		dramaArray.push(track);
		track = new Track(GenerateId(),new Array(),new Array());	
		map.enableRightClickMenu();		
	}		
};

var deleteLine = function(id,drama_id){
	if(track){
		if(track.dramaId == drama_id){
			for(var j=0,len2=track.drama.length;j<len2;j++){
				if(id == track.drama[j].id){
					var poly = track.drama[j].flightPath;
					poly.setMap(null);
					for(var i=poly.markerarray.length-1;i>=0;i--){
						poly.markerarray.pop().label.setMap(null);
					}
					track.drama.splice(j,1);
					return;
				}
			}
		}
	}
	for(var i=0,len1=dramaArray.length;i<len1;i++){
		var currentDrama = dramaArray[i];
		if(currentDrama&&currentDrama.dramaId==drama_id){
			for(var j=0,len2=currentDrama.drama.length;j<len2;j++){
				if(id == currentDrama.drama[j].id){
					var poly = currentDrama.drama[j].flightPath;
					poly.setMap(null);
					for(var i=poly.markerarray.length-1;i>=0;i--){
						poly.markerarray.pop().label.setMap(null);
					}
					currentDrama.splice(j,1);
					return;
				}
			}
		}
	}	
};

var getLine = function(id,array){
	for(var i = 0,m = array.length;i<m;i++){
		if(id == array[i].id){
			return array[i];
		}
	}
	return null;
};

var createLine = function(){
	var trackStartPoint = poly.endPoint;
	var alreadyDistance = poly.currentAlreadyDistance;
	map.disableRightClickMenu();
	if(poly.endState==false){
		clearUnfinishedPoly();
		trackStartPoint = poly.lastPolyEndPoint;
		alreadyDistance = poly.lastPolyAlreadyDistance;
	}	
    var movepositionmarker,movedistancemarker;   
    poly = new google.maps.Polyline(polyOptions);
    poly.setMap(map);
    poly.markerarray = [];
    poly.lastPolyEndPoint = trackStartPoint;
    poly.lastPolyAlreadyDistance = alreadyDistance;
    poly.endPoint = null;
    var line = new Object();		
	line.id = GenerateId();
	line.dramaId = track.dramaId;
    line.flightPath = poly;
    line.property = 'line'
    var self = line;
    movepositionmarker = createDiv(poly,null,"down","position");
    movedistancemarker = createDiv(poly,null,"top","distance");
    if(trackStartPoint){
        var path = poly.getPath();
        path.push(trackStartPoint);
        path.push(trackStartPoint);
        poly.endPoint = trackStartPoint;
        poly.startPoint = trackStartPoint;
    }else{
        poly.map_click_listener = google.maps.event.addListenerOnce(map, 'click', function(event){
	        var path = poly.getPath();
	        var end = event.latLng;
	        poly.startPoint = end;
	        poly.endPoint = end;
	        path.push(end);
	        
	        createDiv(poly,end,"down","position");
	        createDiv(poly,end,"top","distance").setTitle("起点");
	    });
    }
    poly.mouse_move_listener = google.maps.event.addListener(map,'mousemove',function(event){
    	var path = poly.getPath();
		path.pop(); 
		path.push(event.latLng);
		movepositionmarker.setPosition(event.latLng);
		//movepositionmarker.label.position = event.latLng;
		if(poly.endPoint){
			movedistancemarker.setPosition(event.latLng);
			movedistancemarker.setTitle(((alreadyDistance+poly.endPoint.distanceFrom(event.latLng))/1000).toFixed(2)+"公里");
		}		
    });
    poly.poly_click_listener = google.maps.event.addListener(poly, 'click', function(event){
        var path = poly.getPath();
		var end = event.latLng;	
		path.push(end);
		alreadyDistance += poly.endPoint.distanceFrom(end);			
		poly.endPoint = end;
		createDiv(poly,end,"down","position");
		createDiv(poly,end,"top","distance").setTitle((alreadyDistance/1000).toFixed(2)+"公里");	
	});
	google.maps.event.addListenerOnce(poly, 'dblclick', function(event){
		var path = poly.getPath();
		var end = event.latLng;	
		path.pop();				
		poly.endState = true;
		google.maps.event.clearListeners(poly,'click');
		google.maps.event.clearListeners(map,'mousemove');
		alreadyDistance += poly.endPoint.distanceFrom(end);
		poly.endPoint = end;
		movepositionmarker.label.setMap(null);
		movedistancemarker.label.setMap(null);
		movepositionmarker = null;
		movedistancemarker = null;
		poly.markerarray.splice(0,2);
		poly.markerarray.pop().label.setMap(null);
		poly.markerarray.pop().label.setMap(null);
		createDiv(poly,end,"down","position");
		createDiv(poly,end,"top","distance").setTitle((alreadyDistance/1000).toFixed(2)+"公里");
		poly.currentAlreadyDistance = alreadyDistance;
		track.drama.push(self);
		drawingLineArray.push(self);
		var firstPoint = path.getAt(0);
		google.maps.event.addListener(poly,'dblclick',function(event){	

			lineSettings.targetBatchArrayClear();
			lineSettings.turningPointArrayClear();

			var added_distance = 0;
			for(var i = 1;i<path.getLength();i++){
				var turningPoint = path.getAt(i);
				added_distance+=path.getAt(i-1).distanceFrom(turningPoint);
				lineSettings.turningPoint_push(turningPoint.lng(),turningPoint.lat(),added_distance/1000);
			}				
			
			lineSettings.updateLine(self.id,self.dramaId, firstPoint.lng(),firstPoint.lat());
		});

		google.maps.event.addListener(poly,'click',function(event){
			setSelection(self);
		});

	});

	poly.right_click_listener = google.maps.event.addListenerOnce(map,'rightclick',function(event){
		overTrack();	
	});
};

var updateLine = function(id,point_array){
	var update_line = getLine(id,drawingLineArray);
	if(!update_line){
		update_line = new Object();
		poly = new google.maps.Polyline(polyOptions);
		poly.setMap(map);	
		poly.markerarray = [];
    	update_line.id = GenerateId();
    	update_line.dramaId = track.dramaId;
    	update_line.flightPath = poly;
    	update_line.property = 'line';
    	track.drama.push(update_line);
    	drawingLineArray.push(update_line);
    	google.maps.event.addListener(poly,'click',function(event){
    		setSelection(update_line);
    	});
	}
	var marker_array_length = update_line.flightPath.markerarray.length;
	for(var i=marker_array_length-1;i>=0;i--){
		update_line.flightPath.markerarray.pop().label.setMap(null);
	}
	point_array = point_array.split("-");
	var path = update_line.flightPath.getPath();
	var m=point_array.length;
	for(var i=0;i<m;i+=2){
		var pos = new google.maps.LatLng(parseFloat(point_array[i+1]),parseFloat(point_array[i]));
		path.push(pos);
		//createDiv(update_line.flightPath,pos,"down","position");
		//createDiv(update_line.flightPath,pos,"down","position");
	}
	update_line.flightPath.startPoint = path.getAt(0);
	update_line.flightPath.endPoint = path.getAt(m/2-1);
	update_line.flightPath.endState = true;
	// if(marker_array_length<point_array.length){
	// 	createDiv(update_line.flightPath,start_point,"down","position");
 //    	createDiv(update_line.flightPath,start_point,"top","distance").setTitle("起点");
	// }

};

function createCirArc(){
	var trackStartPoint = poly.endPoint;
	var alreadyDistance = poly.currentAlreadyDistance;
	map.disableRightClickMenu();
	if(poly.endState==false){
		clearUnfinishedPoly();
		trackStartPoint = poly.lastPolyEndPoint;
		alreadyDistance = poly.lastPolyAlreadyDistance;
	}
	var centerPoint,startPoint,endPoint;
	var startBearing,endBearing,radius;
	var movepositionmarker,movedistancemarker;
	var line = new Object();
	poly = new google.maps.Polyline(polyOptions);
	poly.setMap(map);
	poly.markerarray = [];
	poly.lastPolyEndPoint = trackStartPoint;
	poly.lastPolyAlreadyDistance = alreadyDistance;
    line.id = GenerateId();
    line.dramaId = track.dramaId;
	line.flightPath = poly;
	line.property = 'line';
	var self = line;
	movepositionmarker = createDiv(poly,null,"down","position");
	movedistancemarker = createDiv(poly,null,"top","distance");
	if(trackStartPoint){
		startPoint = trackStartPoint;
		poly.startPoint = startPoint;	
		poly.endPoint = startPoint;	
		poly.mouse_move_listener = google.maps.event.addListener(map,'mousemove',function(event){
    		centerPoint = event.latLng;
    		poly.centerPoint = centerPoint;
    		startBearing = centerPoint.Bearing(startPoint);
    		radius = centerPoint.distanceFrom(startPoint);
	    	var arcPts = drawArc(centerPoint,startBearing, 360, radius);
	   	 	poly.setPath(arcPts);
	   	 	movepositionmarker.setPosition(centerPoint);
	   	 	movedistancemarker.setPosition(centerPoint);
	   	 	movedistancemarker.setTitle((radius/1000).toFixed(2)+"公里");
    	});

    	poly.map_click_listener = google.maps.event.addListenerOnce(map,'click',function(event){	
    		google.maps.event.clearListeners(map,'mousemove');
    		createDiv(poly,event.latLng,"down","position");
    		createDiv(poly,event.latLng,"top","distance").setTitle((radius/1000).toFixed(2)+"公里");
    	});
	}else{
		poly.map_click_listener = google.maps.event.addListenerOnce(map,'click',function(event){
    		startPoint = event.latLng;
    		poly.startPoint = startPoint;
    		poly.endPoint = startPoint;
    		createDiv(poly,startPoint,"down","position");
    		createDiv(poly,startPoint,"top","distance").setTitle("起点");
    		self.map_mousemove_listener = google.maps.event.addListener(map,'mousemove',function(event){
	    		centerPoint = event.latLng;
	    		poly.centerPoint = centerPoint;
	    		startBearing = centerPoint.Bearing(startPoint);
	    		radius = centerPoint.distanceFrom(startPoint);
		    	var arcPts = drawArc(centerPoint,startBearing, 360, radius);
		   	 	poly.setPath(arcPts);
		   	 	movepositionmarker.setPosition(centerPoint);
		   	 	movedistancemarker.setPosition(centerPoint);
	   	 		movedistancemarker.setTitle((radius/1000).toFixed(2)+"公里");
	    	});
	    	self.map_click_listener = google.maps.event.addListenerOnce(map,'click',function(event){
	    		google.maps.event.clearListeners(map,'mousemove');
	    		createDiv(poly,event.latLng,"down","position");
    			createDiv(poly,event.latLng,"top","distance").setTitle((radius/1000).toFixed(2)+"公里");
	    	});
    	});   	
	}
	poly.poly_click_listener = google.maps.event.addListenerOnce(poly,'click',function(event){
    	endPoint = event.latLng;
    	endBearing = centerPoint.Bearing(endPoint);
    	var arcPts = drawArc(centerPoint,startBearing, endBearing-startBearing, radius);
		poly.setPath(arcPts); 

		var anotherOptions = polyOptions;
		var orincolor = polyOptions.strokeColor;
		anotherOptions.strokeColor = '#32CD32';
		anotherCircle = new google.maps.Polyline(anotherOptions);
		anotherCircle.setMap(map);
		polyOptions.strokeColor = orincolor;	   	

		if(endBearing>startBearing){
			var anotherPath = drawArc(centerPoint,startBearing, -(360-endBearing+startBearing), radius);
		}else{
			var anotherPath = drawArc(centerPoint,startBearing, endBearing-startBearing+360, radius);
		}
		anotherCircle.setPath(anotherPath);

		createDiv(poly,endPoint,"down","position");
		
		poly.map_click_listener = google.maps.event.addListenerOnce(map, 'click', function(event){
			var selectPoint = event.latLng;
			var selectBearing = centerPoint.Bearing(selectPoint);

			var radius = centerPoint.distanceFrom(startPoint);
			if(endBearing>startBearing){
				if(selectBearing>startBearing&&selectBearing<endBearing){
					var pathArray = poly.getPath().getArray();
					alreadyDistance +=(endBearing-startBearing).toRad()*radius;				
					self.direction = 0;	
				}else{
					var pathArray = anotherCircle.getPath().getArray();
					alreadyDistance +=(360-endBearing+startBearing).toRad()*radius;
					self.direction = 1;
				}
			}else{
				if(selectBearing>endBearing&&selectBearing<startBearing){
					var pathArray = poly.getPath().getArray();
					alreadyDistance +=(startBearing-endBearing).toRad()*radius;				
					self.direction = 1;
				}else{
					var pathArray = anotherCircle.getPath().getArray();
					alreadyDistance +=(360+endBearing-startBearing).toRad()*radius;
					self.direction = 0;
				}
			}			
			poly.setPath(pathArray);
			
			createDiv(poly,endPoint,"top","distance").setTitle((alreadyDistance/1000).toFixed(2)+"公里");
			anotherCircle.setMap(null);
			anotherCircle = null;			
			poly.endState = true;
			
			movepositionmarker.label.setMap(null);
			movedistancemarker.label.setMap(null);
			movepositionmarker = null;
			movedistancemarker = null;
			poly.markerarray.splice(0,2);
			
			poly.endPoint = pathArray[pathArray.length-1];
			poly.currentAlreadyDistance = alreadyDistance;
			track.drama.push(self);
			drawingLineArray.push(self);

			google.maps.event.addListener(poly,'dblclick',function(event){
				
				circleSettings.updateCircle(self.id,self.flightPath.startPoint.lng(),self.flightPath.startPoint.lat(),
					self.flightPath.centerPoint.lng(),self.flightPath.centerPoint.lat(),
					self.flightPath.centerPoint.Bearing(self.flightPath.endPoint)-self.flightPath.centerPoint.Bearing(self.flightPath.startPoint),
					self.flightPath.centerPoint.distanceFrom(self.flightPath.startPoint)/1000,self.direction);
			});

			google.maps.event.addListener(poly,'click',function(event){
	    		setSelection(self);
	    	});
		});
    });

	poly.map_right_click_listener = google.maps.event.addListenerOnce(map,'rightclick',function(event){		
		overTrack();		
	});

}

var updateCircle = function(id,start_x,start_y,center_x,center_y,angle,direction){
	var circle_arc = getLine(id,drawingLineArray);
	if(!circle_arc){
		circle_arc = new Object();
		poly = new google.maps.Polyline(polyOptions);
		poly.setMap(map);	
		poly.markerarray = [];
    	circle_arc.id = GenerateId();
    	circle_arc.dramaId = track.dramaId;
    	circle_arc.flightPath = poly;
    	circle_arc.property = 'line';
    	track.drama.push(circle_arc);
    	drawingLineArray.push(circle_arc);
    	google.maps.event.addListener(poly,'click',function(event){
    		setSelection(circle_arc);
    	});
	}
	circle_arc.direction = direction;
	var marker_array_length = circle_arc.flightPath.markerarray.length;
	for(var i=marker_array_length-1;i>=0;i--){
		circle_arc.flightPath.markerarray.pop().label.setMap(null);
	}
	var start_point = new google.maps.LatLng(start_y,start_x);
	var center_point = new google.maps.LatLng(center_y,center_x);
	circle_arc.flightPath.startPoint =start_point;
	circle_arc.flightPath.centerPoint = center_point;
	if(direction>0){
		angle = -angle;
	}
	var new_path = drawArc(center_point,center_point.Bearing(start_point), angle, center_point.distanceFrom(start_point));
	circle_arc.flightPath.setPath(new_path);	
	circle_arc.flightPath.endPoint = new_path[new_path.length-1];
	if(marker_array_length/2>2){
		createDiv(circle_arc.flightPath,start_point,"down","position");
    	createDiv(circle_arc.flightPath,start_point,"top","distance").setTitle("起点");
	}
	createDiv(circle_arc.flightPath,center_point,"down","position");
	createDiv(circle_arc.flightPath,circle_arc.flightPath.endPoint,"down","position");
};

var updateRadarCapLine = function(start_x,start_y,end_x,end_y,type){

	var capline = new google.maps.Polyline(polyOptions);
	if(type==0){
		capline.strokeColor = '#1E90FF';
	}else{
		capline.strokeColor = '#000000';
	}		
	var path = [new google.maps.LatLng(start_y,start_x),new google.maps.LatLng(end_y,end_x)];
	capline.setPath(path);
	capline.setMap(map);
	radarLineArray.push(capline);
};

var createRandomTrack = function(){
	var select_area_option = {
		strokeColor: "#FF0000",
	    strokeOpacity: 1.0,
	    fillOpacity:0.1,
	    strokeWeight: 2,
	    editable: false,
	    draggable: true
	}
	select_area = new google.maps.Rectangle(select_area_option);
	select_area.setMap(map);
	map.draggable = false;
	google.maps.event.addListenerOnce(map,'mousedown',function(event){
		var first_point = event.latLng;
		var min_lat,max_lat;
		var min_lng,max_lng;
		select_area.setBounds(new google.maps.LatLngBounds(first_point,first_point));
		google.maps.event.addListener(map,'mousemove',function(event){
			var second_point = event.latLng;
			if(second_point.lat()<first_point.lat()){
				min_lat = second_point.lat();
				max_lat = first_point.lat();
			}else{
				min_lat = first_point.lat();
				max_lat = second_point.lat();
			}
			if(second_point.lng()<first_point.lng()){
				min_lng = second_point.lng();
				max_lng = first_point.lng();
			}else{
				min_lng = first_point.lng();
				max_lng = second_point.lng();
			}
			var north_east = new google.maps.LatLng(max_lat,max_lng);
			var south_west = new google.maps.LatLng(min_lat,min_lng);
			select_area.setBounds(new google.maps.LatLngBounds(south_west,north_east));
		});

		google.maps.event.addListener(select_area,'mousemove',function(event){
			var second_point = event.latLng;
			if(second_point.lat()<first_point.lat()){
				min_lat = second_point.lat();
				max_lat = first_point.lat();
			}else{
				min_lat = first_point.lat();
				max_lat = second_point.lat();
			}
			if(second_point.lng()<first_point.lng()){
				min_lng = second_point.lng();
				max_lng = first_point.lng();
			}else{
				min_lng = first_point.lng();
				max_lng = second_point.lng();
			}
			var north_east = new google.maps.LatLng(max_lat,max_lng);
			var south_west = new google.maps.LatLng(min_lat,min_lng);
			select_area.setBounds(new google.maps.LatLngBounds(south_west,north_east));
		});
		
	});

	google.maps.event.addListenerOnce(select_area,'mouseup',function(event){
		map.draggable = true;
		google.maps.event.clearListeners(map,'mousemove');
		google.maps.event.clearListeners(select_area,'mousemove');
		var bounds = select_area.getBounds();
		randomSettings.initial(bounds.getNorthEast().lng(),bounds.getNorthEast().lat(),bounds.getSouthWest().lng(),bounds.getSouthWest().lat());
	});
};

var clearSelecedArea = function(){
	if(select_area){
		select_area.setMap(null);
		select_area = null;
	}
};

var addTracksToQt = function(){
	var trackId;
	track_initial.clearOptionTracks();
	for(var i=0,len1 = dramaArray.length;i<len1;i++)
	{
		var currentDrama = dramaArray[i].drama;
		for(var j=0,len2 = currentDrama.length;j<len2;j++){
			var currentLine = currentDrama[j];
			var pathArr = currentLine.flightPath.getPath().getArray();
			for(var k=0,len3=pathArr.length;k<len3-1;k++)
			{
				track_initial.setLine(pathArr[k].lng(),pathArr[k].lat(),pathArr[k+1].lng(),pathArr[k+1].lat(),currentLine.id);
			}
		}
		if(dramaArray[i].targetArray.length==0){
			placeLineTarget(dramaArray[i].dramaId,1,0,0,0);
		}
		var targetArray = dramaArray[i].targetArray;
		var ids = [];
		for(var h=0,m=targetArray.length;h<m;h++){
			ids.push(targetArray[h].id);
		}
		track_initial.setTarget(ids,dramaArray[i].batch_count,targetArray[0].type,targetArray[0].type_id,targetArray[0].delay);
		track_initial.push_back_track_slot();
	}
};