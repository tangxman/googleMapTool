var objectArray = new Array();

var plane;

var getObject = function(id){
    for(i in objectArray){
        if(objectArray[i].id==id){
            return i;
        }
    }
    return -1;
};

var addTargetClickListener = function(target){
    var self = target;
    google.maps.event.addListener(self.object,'click',function(event){
        setSelection(self);
    });
};

var placeLineTarget = function(trackid,batch,type,type_id,delay){
    var get_track;
    if(trackid == -1){
        get_track = track;
    }else{
        get_track = getTrack(trackid);
    }
    if(get_track){
        var targetArray = [];
        var start_point = get_track.drama[0].flightPath.getPath().getAt(0);
        var offset = batch/2;
        for(var i=0;i<batch;i++){
            plane = new Object();
            plane.id = GenerateId();
            plane.type = type;
            plane.type_id = type_id;
            plane.delay = delay;
            plane.property = 'target';

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(start_point.lat()+offset--,start_point.lng()),
                icon:"images/plane_90.png",
                map:map
            });
            plane.object = marker;
            objectArray.push(plane);
            targetArray.push(plane);

            addTargetClickListener(plane);
        }
        get_track.batch_count = batch;
        get_track.targetArray = targetArray;
    }

};

var updateObject = function(id, type_id, x, y, acc, speed, angle){
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
        
    }
};

var deleteObject = function(id){
    if(track){
        var targetArray = track.targetArray;
        for(var j=0,len2=targetArray.length;j<len2;j++){
            if(id == targetArray[j].id){
                var obj = targetArray[j].object;
                obj.setMap(null);                
                track.targetArray.splice(j,1);
                return;
            }
        }
    }
    for(var i=0,len1=dramaArray.length;i<len1;i++){
        var track = dramaArray[i];
        if(track){
            var targetArray = track.targetArray;
            for(var j=0,len2=targetArray.length;j<len2;j++){
                if(id == targetArray[j].id){
                    var obj = targetArray[j].object;
                    obj.setMap(null);                
                    dramaArray[i].targetArray.splice(j,1);
                    return;
                }
            }
        }
    }   
};

var clearObject = function(){
    var m = objectArray.length;
    for(var i = 0;i<m;i++){
        var obj = objectArray[i];
        obj.object.setMap(null);
    }
    objectArray.splice(0,m);
};