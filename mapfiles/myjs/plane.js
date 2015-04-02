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
    if(id!=-1){
        this.id = id;
        var self = this;
        objectArray.push(self);
        
        google.maps.event.addListenerOnce(map,'click',function(event){
            var object = new google.maps.Marker({
                position:event.latLng,
                icon:"images/plane_90.png",
                map:map
            });
            self.object = object;
        });
    } 
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

function placeLineTarget(trackid,batch,type,type_id){
    var track = getTrack(trackid);
    if(track){
        var targetArray = [];
        var start_point = track.drama[0].flightPath.getPath().getAt(0);
        var offset = batch/2;
        for(var i=0;i<batch;i++){
            plane = new addObject(-1);
            plane.id = GenerateId();
            plane.type = type;
            plane.type_id = type_id;
            plane.object = new google.maps.Marker({
                position: new google.maps.LatLng(start_point.lat()+offset--,start_point.lng()),
                icon:"images/plane_90.png",
                map:map
            });
            objectArray.push(plane);
            targetArray.push(plane);
        }
        track.batch_count = batch;
        track.targetArray = targetArray;
    }

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
    objectArray.splice(0,objectArray.length);
}