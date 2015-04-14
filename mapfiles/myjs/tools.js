(function(){

var setVals = function (obj, vals) {
	if (obj && vals) {
		for (var x in vals) {
			if (vals.hasOwnProperty(x)) {
				obj[x] = vals[x];
			}
		}
	}
	return obj;
};

function CursorDiv(){
	this.cursorDiv = document.createElement("div");
	this.cursorDiv.style['opacity']=0.0;
	setVals(this.cursorDiv.style, {
		backgroundColor: 'white',
		opacity: 0.0,
		cursor: 'crosshair'
	});
	setVals(this.cursorDiv.style, {
		position: 'absolute',
		overflow: 'hidden',
		zIndex: 1,
		display: 'none'
	});

	map.getDiv().appendChild(this.cursorDiv);
}

CursorDiv.prototype.setCursor = function(cursorstyle){
	//this.cursorDiv.style['cursor']=cursorstyle;
	this.cursorDiv.style.left = 0 + 'px';
	this.cursorDiv.style.top = 0 + 'px';
	this.cursorDiv.style.width = map.getDiv().offsetWidth  + 'px';
	this.cursorDiv.style.height = map.getDiv().offsetHeight + 'px';
	this.cursorDiv.style.display = 'block';
};

CursorDiv.prototype.removeCursor = function(){
	this.cursorDiv.style.display = 'none';
};

google.maps.Map.prototype.enableChangeCursor = function(){
	this.cursorObject = new CursorDiv();
};

google.maps.Map.prototype.getCursorObject = function(){
	return this.cursorObject;
}

})();

var selectedShape;
var genId = 0;

var GenerateId = function(){
	return ++genId;
};

function clearSelection () {
	if(selectedShape){
		if (selectedShape.property == 'line') {
            selectedShape.flightPath.set('strokeColor','#FF0000');	                
        }else if(selectedShape.property == 'target'){
        	var marker = selectedShape.object;
        	// if (marker.getAnimation() != null) {
	            marker.setAnimation(null);
	        // } else {
	        //     marker.setAnimation(google.maps.Animation.BOUNCE);
	        // }
        }else if(selectedShape.property == 'radar'){
        	selectedShape.circle.set('strokeColor', '#FF0000');
        }
        selectedShape = null;
	}
}

function setSelection (shape) {
	clearSelection();
    selectedShape = shape;
    if(selectedShape){
		if (selectedShape.property == 'line') {
            selectedShape.flightPath.set('strokeColor', '#000000');	             
        }else if(selectedShape.property == 'target'){
        	var marker = selectedShape.object;
        	// if (marker.getAnimation() != null) {
	        //    marker.setAnimation(null);
	        // } else {
	             marker.setAnimation(google.maps.Animation.BOUNCE);
	        // }
        }else if(selectedShape.property == 'radar'){
        	selectedShape.circle.set('strokeColor', '#000000');
        }
	}   
}

var changeCursor = function(){
	if(map.get('draggable')==true){
		map.set('draggable',false);
		document.body.style.cursor = "crosshair";
	}else{
		map.set('draggable',true);
	}			
};

var setDragMap= function(){
	map.set('draggable',true);
	clearSelection();
};

function setZoom(zoom){
    map.setZoom(zoom);
}

function setCenter(center_x, center_y){
    var center = new google.maps.LatLng(center_y, center_x);
    map.setCenter(center);
}

function deleteSelectedShape (){
	overTrack();
	if(selectedShape){
    	if (selectedShape.property == 'line') {
            deleteLine(selectedShape.id,selectedShape.dramaId);           	             
        }else if(selectedShape.property == 'target'){
        	deleteObject(selectedShape.id);	  
        }else if(selectedShape.property == 'radar'){
        	deleteRadar(selectedShape.id);
        }
    }
}

function copySelectedShape()
{
	if(selectedShape){
		if(selectedShape.objType==objTypes.PLANE){
			copy = new google.maps.Marker({
				icon: selectedShape.image,
				draggable: selectedShape.draggable
			});		
			copy.type = google.maps.drawing.OverlayType.MARKER;
			copy.setPosition(setSelection.getPosition());	
		}else if(selectedShape.objType==objTypes.RADAR){
			copy = new google.maps.Circle({
				strokeColor: originColor,
		        strokeOpacity: selectedShape.strokeOpacity,
		        strokeWeight: selectedShape.strokeWeight,
		        draggable: selectedShape.draggable,
		        editable: selectedShape.editable,
		        fillColor: selectedShape.fillColor,
		        fillOpacity: selectedShape.fillOpacity,
		        radius: selectedShape.radius
			});
			copy.type = google.maps.drawing.OverlayType.CIRCLE;
			copy.id = selectedShape.id;
		}else{
			copy = new google.maps.Polyline({
				strokeColor: originColor,
		        strokeOpacity: selectedShape.strokeOpacity,
		        strokeWeight: selectedShape.strokeWeight,
		        draggable: selectedShape.draggable
			});
			copy.type = google.maps.drawing.OverlayType.POLYLINE;
			copy.dramaId = selectedShape.dramaId;
			copy.path = selectedShape.getPath();
		}	
	}
}

function pasteSelectedShape()
{
	if(copy){
		if(selectedShape.objType==objTypes.PLANE){
			var pos = copy.getPosition();
			var copyPos = new google.maps.LatLng(pos.lat()+1,pos.lng());
			copy.setPosition(copyPos);
			copy.setMap(map);
		}else if(selectedShape.objType==objTypes.RADAR){
			var copyRadar = new Radar(-1,0,0,0,0);
			var originCenter = selectedShape.getCenter();
			var copyCenter = new google.maps.LatLng(originCenter.lat()+1,originCenter.lng());
			copy.setCenter(copyCenter);
			copy.marker.setPosition(copyCenter);
			copy.id = returnLineId();
			copyRadar.id = copy.id;
			copyRadar.marker = copy.marker;
			copyRadar.radarCircle = copy;
			copy.setMap(map);
			copy.marker.setMap(map);
			radarArray.push(copyRadar);
		}else{
			var copyLine = new Line(-1);
			var originPath = copy.path;
			var copyPath = new google.maps.MVCArray();
			for(var i = 0,len = originPath.getLength();i<len;i++){
				var pos = originPath.getAt(i);
				var copyPos = new google.maps.LatLng(pos.lat()-1,pos.lng());
				copyPath.push(copyPos);
			}
			copy.setPath(copyPath);
			copy.id = returnLineId();
			copyLine.id = copy.id;
			copyLine.flightPath = copy;
			copy.setMap(map);
			drama.push(copyLine);
			setSelection(copy);
			
		}
		copy = null;
	}
	
}

function clearAll()
{
	if(dramaArray){
		var len1 = dramaArray.length;
		for(var i=0;i<len1;i++){
			var currentDrama = dramaArray[i].drama;
			if(currentDrama){
				var len2 = currentDrama.length;
				for(var j=0;j<len2;j++){
					currentDrama[j].flightPath.setMap(null);
					var len3 = currentDrama[j].flightPath.markerarray.length
					for(var k=0;k<len3;k++){
						currentDrama[j].flightPath.markerarray[k].label.setMap(null);
					}
					currentDrama[j].flightPath.markerarray.splice(0,len3);					
				}
				currentDrama.splice(0,len2);				
			}
		}
		dramaArray.splice(0,len1);
	}
	clearRadarCapLine();
	clearObject();
	clearRadar();	
}
