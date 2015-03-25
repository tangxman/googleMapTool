// function drawCurLine(Gr,Glat,Glng,degree){
//     var center = new google.maps.LatLng(Glat, Glng); 
// 	 //设置中心和半径
// 	var GArray = new Array();
//     var end = Math.PI*degree/180;
//     var GPoint;
// 	//获取点数组
	
//     if(degree!=360){
//         var bound1 = [
//             center,
//             new google.maps.LatLng(Glat, Glng+2*Gr*Math.cos(0)*1.2)            
//         ];
//         var boundLine1 = new google.maps.Polyline({
//             path: bound1,
//             strokeColor: '#FF0000',
//             strokeOpacity: 1.0,
//             strokeWeight: 2
//         });

//         boundLine1.setMap(map);

//         var bound2 = [
//             center,
//             new google.maps.LatLng(Glat+2*Gr*Math.sin(end), Glng+2*Gr*Math.cos(end)*1.2),            
//         ];

//         var boundLine2 = new google.maps.Polyline({
//             path: bound2,
//             strokeColor: '#FF0000',
//             strokeOpacity: 1.0,
//             strokeWeight: 2
//         }); 
//         boundLine2.setMap(map);
//     }else{
//         for(var i=0;i<end;i=i+0.01)
//         {
//             var lat = Glat+2*Gr*Math.sin(i);
//             var lng = Glng+2*Gr*Math.cos(i)*1.2;
//             GPoint = new google.maps.LatLng(lat,lng);
//             GArray.push(GPoint);
//         }
//     }

// 	//画曲线和圆
// 	var LatLngLine=new google.maps.Polyline({
// 		path:GArray,
// 		strokeColor:"#FF0000",
// 		strokeOpacity:0.8,
// 		strokeWeight:2
// 	});
// 	LatLngLine.setMap(map);//画线
// }

// function drawLine(k) {
// 	var mode;
// 	if(k==1){
// 		//mode = google.maps.drawing.OverlayType.POLYLINE;
//         drawStrLine();
// 	}else if(k==2){
// 		mode = google.maps.drawing.OverlayType.POLYLINE;
// 	}else if(k==3){
		
// 	}else if(k==4){
// 		mode = google.maps.drawing.OverlayType.RECTANGLE;
// 	}else if(k==5){

//     }else if(k==6){
//         mode = google.maps.drawing.OverlayType.CIRCLE;
//     }
//     drawingManager.setDrawingMode(mode);
// }

// function drawStrLine(){		
// 	polyOptions = {   
//             fillOpacity: 0.45,        
//             //strokeColor: 'blue',
// 			strokeOpacity: 1.0,
// 			strokeWeight: 3,
// 			draggable: true                 
//     };			
// 	poly = new google.maps.Polyline(polyOptions);
// 	poly.setMap(map);
// 	// Add a listener	
//     google.maps.event.addListenerOnce(map, 'click', addLatLng);
// 	google.maps.event.addListener(map,'mousemove',delLatLng);				
// 	//必须给poly(线)添加点击事件，否则无法画第二个点(原因：线在地图的上一层，在线上的事件无法传到地图)
// 	google.maps.event.addListenerOnce(poly, 'click', complete);
// 	}

// function delLatLng(event) {//
// 	var path = poly.getPath();
// 	path.pop(); //删除最后一个点
// 	path.push(event.latLng);//附加鼠标当前位置所在点
// }

