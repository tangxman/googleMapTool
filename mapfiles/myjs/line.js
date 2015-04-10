var poly;
var anotherCircle;

var line;

var dramaArray = new Array();

var track = new Track(GenerateId(),new Array(),new Array());

var radarLineArray = new Array();
var drawingLineArray = new Array();

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

var createDiv = function(combineobject,point,direc,type){
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
	combineobject.markerarray.push(marker);
	combineobject.labelarray.push(label);
	marker.label = label;
	return marker;
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

function Track(drama_id,drama,target_array){
	this.dramaId = drama_id;
	this.drama = drama;
	this.targetArray = target_array;
}

var overTrack=function(flag){
	if(endState==false){
		if(poly){
			poly.setMap(null);
			google.maps.event.clearListeners(poly,'click');
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
		alreadyDistance = 0;
		if(track.drama.length>0){
			dramaArray.push(track);
			track = new Track(GenerateId(),new Array(),new Array());			
		}
	}
};

//画圆弧
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

Number.prototype.toBrng = function () {
  return (this.toDeg() + 360) % 360;
};


function Line(id){
	if(id!=-1){
		overTrack(0);
		this.id = id;
		this.dramaId = track.dramaId;
	    var movepositionmarker,movedistancemarker;
	    var markerarray = [];
	    var labelarray = [];          
	    poly = new google.maps.Polyline(polyOptions);
	    poly.setMap(map);
	    poly.markerarray = markerarray;
	    poly.labelarray = labelarray;
	    this.flightPath = poly;
	    var self = this;
	    movepositionmarker = createDiv(poly,null,"down","position");
	    movedistancemarker = createDiv(poly,null,"top","distance");
	    if(trackStartPoint){
	        var path = poly.getPath();
	        path.push(trackStartPoint);
	        path.push(trackStartPoint);
	        start = trackStartPoint;
	    }else{
	        google.maps.event.addListenerOnce(map, 'click', function(event){
		        var path = poly.getPath();
		        start = event.latLng;
		        path.push(start);
		        
		        createDiv(poly,start,"down","position");
		        createDiv(poly,start,"top","distance").setTitle("起点");
		    });
	    }
	    endState = false;
	    google.maps.event.addListener(map,'mousemove',function(event){
	    	var path = poly.getPath();
			path.pop(); 
			path.push(event.latLng);
			movepositionmarker.setPosition(event.latLng);
			if(start){
				movedistancemarker.setPosition(event.latLng);
				movedistancemarker.setTitle(((alreadyDistance+start.distanceFrom(event.latLng))/1000).toFixed(2)+"公里");
			}		
	    });
	    google.maps.event.addListener(poly, 'click', function(event){
	        var path = poly.getPath();
			var end = event.latLng;	
			path.push(end);
			alreadyDistance += start.distanceFrom(event.latLng);			
			start = end;
			createDiv(poly,end,"down","position");
			createDiv(poly,end,"top","distance").setTitle((alreadyDistance/1000).toFixed(2)+"公里");	
		});
		google.maps.event.addListenerOnce(poly, 'dblclick', function(event){
			var path = poly.getPath();
			var end = event.latLng;	
			path.pop();			
			trackStartPoint = end;
			endState = true;
			google.maps.event.clearListeners(poly,'click');
			google.maps.event.clearListeners(map,'mousemove');
			alreadyDistance += start.distanceFrom(event.latLng);
			start = end;

			movepositionmarker.label.setMap(null);
			movedistancemarker.label.setMap(null);
			movepositionmarker = null;
			movedistancemarker = null;

			poly.markerarray.splice(0,2);
			poly.labelarray.splice(0,2);

			poly.markerarray.splice(-2,2);
			poly.labelarray.pop().setMap(null);
			poly.labelarray.pop().setMap(null);

			createDiv(poly,end,"down","position");
			createDiv(poly,end,"top","distance").setTitle((alreadyDistance/1000).toFixed(2)+"公里");

			track.drama.push(self);
			drawingLineArray.push(self);

			var firstPoint = path.getAt(0);

			self.start = firstPoint;

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

		});

		google.maps.event.addListenerOnce(map,'rightclick',function(event){
			map.enableRightClickMenu();
			overTrack(1);
		});

	}
}

function createLine()
{
	map.disableRightClickMenu();
	line = new Line(GenerateId());
}

var updateLine = function(id,point_array){
	var update_line = getLine(id,drawingLineArray);
	if(!update_line){
		update_line = new Object();
		poly = new google.maps.Polyline(polyOptions);
		poly.setMap(map);	
		poly.markerarray = [];
    	poly.labelarray = [];
    	update_line.id = GenerateId();
    	update_line.dramaId = track.dramaId;
    	update_line.flightPath = poly;
    	track.drama.push(update_line);
    	drawingLineArray.push(update_line);
	}
	var marker_array_length = update_line.flightPath.markerarray.length;
	for(var i=0;i<marker_array_length;i++){
		update_line.flightPath.markerarray[i].setMap(null);
		update_line.flightPath.labelarray[i].setMap(null);
	}
	update_line.flightPath.markerarray.splice(0,marker_array_length);
	update_line.flightPath.labelarray.splice(0,marker_array_length);
	point_array = point_array.split("-");
	var path = update_line.flightPath.getPath();
	for(var i=0;i<point_array.length;i+=2){
		var pos = new google.maps.LatLng(parseFloat(point_array[i+1]),parseFloat(point_array[i]));
		path.push(pos);
		//createDiv(update_line.flightPath,pos,"down","position");
		//createDiv(update_line.flightPath,pos,"down","position");
	}
	// if(marker_array_length<point_array.length){
	// 	createDiv(update_line.flightPath,start_point,"down","position");
 //    	createDiv(update_line.flightPath,start_point,"top","distance").setTitle("起点");
	// }

};

var createTrack = function(size,point_array,batch_count,type,type_id){
	line = new Line(-1);
	line.id = GenerateId();
	line.dramaId = track.dramaId;
	point_array = point_array.split("-");
	poly = new google.maps.Polyline(polyOptions);
	poly.markerarray = [];
	poly.labelarray = [];
	var path = poly.getPath();	
	for(var i=0;i<point_array.length;i+=2){
		path.push(new google.maps.LatLng(parseFloat(point_array[i+1]),parseFloat(point_array[i])));
	}
	poly.setMap(map);
	line.flightPath = poly;
	track.drama.push(line);
	drawingLineArray.push(line);
	placeLineTarget(track.dramaId,batch_count,type,type_id);
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
};


var updateRadarCapLine = function(start_x,start_y,end_x,end_y,type){

	if(type==0){
		polyOptions.strokeColor = '#1E90FF';
	}else{
		polyOptions.strokeColor = '#000000';
	}	
	var capline = new google.maps.Polyline(polyOptions);
	var path = [new google.maps.LatLng(start_y,start_x),new google.maps.LatLng(end_y,end_x)];
	capline.setPath(path);
	capline.setMap(map);
	radarLineArray.push(capline);
};

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
    this.id = id;
    this.dramaId = track.dramaId;
	this.flightPath = poly;
	var self = this;
	movepositionmarker = createDiv(poly,null,"down","position");
	movedistancemarker = createDiv(poly,null,"top","distance");
	if(trackStartPoint){
		startPoint = trackStartPoint;		
		google.maps.event.addListener(map,'mousemove',function(event){
    		centerPoint = event.latLng;
    		startBearing = centerPoint.Bearing(startPoint);
    		radius = centerPoint.distanceFrom(startPoint);
	    	var arcPts = drawArc(centerPoint,startBearing, 360, radius);
	   	 	poly.setPath(arcPts);
	   	 	movepositionmarker.setPosition(centerPoint);
	   	 	movedistancemarker.setPosition(centerPoint);
	   	 	movedistancemarker.setTitle((radius/1000).toFixed(2)+"公里");
    	});

    	google.maps.event.addListenerOnce(map,'click',function(event){	
    		google.maps.event.clearListeners(map,'mousemove');
    		createDiv(poly,event.latLng,"down","position");
    		createDiv(poly,event.latLng,"top","distance").setTitle((radius/1000).toFixed(2)+"公里");
    	});
	}else{
		google.maps.event.addListenerOnce(map,'click',function(event){
    		startPoint = event.latLng;
    		createDiv(poly,startPoint,"down","position");
    		createDiv(poly,startPoint,"top","distance").setTitle("起点");
    		google.maps.event.addListener(map,'mousemove',function(event){
	    		centerPoint = event.latLng;
	    		startBearing = centerPoint.Bearing(startPoint);
	    		radius = centerPoint.distanceFrom(startPoint);
		    	var arcPts = drawArc(centerPoint,startBearing, 360, radius);
		   	 	poly.setPath(arcPts);
		   	 	movepositionmarker.setPosition(centerPoint);
		   	 	movedistancemarker.setPosition(centerPoint);
	   	 		movedistancemarker.setTitle((radius/1000).toFixed(2)+"公里");
	    	});
	    	google.maps.event.addListenerOnce(map,'click',function(event){
	    		google.maps.event.clearListeners(map,'mousemove');
	    		createDiv(poly,event.latLng,"down","position");
    			createDiv(poly,event.latLng,"top","distance").setTitle((radius/1000).toFixed(2)+"公里");
	    	});
    	});   	
	}
	endState = false;
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

		if(endBearing>startBearing){
			var anotherPath = drawArc(centerPoint,startBearing, -(360-endBearing+startBearing), radius);
		}else{
			var anotherPath = drawArc(centerPoint,startBearing, endBearing-startBearing+360, radius);
		}
		anotherCircle.setPath(anotherPath);

		createDiv(poly,endPoint,"down","position");
		

		google.maps.event.addListenerOnce(map, 'click', function(event){
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
			trackStartPoint = pathArray[pathArray.length-1];
			
			createDiv(poly,endPoint,"top","distance").setTitle((alreadyDistance/1000).toFixed(2)+"公里");
			anotherCircle.setMap(null);
			anotherCircle = null;			
			endState = true;
			
			movepositionmarker.label.setMap(null);
			movedistancemarker.label.setMap(null);
			movepositionmarker = null;
			movedistancemarker = null;
			poly.markerarray.splice(0,2);
			poly.labelarray.splice(0,2);

			poly.centerPoint = centerPoint;
			poly.startPoint = startPoint;
			poly.endPoint = trackStartPoint;
			track.drama.push(self);
			drawingLineArray.push(self);

			google.maps.event.addListener(poly,'dblclick',function(event){
				
				circleSettings.updateCircle(self.id,self.flightPath.startPoint.lng(),self.flightPath.startPoint.lat(),
					self.flightPath.centerPoint.lng(),self.flightPath.centerPoint.lat(),
					self.flightPath.centerPoint.Bearing(self.flightPath.endPoint)-self.flightPath.centerPoint.Bearing(self.flightPath.startPoint),
					self.flightPath.centerPoint.distanceFrom(self.flightPath.startPoint)/1000,self.direction);
			});
		});
    });

	google.maps.event.addListenerOnce(map,'rightclick',function(event){
		map.enableRightClickMenu();
		overTrack(1);
	});
	
}

