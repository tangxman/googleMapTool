(function(){

var markers = new Array();
var identity = 0;

function hasClass(target, name) {
    return target.className.match(new RegExp('(\\s|^)' + name + '(\\s|$)'));
}

function removeClass(target, name) {
    if (hasClass(target, name)) {
        target.className = target.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ');
    }
}

function addClass(target, name) {
    if (!hasClass(target, name)) {
        target.className += " " + name;
    }
}

function MenuControl(map) {
    this.container = document.createElement("div");
    this.coordinate = null;
    this.map = map;
    this.sender = null
    this.isEnable = true;
    this.container.className = "menu_casing";
    this.items = new Array();
    this.init();
    this.hide();
    var self = this;
    google.maps.event.addListener(map, "click", function() {
        self.hide();
    });
    google.maps.event.addListener(map, "movestart", function() {
        self.hide();
    });
    google.maps.event.addListener(map, "zoom_changed", function() {
        self.hide();
    });
    google.maps.event.addListener(map, "dragstart", function() {
        self.hide();
    });
    google.maps.event.addListener(map, "rightclick", function(e) {
        if (this.menu.isEnable) {
            this.menu.coordinate = { point: e.pixel, latlng: e.latLng };
            this.menu.container.style.left = e.pixel.x + "px";
            this.menu.container.style.top = e.pixel.y + "px";
            this.menu.show("map");
        }
    });
    this.container.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.container);
}

MenuControl.prototype.init = function(){
     this.addItem(new MenuItem({ text: "添加标记", icon: "images/marker2.png", groupName: "map", handler: function(coor){
            if (markers.length >= 5) {
                alert("最多能添加5个标记！");
            } else {
                var marker = new google.maps.Marker({ position: coor.latlng, map: map, draggable: true });
                marker.identity = identity++;
                        
                // 添加标记的右击事件，弹出菜单时，IE以外的浏览器会出现偏移
                var rightclick = function(e) {
                    this.sender = marker;
                    if (this.isEnable) {
                        var x = e.pixel.x;
                        var y = e.pixel.y;
                                                
                        if (document.all) {
                            x = window.event.x;
                            y = window.event.y;
                        } else { // 在IE以外的浏览器使用鼠标的x和y坐标弹出菜单时会出现偏移，需要另外计算
                            var eve = window.event;
                            if (!eve) {
                                var c = rightclick;
                                do {
                                    var arg0 = c.arguments[0];
                                    if (arg0) {
                                        if (arg0.constructor == MouseEvent) {
                                            eve = arg0;
                                            break;
                                        }
                                    }
                                    c = c.caller;
                                } while (c.caller)
                            }
                            var scale = Math.pow(2, map.getZoom());
                            var bounds = map.getBounds();
                            var nw = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());
                            var point = map.getProjection().fromLatLngToPoint(nw);
                            var worldCoor = map.getProjection().fromLatLngToPoint(marker.getPosition());
                            var off = new google.maps.Point(Math.floor((worldCoor.x - point.x) * scale), Math.floor((worldCoor.y - point.y) * scale));
                            var markerImg = eve.target.parentNode.parentNode.childNodes[0];
                            x = (off.x - (markerImg.offsetWidth) / 2) + eve.layerX;
                            y = (off.y - markerImg.offsetHeight) + eve.layerY;
                        }

                        this.coordinate = { point: new google.maps.Point(x, y), latlng: coor.latlng };
                        this.container.style.left = x + "px";
                        this.container.style.top = y + "px";
                        this.show("marker");
                    }
                }
                google.maps.event.addListener(marker, "rightclick", rightclick);
                markers.push(marker);
            }
        }
    }));

    this.addItem(new MenuItem({ text: "清除所有标记", groupName: "map", handler: function(coor) {
            if (markers) {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }
                markers.length = 0;
            }
        }
    }));

    this.addSeparator("map");
    this.addItem(new MenuItem({ text: "放大一级", icon: "<%=BaseFile %>/comm/map/google/images/zoomin.png", groupName: "map", handler: function(coor) {
            map.setZoom(map.getZoom() + 1);
        }
    }));
    this.addItem(new MenuItem({ text: "缩小一级", icon: "<%=BaseFile %>/comm/map/google/images/zoomout.png", groupName: "map", handler: function(coor) {
            map.setZoom(map.getZoom() - 1);
        }
    }));

    this.addItem(new MenuItem({ text: "清除该标记", groupName: "marker", handler: function(coor) {
        this.sender.setMap(null);
            markers.remove(this.sender);
        }
    }));

    this.addSeparator("marker");
    this.addItem(new MenuItem({ text: "添加描述", groupName: "marker", handler: function(coor) {
            var marker = this.sender;
            if (!marker.win) {
                this.sender.win = new google.maps.InfoWindow({ content: "<textarea onblur=\"edited(this," + marker.identity + ");\" rows=\"3\" cols=\"22\"></textarea>" });
                google.maps.event.addListener(marker, "click", function() {
                    if (marker.win) marker.win.open(map, marker);
                });
                marker.description = "";
            }
            marker.win.setContent("<textarea onblur=\"edited(this," + marker.identity + ");\" rows=\"3\" cols=\"22\">" + marker.description + "</textarea>")
            marker.win.open(map, marker);
        }
    }));

    this.addItem(new MenuItem({ text: "删除描述", groupName: "marker", handler: function(coor) {
            this.sender.win.close();
            this.sender.win = null;
        }
    }));
};

