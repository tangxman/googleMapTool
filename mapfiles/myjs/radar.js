var radarArray = new Array();

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

function Radar(id){	

	if(id!=-1){
        
	}	
}

function createRadar()
{
    var image = "images/radar.png";
    var radar = new Object();
    radar.id = GenerateId();
    radar.type_id = -1;
    radar.property = 'radar';
    radar.markerarray = [];

    var self = radar;

    google.maps.event.addListenerOnce(map,'click',function(event){
        var center = event.latLng;
        var marker = new google.maps.Marker({
            position: center,
            icon: image,
            map:map,
            draggable:true
        });
        self.marker = marker;

        createDiv(self,center,"down","position").bindTo('position',marker);

        var circle = new google.maps.Circle(circleOptions);
        self.radarCircle = circle;
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
            var end = event.latLng;
            radarArray.push(self);
            //createDiv(self,end,"down","position");
            //createDiv(self,end,"top","distance").setTitle((center.distanceFrom(event.latLng)/1000).toFixed(2)+"公里");
            movepositionmarker.label.setMap(null);
            movedistancemarker.label.setMap(null);
            movepositionmarker = null;
            movedistancemarker = null;

            google.maps.event.addListener(marker,'dblclick',function(event){
                radarSettings.updateRadar(self.id,self.type_id,radar.circle.getCenter().lng(),radar.circle.getCenter().lat(),radar.circle.getRadius()/1000);
            });

            google.maps.event.addListener(marker,'click',function(event){
                setSelection(self);
            });
        });
    });      
}

function updateRadar(id,type_id,x,y,scan_type,scan_start_pos,scan_angle,radius){
    var radar = getRadar(id);
    var center = new google.maps.LatLng(y,x);
    var image = "images/radar.png";    
    if(!radar){
        radar = new Object();
        radar.id = GenerateId();
        radar.property = 'radar';       
        var marker = new google.maps.Marker({
            position: center,
            icon: image,
            map:map
        });
        radar.marker = marker;
        radar.circle = new google.maps.Circle(circleOptions);
        radar.circle.setMap(map);
        radar.markerarray = [];
        radarArray.push(radar);
        google.maps.event.addListener(marker,'click',function(event){
            setSelection(radar);
        });
    }
    if(scan_type==1){
        var sectorPath = new drawArc(center,scan_start_pos,scan_angle,radius*1000);
        sectorPath.push(center);

        var sector = new google.maps.Polygon({
            paths: [sectorPath],
            strokeColor: "#00FF00",
            strokeOpacity: 0.5,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            map: map
        });

        radar.sector = sector;
    }else{
        radar.sector = null;
    }
    radar.type_id = type_id;
    radar.scan_type = scan_type;
    radar.scan_start_pos = scan_start_pos;
    radar.scan_angle = scan_angle;
    radar.circle.setCenter(center);
    radar.circle.setRadius(radius*1000);
}

// function startScan(radar,radiuPos){
//     var i=0;                                       
//     var handle = setInterval(function(){
//         i+=5;
//         var scanSectorPath = new drawArc(radiuPos,i,3.14/6,radar.radius);
//         scanSectorPath.push(radiuPos);
//         radar.sector.setMap(null);
//         var newSector = new google.maps.Polygon({
//             paths: [scanSectorPath],
//             strokeColor: "#00FF00",
//             strokeOpacity: 0.5,
//             strokeWeight: 2,
//             fillColor: "#FF0000",
//             fillOpacity: 0.35,
//             map: map
//         });
//         radar.sector = newSector;
//     },4000/40);
// }

function deleteRadar(id){
	var radar = getRadar(id);
    if(radar){
        radar.marker.setMap(null);    
        radar.circle.setMap(null);
        if(radar.sector){
            radar.sector.setMap(null);
        }      
        radar = null; 
        radarArray.splice(index,1);
    }
}
    
function clearRadar(){
	for(var r=0,m=radarArray.length;r<m;r++){
		radarArray[r].marker.setMap(null);
		radarArray[r].circle.setMap(null);
        if(radarArray[r].sector){
            radarArray[r].sector.setMap(null);
        }
        var n = radarArray[r].markerarray.length;       
        for(var k=0;k<n;k++){
            radarArray[r].markerarray[k].label.setMap(null);
        }
        radarArray[r].markerarray.splice(0,n);
	}
	radarArray.splice(0,radarArray.length);
}

function addRadarToQt()
{
	for(var i=0,len1=radarArray.length;i<len1;i++)
	{
		var radar = radarArray[i];  
        var center = radar.circle.getCenter();   
        var north_point = center.DestinationPoint(0,radar.circle.getRadius());
		track_initial.setRadar(radar.id,north_point.lng(),north_point.lat(),center.lng(),
            center.lat(),radar.scan_start_pos,radar.scan_angle);
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