function createCirArc(){
	map.disableRightClickMenu();
	line = new circleArc(GenerateId());
}

function updateCircle(id,start_x,start_y,center_x,center_y,angle,direction)
{
	var circle_arc = getLine(id,drawingLineArray);
	if(!circle_arc){
		circle_arc = new Object();
		poly = new google.maps.Polyline(polyOptions);
		poly.setMap(map);	
		poly.markerarray = [];
    	poly.labelarray = [];
    	circle_arc.id = GenerateId();
    	circle_arc.dramaId = track.dramaId;
    	circle_arc.flightPath = poly;
    	track.drama.push(circle_arc);
    	drawingLineArray.push(circle_arc);
	}
	circle_arc.direction = direction;
	var marker_array_length = circle_arc.flightPath.markerarray.length;
	for(var i=0;i<marker_array_length;i++){
		circle_arc.flightPath.markerarray[i].setMap(null);
		circle_arc.flightPath.labelarray[i].setMap(null);
	}
	circle_arc.flightPath.markerarray.splice(0,marker_array_length);
	circle_arc.flightPath.labelarray.splice(0,marker_array_length);
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
}

var createRandomTrack = function(){
	var select_area_option = {
		strokeColor: "#FF0000",
	    strokeOpacity: 1.0,
	    fillOpacity:0.1,
	    strokeWeight: 2,
	    editable: false,
	    draggable: true
	}
	var select_area = new google.maps.Rectangle(select_area_option);
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
		var targetArray = dramaArray[i].targetArray;
		if(targetArray.length!=0){
			var ids = [];
			for(var h=0;h<targetArray.length;h++){
				ids.push(targetArray[h].id);
			}
			track_initial.setTarget(ids,dramaArray[i].batch_count,targetArray[0].type,targetArray[0].type_id);
		}
		track_initial.push_back_track_slot();
	}
};