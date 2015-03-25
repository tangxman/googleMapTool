(function () {
/**
* Converts 'thin', 'medium', and 'thick' to pixel widths
* in an MSIE environment. Not called for other browsers
* because getComputedStyle() returns pixel widths automatically.
* @param {String} widthValue
*/
var toPixels = function (widthValue) {
	var px;
	switch (widthValue) {
		case 'thin':
			px = "2px";
			break;
		case 'medium':
			px = "4px";
			break;
		case 'thick':
			px = "6px";
			break;
		default:
			px = widthValue;
	}
	return px;
};
/**
* Get the widths of the borders of an HTML element.
*
* @param {Object} h HTML element
* @return {Object} widths object (top, bottom left, right)
*/
var getBorderWidths = function (h) {
	var computedStyle;
	var bw = {};
	if (document.defaultView && document.defaultView.getComputedStyle) {
		computedStyle = h.ownerDocument.defaultView.getComputedStyle(h, "");
		if (computedStyle) {
			// The computed styles are always in pixel units (good!)
			bw.top = parseInt(computedStyle.borderTopWidth, 10) || 0;
			bw.bottom = parseInt(computedStyle.borderBottomWidth, 10) || 0;
			bw.left = parseInt(computedStyle.borderLeftWidth, 10) || 0;
			bw.right = parseInt(computedStyle.borderRightWidth, 10) || 0;
			return bw;
		}
	} else if (document.documentElement.currentStyle) { // MSIE
		if (h.currentStyle) {
			// The current styles may not be in pixel units so try to convert (bad!)
			bw.top = parseInt(toPixels(h.currentStyle.borderTopWidth), 10) || 0;
			bw.bottom = parseInt(toPixels(h.currentStyle.borderBottomWidth), 10) || 0;
			bw.left = parseInt(toPixels(h.currentStyle.borderLeftWidth), 10) || 0;
			bw.right = parseInt(toPixels(h.currentStyle.borderRightWidth), 10) || 0;
			return bw;
		}
	}
	// Shouldn't get this far for any modern browser
	bw.top = parseInt(h.style["border-top-width"], 10) || 0;
	bw.bottom = parseInt(h.style["border-bottom-width"], 10) || 0;
	bw.left = parseInt(h.style["border-left-width"], 10) || 0;
	bw.right = parseInt(h.style["border-right-width"], 10) || 0;
	return bw;
};
/**
* Get the position of the mouse relative to the document.
* @param {Object} e Mouse event
* @return {Object} left & top position
*/
var getMousePosition = function (e) {
	var posX = 0, posY = 0;
	e = e || window.event;
	if (typeof e.pageX !== "undefined") {
		posX = e.pageX;
		posY = e.pageY;
	} else if (typeof e.clientX !== "undefined") {
		posX = e.clientX +
		(typeof document.documentElement.scrollLeft !== "undefined" ? document.documentElement.scrollLeft : document.body.scrollLeft);
		posY = e.clientY +
		(typeof document.documentElement.scrollTop !== "undefined" ? document.documentElement.scrollTop : document.body.scrollTop);
	}
	return {
		left: posX,
		top: posY
	};
};
/**
* Get the position of an HTML element relative to the document.
* @param {Object} h HTML element
* @return {Object} left & top position
*/
var getElementPosition = function (h) {
	var posX = h.offsetLeft;
	var posY = h.offsetTop;
	var parent = h.offsetParent;
	// Add offsets for all ancestors in the hierarchy
	while (parent !== null) {
		// Adjust for scrolling elements which may affect the map position.
		//
		// See http://www.howtocreate.co.uk/tutorials/javascript/browserspecific
		//
		// "...make sure that every element [on a Web page] with an overflow
		// of anything other than visible also has a position style set to
		// something other than the default static..."
		if (parent !== document.body && parent !== document.documentElement) {
		posX -= parent.scrollLeft;
		posY -= parent.scrollTop;
		}
		posX += parent.offsetLeft;
		posY += parent.offsetTop;
		parent = parent.offsetParent;
	}
	return {
		left: posX,
		top: posY
	};
};
/**
* Set the properties of an object to those from another object.
* @param {Object} obj target object
* @param {Object} vals source object
*/
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
/**
* Set the opacity. If op is not passed in, this function just performs an MSIE fix.
* @param {Node} div
* @param {Number} op (0-1)
*/
var setOpacity = function (div, op) {
	if (typeof op !== 'undefined') {
		div.style.opacity = op;
	}
	if (typeof div.style.opacity !== 'undefined') {
		div.style.filter = "alpha(opacity=" + (div.style.opacity * 100) + ")";
	}
};

function DragZoom(map, opt_zoomOpts) {
	var ov = new google.maps.OverlayView();
	var me = this;
	ov.onAdd = function () {
		me.init_(map, opt_zoomOpts);
	};
	ov.draw = function () {
	};
	ov.onRemove = function () {
	};
	ov.setMap(map);
	this.prjov_ = ov;
}
/**
* Init the tool.
*/
DragZoom.prototype.init_ = function (map, opt_zoomOpts) {
    this.map_ = map;
	opt_zoomOpts = opt_zoomOpts || {};
	this.borderWidths_ = getBorderWidths(this.map_.getDiv());//Container());
	this.paneDiv_ = document.createElement("div");
	this.paneDiv_.onselectstart = function () {
		return false;
	};
	// default style
	setVals(this.paneDiv_.style, {
		backgroundColor: 'white',
		opacity: 0.0,
		cursor: 'crosshair'
	});
	// allow overwrite
	setVals(this.paneDiv_.style, opt_zoomOpts.paneStyle);
	// stuff that cannot be overwritten
	setVals(this.paneDiv_.style, {
		position: 'absolute',
		overflow: 'hidden',
		zIndex: 10001,
		display: 'none'
	});
	setOpacity(this.paneDiv_);
	// An IE fix: if the background is transparent, it cannot capture mousedown events
	if (this.paneDiv_.style.backgroundColor === 'transparent') {
		this.paneDiv_.style.backgroundColor = 'white';
		setOpacity(this.paneDiv_, 0);
	}
	this.map_.getDiv().appendChild(this.paneDiv_);//Container()
	this.boxDiv_ = document.createElement('div');
	setVals(this.boxDiv_.style, {
		border: 'thin solid #FF0000'
	});
	setVals(this.boxDiv_.style, opt_zoomOpts.boxStyle);
	setVals(this.boxDiv_.style, {
		position: 'absolute',
		display: 'none'
	});
	setOpacity(this.boxDiv_);
	this.map_.getDiv().appendChild(this.boxDiv_);
	this.boxBorderWidths_ = getBorderWidths(this.boxDiv_);
	me = this;
	this.mouseDownListener_ = google.maps.event.addDomListener(this.paneDiv_, 'mousedown', function (e) {
		me.onMouseDown_(e);
	});
	this.mouseDownListenerDocument_ = google.maps.event.addDomListener(document, 'mousedown', function (e) {
		me.onMouseDownDocument_(e);
	});
	this.mouseMoveListener_ = google.maps.event.addDomListener(document, 'mousemove', function (e) {
		me.onMouseMove_(e);
	});
	this.mouseUpListener_ = google.maps.event.addDomListener(document, 'mouseup', function (e) {
		me.onMouseUp_(e);
	});
	this.controlUIDown_ = false;
	this.dragging_ = false;
	this.startPt_ = null;
	this.endPt_ = null;
	this.boxMaxX_ = null;
	this.boxMaxY_ = null;
	this.mousePosn_ = null;
	this.mapPosn_ = getElementPosition(this.map_.getDiv());
	this.mouseDown_ = false;
};
/**
* Checks if the mouse is on top of the map. The position is captured
* in onMouseMove_.
* @return true if mouse is on top of the map div.
*/
DragZoom.prototype.isMouseOnMap_ = function () {
	var mousePos = this.mousePosn_;
	if (mousePos) {
		var mapPos = this.mapPosn_;
		var mapDiv = this.map_.getDiv();
		return mousePos.left > mapPos.left && mousePos.left < mapPos.left + mapDiv.offsetWidth &&
		mousePos.top > mapPos.top && mousePos.top < mapPos.top + mapDiv.offsetHeight;
	} else {
		// if user never moved mouse
		return false;
	}
};
/**
* Show or hide the overlay pane, depending on whether the mouse is over the map.
*/
DragZoom.prototype.setPaneVisibility_ = function () {
	if (this.map_ && this.controlUIDown_ && this.isMouseOnMap_()) {
		var mapDiv = this.map_.getDiv();
		this.paneDiv_.style.left = 0 + 'px';
		this.paneDiv_.style.top = 0 + 'px';
		this.paneDiv_.style.width = mapDiv.offsetWidth - (this.borderWidths_.left + this.borderWidths_.right) + 'px';
		this.paneDiv_.style.height = mapDiv.offsetHeight - (this.borderWidths_.top + this.borderWidths_.bottom) + 'px';
		this.paneDiv_.style.display = 'block';
		this.boxMaxX_ = parseInt(this.paneDiv_.style.width, 10) - (this.boxBorderWidths_.left + this.boxBorderWidths_.right);
		this.boxMaxY_ = parseInt(this.paneDiv_.style.height, 10) - (this.boxBorderWidths_.top + this.boxBorderWidths_.bottom);
	} else {
		this.paneDiv_.style.display = 'none';
	}
};

DragZoom.prototype.onControlUIClick_ = function () {
	if (this.map_ && !this.controlUIDown_) {
		this.controlUIDown_ = true;
		this.setPaneVisibility_();
		/**
		* This event is fired when the ControlUI button is pressed.
		* @name DragZoom#activate
		* @event
		*/
		//google.maps.event.trigger(this, 'activate');
	}else {
		this.controlUIDown_ = false;
		this.dragging_ = false;
		this.boxDiv_.style.display = 'none';
		this.paneDiv_.style.display = "none";
		/**
		* This event is fired while the user release the controlUI
		* @name DragZoom#deactivate
		* @event
		*/
		//google.maps.event.trigger(this, 'deactivate');
	}
};
/**
* Get the <code>google.maps.Point</code> of the mouse position.
* @param {Object} e
* @return {google.maps.Point} point
* @private
*/
DragZoom.prototype.getMousePoint_ = function (e) {
	var mousePosn = getMousePosition(e);
	var p = new google.maps.Point();
	p.x = mousePosn.left - this.mapPosn_.left - this.borderWidths_.left;
	p.y = mousePosn.top - this.mapPosn_.top - this.borderWidths_.top;
	p.x = Math.min(p.x, this.boxMaxX_);
	p.y = Math.min(p.y, this.boxMaxY_);
	p.x = Math.max(p.x, 0);
	p.y = Math.max(p.y, 0);
	return p;
};
/**
* Handle mouse down.
* @param {Event} e
*/
DragZoom.prototype.onMouseDown_ = function (e) {
	if (this.map_ && this.controlUIDown_) {
		this.mapPosn_ = getElementPosition(this.map_.getDiv());
		this.dragging_ = true;
		this.startPt_ = this.endPt_ = this.getMousePoint_(e);
		var prj = this.prjov_.getProjection();
		var latlng = prj.fromContainerPixelToLatLng(this.startPt_);
		/**
		* This event is fired when the drag operation begins.
		* @name DragZoom#dragstart
		* @param {GLatLng} startLatLng
		* @event
		*/
		//google.maps.event.trigger(this, 'dragstart', latlng);
	}
};
/**
* Handle mouse down at the document level.
* @param {Event} e
*/
DragZoom.prototype.onMouseDownDocument_ = function (e) {
	this.mouseDown_ = true;
};
/**
* Handle mouse move.
* @param {Event} e
*/
DragZoom.prototype.onMouseMove_ = function (e) {
	this.mousePosn_ = getMousePosition(e);
	if (this.dragging_) {
		this.endPt_ = this.getMousePoint_(e);
		var left = Math.min(this.startPt_.x, this.endPt_.x);
		var top = Math.min(this.startPt_.y, this.endPt_.y);
		var width = Math.abs(this.startPt_.x - this.endPt_.x);
		var height = Math.abs(this.startPt_.y - this.endPt_.y);
		this.boxDiv_.style.left = left + 'px';
		this.boxDiv_.style.top = top + 'px';
		this.boxDiv_.style.width = width + 'px';
		this.boxDiv_.style.height = height + 'px';
		this.boxDiv_.style.display = 'block';
		/**
		* This event is repeatedly fired while the user drags the box. The southwest and northeast
		* point are passed as parameters of type <code>google.maps.Point</code> (for performance reasons),
		* relative to the map container. Note: the event listener is responsible
		* for converting Pixel to LatLng, if necessary.
		* @name DragZoom#drag
		* @param {google.maps.Point} southwestPixel
		* @param {google.maps.Point} northeastPixel
		* @event
		*/
		//google.maps.event.trigger(this, 'drag', new google.maps.Point(left, top + height), new google.maps.Point(left + width, top));
	} else if (!this.mouseDown_) {
		this.setPaneVisibility_();
	}
};
/**
* Handle mouse up.
* @param {Event} e
*/
DragZoom.prototype.onMouseUp_ = function (e) {
	this.mouseDown_ = false;
	if (this.dragging_) {
		var left = Math.min(this.startPt_.x, this.endPt_.x);
		var top = Math.min(this.startPt_.y, this.endPt_.y);
		var width = Math.abs(this.startPt_.x - this.endPt_.x);
		var height = Math.abs(this.startPt_.y - this.endPt_.y);
		var prj = this.prjov_.getProjection();
		var containerPos = getElementPosition(this.map_.getDiv());
		var mapPanePos = getElementPosition(this.prjov_.getPanes().mapPane);
		left = left + (containerPos.left - mapPanePos.left);
		top = top + (containerPos.top - mapPanePos.top);
		var sw = prj.fromContainerPixelToLatLng(new google.maps.Point(left, top + height));
		var ne = prj.fromContainerPixelToLatLng(new google.maps.Point(left + width, top));
		var bnds = new google.maps.LatLngBounds(sw, ne);
		var center = bnds.getCenter();
		this.controlUIDown_ = false;
		this.dragging_ = false;
		this.boxDiv_.style.display = 'none';
		/**
		* This event is fired when the drag operation ends.
		* Note that the event is not fired if the hot key is released before the drag operation ends.
		* @name DragZoom#dragend
		* @param {GLatLngBounds} newBounds
		* @event
		*/
		this.map_ .setZoom(map.getZoom()+1);
		this.map_ .setCenter(center);
		//google.maps.event.trigger(this, 'dragend', center);
	}
};
/**
* @name google.maps.Map
* @class These are new methods added to the Google Maps API's
* <a href = 'http://code.google.com/apis/maps/documentation/v3/reference.html#Map'>Map</a>
* class.
*/
/**
* Enable drag zoom. The user can zoom to an area of interest by holding down the hot key
* <code>(shift | ctrl | alt )</code> while dragging a box around the area.
* @param {KeyDragZoomOptions} opt_zoomOpts
*/
google.maps.Map.prototype.enableKeyDragZoom = function (opt_zoomOpts) {
	this.dragZoom_ = new DragZoom(this, opt_zoomOpts);
};
/**
* Disable drag zoom.
*/
google.maps.Map.prototype.disableKeyDragZoom = function () {
	var d = this.dragZoom_;
	if (d) {
		alert("disableKeyDragZoom");
		google.maps.event.removeListener(d.mouseDownListener_);
		google.maps.event.removeListener(d.mouseDownListenerDocument_);
		google.maps.event.removeListener(d.mouseMoveListener_);
		google.maps.event.removeListener(d.mouseUpListener_);
		google.maps.event.removeListener(d.controlUIDownListener_);
		google.maps.event.removeListener(d.controlUIUpListener_);
		this.getDiv().removeChild(d.boxDiv_);
		this.getDiv().removeChild(d.paneDiv_);
		this.dragZoom_ = null;
	}
};
/**
* Returns true if the drag zoom feature has been enabled.
* @return {Boolean}
*/
google.maps.Map.prototype.keyDragZoomEnabled = function () {
	return this.dragZoom_ !== null;
};
/**
* Returns the DragZoom object which is created when <code>google.maps.Map.enableKeyDragZoom</code> is called.
* With this object you can use <code>google.maps.event.addListener</code> to attach event listeners
* for the 'activate', 'deactivate', 'dragstart', 'drag', and 'dragend' events.
* @return {DragZoom}
*/
google.maps.Map.prototype.getDragZoomObject = function () {
	return this.dragZoom_;
};
})();

function dragZoomIn()
{
	var dz = map.getDragZoomObject();
	dz.onControlUIClick_();
}