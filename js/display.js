"use strict";

var display = {};

display.init = function() {
 display.canvas = document.getElementById("display");
 display.context = display.canvas.getContext("2d");
 document.oncontextmenu = function (e) {
     e.preventDefault();
 };

 display.width = display.canvas.width;
 display.height = display.canvas.height;

 display.offset = {x: 0, y: 0}; //Screen position offset from default at top left
 display.scale = 16; //Drawing scale
};

display.draw = function() {
 display.update();

 display.clear();
 display.drawMap();
 editor.draw();
};

display.update = function() {
 display.canvas.width = window.innerWidth-42-342; //border offset - toolbar offset
 display.canvas.height = window.innerHeight-42;

 display.width = display.canvas.width;
 display.height = display.canvas.height;
};

display.clear = function() {
 display.context.fillStyle = "#000000";
 display.context.fillRect(0,0,display.width,display.height);
};

display.drawMap = function() {

	//Screenspace bounds
	var horiz = display.width/display.scale;
	var vert = display.height/display.scale;

 //Calculate the part of the map that occupies the current screen space (view frustrum culling)
 var ss = {
	x1: Math.floor((display.offset.x/display.scale)),
	y1: Math.floor((display.offset.y/display.scale)),
	x2: Math.floor((display.offset.x/display.scale)+(horiz+display.scale)),
	y2: Math.floor((display.offset.y/display.scale)+(vert+display.scale))
 };

 //Loop through map data and draw
 for(var i=ss.x1>0?ss.x1:0;i<window.map.size.x&&i<ss.x2;i++) {
  for(var j=ss.y1>0?ss.y1:0;j<window.map.size.y&&j<ss.y2;j++) {
		var tileOffset = tile.getTileByIndex(map.data[i][j].tile);
		//Save the context state
		display.context.save();

		//Translate and rotate
		display.context.translate((i*display.scale)-display.offset.x, (j*display.scale)-display.offset.y);
		switch(map.data[i][j].r) {
	  	case 0 : display.context.rotate(0*Math.PI/180); break;
	  	case 1 : display.context.rotate(90*Math.PI/180); break;
	  	case 2 : display.context.rotate(180*Math.PI/180); break;
	  	case 3 : display.context.rotate(270*Math.PI/180); break;
		}

		//Draw tile
  	display.context.drawImage(window.tile.tileSet, tileOffset.x*tile.res, tileOffset.y*tile.res, tile.res, tile.res, -(display.scale/2), -(display.scale/2), display.scale, display.scale);

    //Draw Collision if collision mode is active
  	if(map.data[i][j].c && editor.editCollision) {
			display.context.fillStyle = "#0000FF";
			display.context.fillRect(-(display.scale/2), -(display.scale/2), display.scale, display.scale);
		}

		//Draw event if event mode is active
  	if(editor.editEvent && editor.selectedEvent !== undefined) {
			for(var k=0;k<map.data[i][j].evt.length;k++) {
				if(map.data[i][j].evt[k] === editor.selectedEvent.id) {
					display.context.fillStyle = editor.selectedEvent.color;
					display.context.fillRect(-(display.scale/2), -(display.scale/2), display.scale, display.scale);
				}
			}
		}

    //Draw Collision if collision mode is active
  	if(map.data[i][j].c && editor.editCollision) {
			display.context.fillStyle = "#0000FF";
			display.context.fillRect(-(display.scale/2), -(display.scale/2), display.scale, display.scale);
		}

		//Reset context state
  	display.context.restore();
  }
 }

  //Draw objects if object mode is active
 if(editor.editObject) {
	 for(var i=0;i<map.objData.length;i++) {
		var obj = editor.getObjectById(map.objData[i].id);
		display.context.fillStyle = obj.color;
		display.context.font = "10px Lucida Console";
		display.context.fillText(obj.sym,(map.objData[i].x*display.scale)-display.offset.x-(display.scale/2),(map.objData[i].y*display.scale)-display.offset.y);
	}
 }
};
