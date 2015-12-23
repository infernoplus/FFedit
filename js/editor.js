"use strict";

var editor = {};

editor.init = function() {
	//Tool IDs:
	//0 - paint
	//1 - select or erase (tool context)
	//2 - fill
	editor.tool = 0; editor.direction = 0;
	editor.release = true; //Don't allow multiple fills during held click
	editor.rPush = false;
	editor.editCollision = false;
	editor.editEvent = false;
	editor.editObject = false;

	editor.selectedEvent = undefined;
	editor.selectObject = undefined;

	editor.toolIcons = window.image.get('img/tools.png');
	editor.dirIcons = window.image.get('img/direction.png');
	editor.collisionIcons = window.image.get('img/collisionTools.png');
	editor.eventIcons = window.image.get('img/eventTools.png');
	editor.objectIcons = window.image.get('img/objectTools.png');
	editor.objectDirIcons = window.image.get('img/objectDirTools.png');
};

editor.step = function() {
	if(input.keys[81])
		editor.tool = 0;
  else if(input.keys[69])
    editor.tool = 1;
  else if(input.keys[70])
    editor.tool = 2;

  //EVT and OBJ mode only have 2 tools so just a simple hack to avoid weird problems.
  if(editor.tool === 2 && (editor.editEvent || editor.editObject))
  	editor.tool = 0;

  if(input.keys[82] && !editor.rPush) {
		editor.direction = editor.direction > 2 ? 0 : editor.direction+1;
		editor.rPush = true;
	}
	else if(!input.keys[82] && editor.rPush) {
		editor.rPush = false;
	}
};

//Draws the current tool/settings in top right corner.
editor.draw = function() {
  if(editor.editCollision) {
		display.context.drawImage(editor.collisionIcons, (editor.tool*tile.res), 0, tile.res, tile.res, display.width-tile.res, 0, tile.res, tile.res);
	}
  else if(editor.editEvent) {
		display.context.drawImage(editor.eventIcons, (editor.tool*tile.res), 0, tile.res, tile.res, display.width-tile.res, 0, tile.res, tile.res);
	}
  else if(editor.editObject) {
		display.context.drawImage(editor.objectIcons, (editor.tool*tile.res), 0, tile.res, tile.res, display.width-tile.res, 0, tile.res, tile.res);
		display.context.drawImage(editor.objectDirIcons, (editor.direction*tile.res), 0, tile.res, tile.res, display.width-(tile.res*2), 0, tile.res, tile.res);
	}
	else {
		display.context.drawImage(editor.toolIcons, (editor.tool*tile.res), 0, tile.res, tile.res, display.width-tile.res, 0, tile.res, tile.res);
		display.context.drawImage(editor.dirIcons, (editor.direction*tile.res), 0, tile.res, tile.res, display.width-(tile.res*2), 0, tile.res, tile.res);
  }
};

editor.resizeMap = function() {
	window.map.resize(window.input.getWidthField(),window.input.getHeightField());
};


editor.onMouse = function(pos,mvmnt,lmb,rmb,mmb) {
 if(lmb === true && editor.editCollision) {
  switch(editor.tool) {
		case 0 : editor.paintCollision(pos,mvmnt,lmb,rmb,mmb); break;
		case 1 : editor.eraseCollision(pos,mvmnt,lmb,rmb,mmb); break;
		case 2 : if(editor.release) { editor.fillCollision(pos,mvmnt,lmb,rmb,mmb); } break;
 	}
 }
 else if(lmb === true && editor.editEvent) {
  switch(editor.tool) {
		case 0 : editor.paintEvent(pos,mvmnt,lmb,rmb,mmb); break;
		case 1 : editor.eraseEvent(pos,mvmnt,lmb,rmb,mmb); break;
 	}
 }
 else if(lmb === true && editor.editObject) {
  switch(editor.tool) {
		case 0 : editor.paintObject(pos,mvmnt,lmb,rmb,mmb); break;
		case 1 : editor.eraseObject(pos,mvmnt,lmb,rmb,mmb); break;
 	}
 }
 else if(lmb === true){
  switch(editor.tool) {
		case 0 : editor.paint(pos,mvmnt,lmb,rmb,mmb); break;
		case 1 : editor.select(pos,mvmnt,lmb,rmb,mmb); break;
		case 2 : if(editor.release) { editor.fill(pos,mvmnt,lmb,rmb,mmb); } break;
 	}
 }

 if(rmb && !input.keys[16]) {
	display.offset = {x: display.offset.x+mvmnt.x, y: display.offset.y+mvmnt.y};
 }
 if(rmb && input.keys[16]) {
	var directionality = mvmnt.x + mvmnt.y > 0 ? -1 : 1; //Wordified
	display.scale = display.scale + (directionality * Math.sqrt((mvmnt.x*mvmnt.x) + (mvmnt.y*mvmnt.y)) * 0.025);
	if(display.scale > 64)
		display.scale = 64;
  if(display.scale < 3)
  	display.scale = 3;
 }
 if(lmb === true) {
	 editor.release = false;
 }
 if(lmb === false)
   editor.release = true;
};

