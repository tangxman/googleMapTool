var radarArray = new Array();

var radar;

var circleOptions = {
    fillColor: '#32CD32',
    fillOpacity: 0,
    strokeWeight: 3,
    strokeColor:'#32CD32',
    clickable: false
};

var getRadar = function(id){
    for(var i=0;i<radarArray.length;i++){
        if(radarArray[i].id == id){
            return radarArray[i];
        }
    }
    return null;
};

function Radar(id,type_id){	
	if(id!=-1){
        var image;
        if(type_id==0){
            image = "images/radar.png";
        }else if(type_id==1){
            image = "images/radar.png";
        }
        this.id = id;
        this.markerarray = new Array();
        this.labelarray = new Array();

        var self = this;

        google.maps.event.addListenerOnce(map,'click',function(event){
            var center = event.latLng;
            var marker = new google.maps.Marker({
                position: center,
                icon: image,
                map:map,
                draggable:true
            });
            self.marker = marker;

            createDiv(self,center,"down","position");

            var circle = new google.maps.Circle(circleOptions);
            circle.setMap(map);
            circle.bindTo('center', marker, 'position');

            var movedistancemarker = createDiv(self,null,"top","distance");
            var movepositionmarker = createDiv(self,null,"down","position");
            google.maps.event.addListener(map,'mousemove',function(event){                
                circle.setRadius(center.distanceFrom(event.latLng));
                movepositionmarker.setPosition(event.latLng);
                movedistancemarker.setPosition(event.latLng);
                movedistancemarker.setTitle((center.distanceFrom(event.latLng)/1000).toFixed(2)+"公里");

            });

            google.maps.event.addListenerOnce(map,'click',function(event){
                google.maps.event.clearListeners(map,'mousemove');
                self.circle = circle;
                radarArray.push(self);
                createDiv(self,end,"down","position");
                createDiv(self,end,"top","distance").setTitle((center.distanceFrom(event.latLng)/1000).toFixed(2)+"公里");
                movepositionmarker.label.setMap(null);
                movedistancemarker.label.setMap(null);
                movepositionmarker = null;
                movedistancemarker = null;
            });
        });      
	}	
}

function createRadar(type_id)
{
	radar = new Radar(GenerateId(),type_id);
}

function updateRadar(id,radius,type_id,x,y){
    radar = getRadar(id);
    var center = new google.maps.LatLng(x, y);
    var image;
    if(type_id==0){
        image = "images/radar.png";
    }else if(type_id==1){
        image = "images/radar.png";
    }
    if(!radar){
        radar = new Radar(-1,0);
        radar.id = GenerateId();       
        var marker = new google.maps.Marker({
            position: center,
            icon: image,
            map:map
        });
        radar.marker = marker;
        radar.circle = new google.maps.Circle(circleOptions);
        radar.circle.setMap(map);
        radarArray.push(radar);
    }
    radar.marker.setOptions({icon:image});
    radar.circle.setCenter(center);
    radar.circle.setRadius(radius);
}

function startScan(radar,radiuPos){
    var i=0;                                       
    var handle = setInterval(function(){
        i+=5;
        var scanSectorPath = new drawArc(radiuPos,i,3.14/6,radar.radius);
        scanSectorPath.push(radiuPos);
        radar.sector.setMap(null);
        var newSector = new google.maps.Polygon({
            paths: [scanSectorPath],
            strokeColor: "#00FF00",
            strokeOpacity: 0.5,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            map: map
        });
        radar.sector = newSector;
    },4000/40);
}

function updateRadar(id, type_id, x, y, radius){
	deleteRadar(id);
    var newRadar = new Radar(id, type_id, x, y, radius);	
}

function deleteRadar(id){
	var index = getRadar(id);
    if(index!=-1){
        var radar = radarArray[index];
        radar.marker.setMap(null);    
        radar.radarCircle.setMap(null);
        //radar.sector.setMap(null);
        radarArray.splice(index,1);
    }
}
    
	

function clearRadar(){
	for(r in radarArray){
		radarArray[r].marker.setMap(null);
		radarArray[r].radarCircle.setMap(null);
        //radarArray[r].sector.setMap(null);
	}
	radarArray.splice(0,radarArray.length);
}

function createRadarState(radar_id, object_id){

}

function updateRadarState(radar_id, object_id){

}

function deleteRadarState(radar_id, object_id){

}

function clearRadarState(id){

}

function addRadarToQt()
{
	for(var i=0,len1=radarArray.length;i<len1;i++)
	{
		radar = radarArray[i];
		var north = radar.radarCircle.getBounds().getNorthEast();
		var mar = radar.marker;
		opera_option.setRadar(north.lng(),north.lat(),mar.getPosition().lng(),mar.getPosition().lat(),radar.id);
	}
}


// function placeLineRadar(){
//     if(selectedShape){
//         if (selectedShape.type!=google.maps.drawing.OverlayType.MARKER) {
//             path = selectedShape.getPath();
//             array = path.getArray();
//             var startLine = path.getAt(0);
//             marker = new google.maps.Marker({
//                 map:map,
//                 position:startLine                        
//             });                   
//         }
//         //selectedShape = null;
//     }
//     //alert(path.getLength());
// }

// function placeRadar(){
// 	var markerOptions = drawingManager.get('markerOptions');
// 	markerOptions.icon = new google.maps.MarkerImage('images/radar.png');
// 	drawingManager.set('markerOptions',markerOptions);
// 	var mode = google.maps.drawing.OverlayType.MARKER;        	
// 	drawingManager.setDrawingMode(mode);
// }

// function optionRadar(){
//     var radis = 1;
//     drawCurLine(radis,selectedShape.getPosition().lat(),selectedShape.getPosition().lng(),360);
//     drawCurLine(radis,selectedShape.getPosition().lat(),selectedShape.getPosition().lng(),60);
// }
