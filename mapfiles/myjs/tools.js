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
var colors = ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'];
var selectedColor;
var originColor;
var colorButtons = {};

var objTypes={
	LINE:1,
	CURVE:2,
	CIRCLE:3,
	CIRARC:4,
	ELLIPSE:5,
	PLANE:6,
	RADAR:7
};

var genId = 0;
var divId = 0;

var copy;

var GenerateId = function(){
	return ++genId;
};

function clearSelection () {
	if(selectedShape){
		if (selectedShape.type!=google.maps.drawing.OverlayType.MARKER) {
            selectedShape.setEditable(false);
            selectedShape.set('strokeColor', originColor);	                
        }
        selectedShape = null;
	}
    
}

function setSelection (shape) {
	clearSelection();
    selectedShape = shape;   
    if(selectedShape.objType != objTypes.PLANE && selectedShape.objType != objTypes.RADAR){
    	originColor = shape.get('strokeColor');
    	selectColor(shape.get('fillColor') || shape.get('strokeColor'));
    	selectedShape.set('strokeColor', '#000000');   	
    }
    if(selectedShape.objType == objTypes.LINE || selectedShape.objType == objTypes.CIRCLE){
    	shape.setEditable(true);
    }
    
}

function selectColor (color) {
    selectedColor = color;
    for (var i = 0; i < colors.length; ++i) {
        var currColor = colors[i];
        colorButtons[currColor].style.border = currColor == color ? '2px solid #789' : '2px solid #fff';
    }

    var polylineOptions = drawingManager.get('polylineOptions');
    polylineOptions.strokeColor = color;
    drawingManager.set('polylineOptions', polylineOptions);

    var rectangleOptions = drawingManager.get('rectangleOptions');
    rectangleOptions.strokeColor = color;
    drawingManager.set('rectangleOptions', rectangleOptions);

    var circleOptions = drawingManager.get('circleOptions');
    circleOptions.strokeColor = color;
    drawingManager.set('circleOptions', circleOptions);

    var polygonOptions = drawingManager.get('polygonOptions');
    polygonOptions.strokeColor = color;
    drawingManager.set('polygonOptions', polygonOptions);
}

function setSelectedShapeColor (color) {
    if (selectedShape) {
        // if (selectedShape== google.maps.drawing.OverlayType.POLYLINE) {
        	originColor = color;
         	selectedShape.set('strokeColor', color);
        // } else {
        //     selectedShape.set('fillColor', color);
        // }
    }
}

function makeColorButton (color) {
    var button = document.createElement('span');
    button.className = 'color-button';
    button.style.backgroundColor = color;
    google.maps.event.addDomListener(button, 'click', function () {
        selectColor(color);
        setSelectedShapeColor(color);
    });

    return button;
}

function buildColorPalette () {
    var colorPalette = document.getElementById('color-palette');
    for (var i = 0; i < colors.length; ++i) {
        var currColor = colors[i];
        var colorButton = makeColorButton(currColor);
        colorPalette.appendChild(colorButton);
        colorButtons[currColor] = colorButton;
    }
    selectColor(colors[0]);
}

function setZoom(zoom){
    map.setZoom(zoom);
}

function setCenter(center_x, center_y){
    var center = new google.maps.LatLng(center_y, center_x);
    map.setCenter(center);
}

function clearDrawingMode()
{
	drawingManager.setDrawingMode(null);
	google.maps.event.clearListeners(map,'mousemove');
	google.maps.event.clearListeners(map,'click');
 	google.maps.event.addListener(map, 'click', clearSelection);
 	line = null;
}

function deleteSelectedShape (){
	if(selectedShape){
    	if(selectedShape.objType==objTypes.RADAR){
    		deleteRadar(selectedShape.id);
    	}else if(selectedShape.objType==objTypes.PLANE){
    		deleteObject(selectedShape.id)
    	}else{
    		deleteTrack(selectedShape.id,selectedShape.dramaId);
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
		for(var i=0,len1=dramaArray.length;i<len1;i++){
			var currentDrama = dramaArray[i].drama;
			if(currentDrama){
				for(var j=0,len2=currentDrama.length;j<len2;j++){
					currentDrama[j].flightPath.setMap(null);
					for(var k=0;k<currentDrama[j].flightPath.markerarray.length;k++){
						currentDrama[j].flightPath.markerarray[k].setMap(null);
						currentDrama[j].flightPath.labelarray[k].setMap(null);
					}
					currentDrama[j].flightPath.markerarray.splice(0,currentDrama[j].flightPath.markerarray.length);
					currentDrama[j].flightPath.labelarray.splice(0,currentDrama[j].flightPath.labelarray.length);					
				}
				currentDrama.splice(0,currentDrama.length);				
			}
		}
		dramaArray.splice(0,dramaArray.length);
	}
	clearObject();
	clearRadar();
	radarLineArray.splice(0,radarLineArray.length);
}

function selectObject(id){
    
}