/** ====================== TILE TOOLS ====================== **/

editor.paint = function(pos,mvmnt,lmb,rmb,mmb) {
	var res = editor.getTileByRelativeCoords(pos);
	if(map.inBounds(res)) {
		map.data[res.x][res.y].tile = tile.selected;
		map.data[res.x][res.y].r = editor.direction;
	}
};

editor.select = function(pos,mvmnt,lmb,rmb,mmb) {
	var res = editor.getTileByRelativeCoords(pos);
	if(map.inBounds(res)) {
		tile.selected = map.data[res.x][res.y].tile;
		editor.tool = 0;
	}
};

editor.fill = function(pos,mvmnt,lmb,rmb,mmb) {
	var res = editor.getTileByRelativeCoords(pos);
	var otid = res.tile;

	if(tile.selected === res.tile)
		return;

	var ary = [res];
	var updts = 1;
	var max = 0;
	while(updts > 0 && max < 32) {
		var s = ary.length;
		max++;
		for(var i=0;i<s;i++) {
			var t = ary[i];
			if(map.inBounds({x: t.x, y: t.y+1})) {
				if(map.data[t.x][t.y+1].tile == otid) {
					map.data[t.x][t.y+1].tile = tile.selected;
					updts++;
					ary.push(map.data[t.x][t.y+1]);
				}
			}
			if(map.inBounds({x: t.x, y: t.y-1})) {
				if(map.data[t.x][t.y-1].tile == otid) {
					map.data[t.x][t.y-1].tile = tile.selected;
					updts++;
					ary.push(map.data[t.x][t.y-1]);
				}
			}
			if(map.inBounds({x: t.x+1, y: t.y})) {
				if(map.data[t.x+1][t.y].tile == otid) {
					map.data[t.x+1][t.y].tile = tile.selected;
					updts++;
					ary.push(map.data[t.x+1][t.y]);
				}
			}
			if(map.inBounds({x: t.x-1, y: t.y})) {
				if(map.data[t.x-1][t.y].tile == otid) {
					map.data[t.x-1][t.y].tile = tile.selected;
					updts++;
					ary.push(map.data[t.x-1][t.y]);
				}
			}
		}
	}
};

/** ====================== COLLISION TOOLS ====================== **/

editor.paintCollision = function(pos,mvmnt,lmb,rmb,mmb) {
	var res = editor.getTileByRelativeCoords(pos);
	if(map.inBounds(res)) {
		map.data[res.x][res.y].c = true;
	}
};

editor.eraseCollision = function(pos,mvmnt,lmb,rmb,mmb) {
	var res = editor.getTileByRelativeCoords(pos);
	if(map.inBounds(res)) {
		map.data[res.x][res.y].c = false;
	}
};

