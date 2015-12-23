"use strict";

var map = {};

map.init = function() {
	map.evt = []; //Event pallete
	map.obj = []; //Object pallete

	map.size = {x: 128, y: 128}; //Map bounds
	map.data = []; //Map tile data
  map.objData = []; //Object data

	for(var i=0;i<map.size.x;i++) {
		map.data.push([]);
		for(var j=0;j<map.size.y;j++) {
		  map.data[i].push({x:i, y:j, tile: 0, r:0, c:false, evt: []});
		}
	}
};

map.resize = function(x,y) {
	//Expand
	if(x > map.size.x) {
		var k = x-map.size.x;
		for(var i=0;i<k;i++) {
			var nurow = [];
			for(var j=0;j<map.size.y;j++) {
				nurow.push({x:i+map.size.x, y:j, tile: 0, r:0, c:false, evt: []});
			}
			map.data.push(nurow);
		}
		map.size.x = x;
	}
	//Truncate
	if(x < map.size.x) {
		map.data.splice(x, map.size.x-x);
		map.size.x = x;
	}
	//Expand
	if(y > map.size.y) {
		var k = y-map.size.y;
		for(var i=0;i<map.data.length;i++) {
			for(var j=0;j<k;j++) {
				map.data[i].push({x:j+map.size.y, y:i, tile: 0, r:0, c:false, evt: []});
			}
		}
		map.size.y = y;
	}
	//Truncate
	if(y < map.size.y) {
		for(var i=0;i<map.data.length;i++) {
			map.data[i].splice(y,map.size.y-y);
		}
		map.size.y = y;
	}
	//Delete OOB objects
	for(var i=0;i<map.objData.length;i++) {
		if(!map.inBounds({x: map.objData[i].x, y: map.objData[i].y})) {
			map.objData.splice(i,1);
			i--;
		}
	}
};

map.open = function(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  map.file = undefined;
  var reader = new FileReader();
  reader.onload = function(e) {
    var r = e.target.result;
		map.file = r;
  };
  reader.readAsText(file);

  //Recursive timeout
  var opened = function() {
		if(map.file === undefined) {
			setTimeout(function() { opened(); }, 500);
		}
	  else {
			//GOTCHA!
			map.load(map.file);
			map.file = undefined;
		}
	};

	opened();
};

map.load = function(file) {
	map.size = {};
	map.data = [];
	map.evt = [];
	map.obj = [];
	map.objData = [];

	var ary = file.split("\n");
	var k = 0; //Line number

  //Parse evt palette
	var evtHeader = parseInt(ary[k++]);
	for(var i=0;i<evtHeader;i++) {
		var evt = ary[k++].split(",");
		map.evt.push({id: evt[0], name: evt[1], type: evt[2], color: evt[3]});
	}

	//Parse obj palette
	var objHeader = parseInt(ary[k++]);
	for(var i=0;i<objHeader;i++) {
		var obj = ary[k++].split(",");
		map.obj.push({
			id: obj[0],
			name: obj[1],
			color: obj[2],
			sym: obj[3],
			type: obj[4],
			dname: obj[5],
			variant: parseInt(obj[6]),
			lvl: parseInt(obj[7]),
			team: parseInt(obj[8]),
			faction: parseInt(obj[9]),
			aiWorld: obj[10],
			aiBattle: obj[11],
			func: obj[12]
			});
	}

	//Parse tile data
	var tileHeader = ary[k++].split(",");
	map.size = {x: parseInt(tileHeader[0]), y: parseInt(tileHeader[1])};
	for(var i=0;i<map.size.x;i++) {
			map.data.push(new Array(map.size.y));
  }
	for(var j=0;j<map.size.y;j++) {
		for(var i=0;i<map.size.x;i++) {
			var line = ary[k++];
			var tile = line.split(",");
			var evt = line.split("[")[1].split("]")[0].split(",");
			map.data[i][j] = {x: i, y: j, tile: parseInt(tile[0]), r: parseInt(tile[1]), c: tile[2] === "true" ? true : false, evt: evt[0] !== "" ? evt : []};
		}
	}

	//Parse obj data
	var objDataHeader = parseInt(ary[k++]);
	for(var i=0;i<objDataHeader;i++) {
		var objData = ary[k++].split(",");
		map.objData.push({id: objData[0], x: parseInt(objData[1]), y: parseInt(objData[2]), r: parseInt(objData[3]), sid: objData[4]});
	}
}

map.save = function() {
	//Compile evt palette
	var out = map.evt.length + "\n";
	for(var i=0;i<map.evt.length;i++) {
		out += map.evt[i].id + "," + map.evt[i].name + "," + map.evt[i].type + "," + map.evt[i].color + "\n";
	}

	//Compile obj palette
	out += map.obj.length + "\n";
	for(var i=0;i<map.obj.length;i++) {
		out += map.obj[i].id + "," + map.obj[i].name + "," + map.obj[i].color + "," + map.obj[i].sym + ","
		    +  map.obj[i].type + "," +  map.obj[i].dname + "," + map.obj[i].variant + "," + map.obj[i].lvl + "," + map.obj[i].team + ","
		    +  map.obj[i].faction + "," + map.obj[i].aiWorld + "," + map.obj[i].aiBattle + "," + map.obj[i].func + "\n";
	}

	//Compile map tile data
	out += map.size.x + "," + map.size.y + "\n";
	for(var j=0;j<map.size.y;j++) {
		for(var i=0;i<map.size.x;i++) {
			var t = map.data[i][j];

			var evt;
			evt = "[";
			for(var k=0;k<t.evt.length;k++) {
				evt += t.evt[k];
				if(k<t.evt.length-1)
					evt += ",";
			}
			evt += "]";

			out += t.tile + "," + t.r + "," + t.c + "," + evt + "\n";
		}
	}

	//Compile map obj data
	out += map.objData.length + "\n";
	for(var i=0;i<map.objData.length;i++) {
		out += map.objData[i].id + "," + map.objData[i].x + "," + map.objData[i].y + "," + map.objData[i].r + "," + map.objData[i].sid + "\n";
	}

	//Write to file
	var data = new Blob([out], {type: 'text/plain'});

	var textFile;

	// If we are replacing a previously generated file we need to
	// manually revoke the object URL to avoid memory leaks.
	if (textFile !== null) {
		window.URL.revokeObjectURL(textFile);
	}

	textFile = window.URL.createObjectURL(data);

	// returns a URL you can use as a href
	window.open(textFile);
};

//Checks to see if point a {x,y} is within the bounds of the map. Returns true or false.
map.inBounds = function(a) {
	if(a === undefined)
		return false;
	return !(a.x < 0 || a.x > map.size.x-1 || a.y < 0 || a.y > map.size.y-1);
};
