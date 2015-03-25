var objectArray = new Array();

var plane;

function getObject(id){
    for(i in objectArray){
        if(objectArray[i].id==id){
            return i;
        }
    }
    return -1;
} 

function addObject(id){
    
    var mode = google.maps.drawing.OverlayType.MARKER;
    drawingManager.setDrawingMode(mode);

    this.id = id;

    
    // this.id = id;
    // this.type_id = type_id;
    // this.x = x;
    // this.y = y;
    // var z = map.getZoom();
    // var pos = new google.maps.LatLng(y,x);
    // var image;

    // var angle = angle*180/Math.PI;
    // angle = angle | 0;
    // var quot = (angle / 10)|0;
    // var remain = angle%10;
    // if(remain>=5){
    //     quot = quot+1;
    // }
    // angle = quot*10;

    // if(type_id==0){
    //     var image = "images/plane_"+angle+".png";
    // }else if(type_id==1){
    //     image = "images/plane.png";
    // }else if(type_id==2){
    //     image = "images/plane.png";
    // }

    // var object = new google.maps.Marker({
    //     position:pos,
    //     icon:image,
    //     map:map
    // });

    // this.object = object;

    // var conHtml = "<p>速度："+speed+"</p><p>加速度："+acc+"</p>";
    // var state = new google.maps.InfoWindow({
    //     content:conHtml
    // });
    // google.maps.event.addListener(object, 'click', function() {
    //       state.open(map,object);
    // }); 
    //objectArray.push(this);
}

function createObject(){
    plane = new addObject(dramaId);

    var temp = [];
    for(var i=0;i<drama.length;i++){
        var sel = new Line(-1);
        sel.dramaId = dramaId;
        sel.flightPath = drama[i].flightPath;
        sel.id = drama[i].id;
        sel.objType = drama[i].objType;
        temp.push(sel);
    }
    ++dramaId;
    dramaArray.push(temp);
}

function updateObject(id, type_id, x, y, acc, speed, angle){
//    deleteObject(id);
    var index = getObject(id);
    if(index!=-1){
        var obj = objectArray[index];
        var pos = new google.maps.LatLng(y,x);
        var image;

        var angle = angle*180/Math.PI;
        angle = angle | 0;
        var quot = (angle / 10)|0;
        var remain = angle%10;
        if(remain>=5){
            quot = quot+1;
        }
        angle = quot*10;

        if(type_id==0){
            var image = "images/plane_"+angle+".png";
        }else if(type_id==1){
            image = "images/plane.png";
        }else if(type_id==2){
            image = "images/plane.png";
        }

        obj.object.setPosition(pos);
        obj.object.setIcon(image);
        //objectArray.splice(index,1,obj);
        
    }else{
		plane = new addObject(id);
	}
}

function deleteObject(id){
    var index = getObject(id);
    if(index!=-1){
        var obj = objectArray[index];
        obj.object.setMap(null);
        objectArray.splice(index,1);
    }
}
function clearObject(){
    for(i in objectArray){
        var obj = objectArray[i];
        obj.object.setMap(null);

    }
    object.splice(0,objectArray.length);
}