editor.fillCollision = function(pos,mvmnt,lmb,rmb,mmb) {
	var res = editor.getTileByRelativeCoords(pos);
	var otid = res.c;

	var ary = [res];
	var updts = 1;
	var max = 0;
	while(updts > 0 && max < 32) {
		var s = ary.length;
		max++;
		for(var i=0;i<s;i++) {
			var t = ary[i];
			if(map.inBounds({x: t.x, y: t.y+1})) {
				if(map.data[t.x][t.y+1].c == otid) {
					map.data[t.x][t.y+1].c = !otid;
					updts++;
					ary.push(map.data[t.x][t.y+1]);
				}
			}
			if(map.inBounds({x: t.x, y: t.y-1})) {
				if(map.data[t.x][t.y-1].c == otid) {
					map.data[t.x][t.y-1].c = !otid;
					updts++;
					ary.push(map.data[t.x][t.y-1]);
				}
			}
			if(map.inBounds({x: t.x+1, y: t.y})) {
				if(map.data[t.x+1][t.y].c == otid) {
					map.data[t.x+1][t.y].c = !otid;
					updts++;
					ary.push(map.data[t.x+1][t.y]);
				}
			}
			if(map.inBounds({x: t.x-1, y: t.y})) {
				if(map.data[t.x-1][t.y].c == otid) {
					map.data[t.x-1][t.y].c = !otid;
					updts++;
					ary.push(map.data[t.x-1][t.y]);
				}
			}
		}
	}
};

/** ====================== EVENT TOOLS ====================== **/

editor.paintEvent = function(pos,mvmnt,lmb,rmb,mmb) {
	if(editor.selectedEvent === undefined)
		return;
	var res = editor.getTileByRelativeCoords(pos);
	if(map.inBounds(res)) {
		for(var i=0;i<map.data[res.x][res.y].evt.length;i++) {
			if(map.data[res.x][res.y].evt[i] === editor.selectedEvent.id) {
			  return;
			}
		}
		map.data[res.x][res.y].evt.push(editor.selectedEvent.id);
	}
};

editor.eraseEvent = function(pos,mvmnt,lmb,rmb,mmb) {
	var res = editor.getTileByRelativeCoords(pos);
	if(map.inBounds(res)) {
		for(var i=0;i<map.data[res.x][res.y].evt.length;i++) {
			if(map.data[res.x][res.y].evt[i] === editor.selectedEvent.id) {
				map.data[res.x][res.y].evt.splice(i,1);
			}
		}
	}
};

/** ====================== OBJECT TOOLS ====================== **/

editor.paintObject = function(pos,mvmnt,lmb,rmb,mmb) {
	if(editor.selectedObject === undefined)
		return;
	var res = editor.getTileByRelativeCoords(pos);
	if(map.inBounds(res)) {
		for(var i=0;i<map.objData.length;i++) {
			if(map.objData[i].x === res.x && map.objData[i].y === res.y) {
				return;
			}
		}
		map.objData.push({x: res.x, y: res.y, r: editor.direction, id: editor.selectedObject.id, sid: editor.generateId()});
	}
};

editor.eraseObject = function(pos,mvmnt,lmb,rmb,mmb) {
	var res = editor.getTileByRelativeCoords(pos);
	if(map.inBounds(res)) {
		for(var i=0;i<map.objData.length;i++) {
			if(map.objData[i].x === res.x && map.objData[i].y === res.y) {
				map.objData.splice(i,1);
			}
		}
	}
};

/** ====================== EVENT EDITOR UI ====================== **/

editor.saveEventList = function() {
	for(var i=0;i<map.evt.length;i++) {
		var id = document.getElementById("_evtid"+i);
		var name = document.getElementById("_evtname"+i);
		var type = document.getElementById("_evttype"+i);
		var color = document.getElementById("_evtcolor"+i);
	  map.evt[i] = {id: id.value, name: name.value, type: type.value, color: color.value};
	}
};

editor.addEventList = function() {
	editor.saveEventList();
	map.evt.push({id: editor.generateId(), name: "evt_" + parseInt(Math.random()*1000), type: 0, color: "#000000"});
	editor.redrawEventList();
};

