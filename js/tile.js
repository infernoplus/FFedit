"use strict";

var tile = {};

tile.init = function() {

	tile.tileSet = window.image.get('img/test.png');
	tile.res = 72;  //Resolution of a single tile
	tile.sheetRes = 936;//Resolution of the full sheet

  tile.container = document.getElementById("tileList");
  tile.container.innerHTML = tile.buildList("img/test.png",tile.res,tile.res,tile.sheetRes);
  tile.selected = 0;
};

tile.buildList = function(src,x,y,size) {
  var width = x*4+16;
  var tonsOfHtml = "<div class='wrapper' style='width:" + width + "px;'>";
  var k = 0;
  for(var i=0;i<size/y;i++) {
    for(var j=0;j<size/x;j++) {
      tonsOfHtml += "<div onclick='window.tile.selectTile(this,"+k+")'class='cell' style='width: " + x + "px; height: " + y + "px;'>" +
                    "<img style='margin-left: -" + j*x + ";margin-top:-" + i*y + "' src='" + src + "' ></img></div>";
      k++;
    }
  }
  tonsOfHtml += "</div>";
  return tonsOfHtml;
};

tile.selectTile = function(element,k) {
  var previousSelected = document.getElementsByClassName('selected');
  for(var i=0;i<previousSelected.length;i++) {
    previousSelected[i].className = 'cell';
  }
  element.className = 'selected';
	tile.selected = k;
};

//Takes the index of a tile and gives the top left corner of it. Tile 0 is 0,0 and tile 1 is 16,0... etc...
tile.getTileByIndex = function(k) {
	for(var i=0;i<(tile.sheetRes/tile.res);i++) {
		for(var j=0;j<(tile.sheetRes/tile.res);j++) {
			if(k === 0)
				return {x: j, y: i};
			k--;
		}
	}
};