MenuControl.prototype.show = function(groupName) {
    this.container.style.display = "block";
    if (groupName) {
        for (var i = 0; i < this.items.length; i++) {
            if (groupName == this.items[i].groupName) {
                this.items[i].show();
            } else {
                this.items[i].hide();
            }
        }
    }
};

MenuControl.prototype.hide = function(groupName) {
    this.container.style.display = "none";
    if (groupName) {
        for (var i = 0; i < this.items.length; i++) {
            if (groupName == this.items[i].groupName) {
                this.items[i].hide();
            } else {
                this.items[i].show();
            }
        }
    }
};

MenuControl.prototype.enable = function() {
    this.isEnable = true;
};

MenuControl.prototype.disable = function() {
    this.isEnable = false;
};

MenuControl.prototype.isHide = function() {
    return (this.container.style.display == "none");
};

MenuControl.prototype.addItem = function(item) {
    item.host = this;
    this.items.push(item);
    this.container.appendChild(item.casing);
};

MenuControl.prototype.addSeparator = function(group) {
    var separator = group || new MenuSeparator();
    if (typeof group == "string") {
        separator = new MenuSeparator(group);
    }
    this.items.push(separator);
    this.container.appendChild(separator.casing);
};


function MenuSeparator(groupName) {
    this.groupName = groupName;
    this.casing = document.createElement("div");
    this.casing.className = "menu_separator";
}

MenuSeparator.prototype.show = function() {
    this.casing.style.display = "block";
};

MenuSeparator.prototype.hide = function() {
    this.casing.style.display = "none";
};

function MenuItem(options) {
    options = options || {};
    this.text = options.text || "";
    this.icon = options.icon;
    this.handler = options.handler;
    this.groupName = options.groupName;
    this.host = null; //宿主

    this.casing = document.createElement("div");
    this.casing.className = "menu_item";

    var menu_text = document.createElement("div");
    menu_text.className = "menu_text";
    var text_lable = document.createElement("span");
    text_lable.innerHTML = this.text;
    menu_text.appendChild(text_lable);
    this.casing.appendChild(menu_text);

    var self = this;
    if (this.icon) {
        var item_icon = document.createElement("div");
        item_icon.className = "menu_icon";
        item_icon.style.backgroundImage = "url(" + self.icon + ")";
        self.casing.appendChild(item_icon);
    }

    if (typeof self.handler == "function") {
        google.maps.event.addDomListener(self.casing, "click", function() {
            if (self.host) {
                self.handler(self.host.coordinate);
                self.host.hide();
            }
        });
    }
    google.maps.event.addDomListener(self.casing, "mouseover", function() {
        addClass(self.casing, "item_active");
    });

    google.maps.event.addDomListener(self.casing, "mouseout", function() {
        removeClass(self.casing, "item_active");
    });
}

MenuItem.prototype.show = function() {
    this.casing.style.display = "block";
};

MenuItem.prototype.hide = function() {
    this.casing.style.display = "none";
};

google.maps.Map.prototype.enableRightClickMenu = function(){
    this.menu = new MenuControl(map);
    this.menu.sender = this;
};

})();