editor.redrawEventList = function() {
	var e = document.getElementById("eventList");
	var gen = "";
	for(var i=0;i<map.evt.length;i++) {
		gen += "<div>"
		    +  "ID/<input type='text' value='" + map.evt[i].id + "' id='_evtid"+i+"' style='width: 240px' disabled/> "
		    +  "NAME/<input type='text' value='" + map.evt[i].name + "' id='_evtname"+i+"' style='width: 120px'/> "
		    +  "TYPE/<input type='text' value='" + map.evt[i].type + "' id='_evttype"+i+"' style='width: 30px'/> "
		    +  "COLOR/<input type='text' value='" + map.evt[i].color + "' id='_evtcolor"+i+"' style='width: 60px'/> "
		    +  "<button onclick='editor.deleteEvent(\""+map.evt[i].id+"\")'>DELETE</button>"
		    +  "</div>";
	}
	e.innerHTML = gen;
};

editor.redrawEventSelection = function() {
	var e = document.getElementById("eventSelection");
	var gen = "";
	for(var i=0;i<map.evt.length;i++) {
		gen += "<div class='selectionList' style='color: "+map.evt[i].color+"; border-color: "+map.evt[i].color+"' onclick='editor.selectedEvent=map.evt["+i+"];'> "
		    +  map.evt[i].name
		    +  "</div>";
	}
	e.innerHTML = gen;
};

editor.deleteEvent = function(id) {
	editor.selectedEvent = undefined;
  editor.saveEventList();
	for(var i=0;i<map.size.x;i++) {
		for(var j=0;j<map.size.y;j++) {
			for(var k=0;k<map.data[i][j].evt.length;k++) {
				if(map.data[i][j].evt[k] === id) {
					map.data[i][j].evt.splice(k,1);
				}
			}
		}
	}
	for(var i=0;i<map.evt.length;i++) {
		if(map.evt[i].id === id) {
			map.evt.splice(i,1);
			break; // I would have put a lenny face here but the encoding on this file won't allow it...
		}
	}
  editor.redrawEventList();
};

editor.getEventById = function(id) {
	for(var i=0;i<map.evt.length;i++) {
		if(map.evt[i].id === id) {
			return map.evt[i];
		}
	}
};

/** ====================== OBJECT EDITOR UI ====================== **/

editor.saveObjectList = function() {
	for(var i=0;i<map.obj.length;i++) {
		var id = document.getElementById("_objid"+i);
		var name = document.getElementById("_objname"+i);
		var color = document.getElementById("_objcolor"+i);
	  var sym = document.getElementById("_objsym"+i);
	  var type = document.getElementById("_objtype"+i);
	  var dname = document.getElementById("_objdname"+i);
	  var variant = document.getElementById("_objvariant"+i);
	  var lvl = document.getElementById("_objlvl"+i);
	  var team = document.getElementById("_objteam"+i);
	  var faction = document.getElementById("_objfaction"+i);
	  var aiWorld = document.getElementById("_objaiworld"+i);
	  var aiBattle = document.getElementById("_objaibattle"+i);
	  var func = document.getElementById("_objfunc"+i);
	  map.obj[i] = {
			id: id.value,
			name: name.value,
			color: color.value,
			sym: sym.value,
			type: type.value,
			dname: dname.value,
			variant: variant.value,
			lvl: lvl.value,
			team: team.value,
			faction: faction.value,
			aiWorld: aiWorld.value,
			aiBattle: aiBattle.value,
			func: func.value
		};
	}
};

editor.addObjectList = function() {
	editor.saveObjectList();
	map.obj.push({
		id: editor.generateId(),
		name: "obj_" + parseInt(Math.random()*1000),
		color: "#000000",
		sym: "X",
		type: "npc.default",
		dname: "Default Object",
		variant: 0,
		lvl: 1,
		team: 0,
		faction: 1,
		aiWorld: "none",
		aiBattle: "none",
		func: "none"
	});
	editor.redrawObjectList();
};

