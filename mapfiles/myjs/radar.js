var radarArray = new Array();

var radar;

var drawRadar = 0;

function getRadar(id){
    for(i in radarArray){
        if(radarArray[i].id == id){
            return i;
        }
    }
    return -1;
}

function Radar(id,type_id){	
	if(id!=-1){
		this.id = id;

		var image;
		if(type_id==0){
	        image = "images/radar.png";
	    }else if(type_id==1){
	        image = "images/radar.png";
	    }

	    var mode = google.maps.drawing.OverlayType.CIRCLE;
		drawingManager.setDrawingMode(mode);
	}
	

	// google.maps.event.addListenerOnce(map, 'click', function(e){
 //        var pos = e.latLng;
 //        var marker = new google.maps.Marker({
 //             position: pos,
 //             icon: image,
 //             map:map
 //        });
 //        radar.marker = marker;
        
	// });

	
    // this.id = id;
    // this.type_id = type_id;
    // this.x = x;
    // this.y = y;
    // this.radius = radius;
    // var myLatLng = new google.maps.LatLng(y, x);
    // var image;
    // if(type_id==0){
    //     image = "images/radar.png";
    // }else if(type_id==1){
    //     image = "images/radar.png";
    // }
    // var marker = new google.maps.Marker({
    //     position: myLatLng,
    //     icon: image
    // });
    // marker.setMap(map); 
    // this.marker = marker;
    
    // var radarCircle = new google.maps.Circle({
    //     center:myLatLng,
    //     radius:radius*111*1000,
    //     strokeColor:"#0000FF",
    //     strokeOpacity:0.8,
    //     strokeWeight:2,
    //     fillColor:"#000000",
    //     fillOpacity:0
    // });
    // radarCircle.setMap(map);
    // this.radarCircle = radarCircle;
    // var sectorPath = new drawArc(myLatLng,0,3.14/6,radius);
    // sectorPath.push(myLatLng);
    // this.sectorPath = sectorPath;

    // var sector = new google.maps.Polygon({
    //     paths: [sectorPath],
    //     strokeColor: "#00FF00",
    //     strokeOpacity: 0.5,
    //     strokeWeight: 2,
    //     fillColor: "#FF0000",
    //     fillOpacity: 0.35,
    //     map: map
    // });

    // this.sector = sector;
    // radarArray.push(this);

    //startScan(this,myLatLng);
    
//    clearInterval(handle);
}

// function createRadar(id, type_id,  x, y, radius){
//     var radar = new Radar(id, type_id,  x, y, radius);
// }

function createRadar()
{
	drawRadar =1;
	radar = new Radar(returnLineId(),0);
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