editor.redrawObjectList = function() {
	var e = document.getElementById("objectList");
	var gen = "";
	for(var i=0;i<map.obj.length;i++) {
		gen += "<div style='background-color: #CCCCCC; border-style: solid; border-color: #000000; border-width: 2px; padding: 3px; margin-bottom: 6px; margin-top: 6px'>"
		    +  "ID/<input type='text' value='" + map.obj[i].id + "' id='_objid"+i+"' style='width: 240px' disabled/> "
		    +  "NAME/<input type='text' value='" + map.obj[i].name + "' id='_objname"+i+"' style='width: 120px'/> "
		    +  "COLOR/<input type='text' value='" + map.obj[i].color + "' id='_objcolor"+i+"' style='width: 60px'/> "
		    +  "SYM/<input type='text' value='" + map.obj[i].sym + "' id='_objsym"+i+"' style='width: 30px'/> "
		    +  "<button onclick='editor.deleteObject(\""+map.obj[i].id+"\")'>DELETE</button>"
		    +  "<div style='border-bottom-style: double; border-bottom-color= #000000; border-bottom-width: 3px; padding-top: 1px; padding-bottom: 1px'></div>"
		    +  "TYPE/<input type='text' value='" + map.obj[i].type + "' id='_objtype"+i+"' style='width: 120px'/> "
		    +  "DNAME/<input type='text' value='" + map.obj[i].dname + "' id='_objdname"+i+"' style='width: 120px'/> "
		    +  "VAR/<input type='text' value='" + map.obj[i].variant + "' id='_objvariant"+i+"' style='width: 20px'/> "
		    +  "LVL/<input type='text' value='" + map.obj[i].lvl + "' id='_objlvl"+i+"' style='width: 20px'/> "
		    +  "TEAM/<input type='text' value='" + map.obj[i].team + "' id='_objteam"+i+"' style='width: 20px'/> "
		    +  "FAC/<input type='text' value='" + map.obj[i].faction + "' id='_objfaction"+i+"' style='width: 20px'/> "
		    +  "AIW/<input type='text' value='" + map.obj[i].aiWorld + "' id='_objaiworld"+i+"' style='width: 120px'/> "
		    +  "AIB/<input type='text' value='" + map.obj[i].aiBattle + "' id='_objaibattle"+i+"' style='width: 120px'/> "
		    +  "FUNC/<input type='text' value='" + map.obj[i].func + "' id='_objfunc"+i+"' style='width: 180px'/> "
		    +  "</div>";
	}
	e.innerHTML = gen;
};

editor.redrawObjectSelection = function() {
	var e = document.getElementById("objectSelection");
	var gen = "";
	for(var i=0;i<map.obj.length;i++) {
		gen += "<div class='selectionList' style='color: "+map.obj[i].color+"; border-color: "+map.obj[i].color+"' onclick='editor.selectedObject=map.obj["+i+"];'> "
		    +  "<span style='float: left'>" + map.obj[i].sym + "</span><span style='float: right'>" + map.obj[i].name + "</span>"
		    +  "</div>";
	}
	e.innerHTML = gen;
};

editor.deleteObject = function(id) {
	editor.selectObject = undefined;
  editor.saveObjectList();
	for(var i=0;i<map.objData.length;i++) {
		if(map.objData[i].id === id) {
			map.objData.splice(i,1);
			i--;
		}
	}
	for(var i=0;i<map.obj.length;i++) {
		if(map.obj[i].id === id) {
			map.obj.splice(i,1);
			break; // ing all the rules!
		}
	}
  editor.redrawObjectList();
};

editor.getObjectById = function(id) {
	for(var i=0;i<map.obj.length;i++) {
		if(map.obj[i].id === id) {
			return map.obj[i];
		}
	}
};


/** ====================== UTIL ====================== **/

//Generates a UUID for use with evt and obj palette.
editor.generateId = function() {
	return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = crypto.getRandomValues(new Uint8Array(1))[0]%16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
	});
};

//Takes a screen relative point {x, y} and returns the tile {x, y} that is on.
editor.getTileByRelativeCoords = function(p) {
	var x = Math.floor((p.x+display.offset.x+(display.scale/2))/display.scale);
	var y = Math.floor((p.y+display.offset.y+(display.scale/2))/display.scale);
	if(!map.inBounds({x: x, y: y}))
		return undefined;
	return map.data[x][y];
}