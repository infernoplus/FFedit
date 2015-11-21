"use strict";

var input = {};

input.init = function() {
 input.mouse = {pos: {x: 0, y: 0}, btn: {lmb: false, rmb: false, mmb: false}};
 input.keys = [];
 for(var i=0;i<256;i++)
 	input.keys[i] = false;

 document.getElementById('file-input').addEventListener('change', map.open, false);
};

input.onKey = function(evt, state) {
 input.keys[evt.keyCode] = state;
};

input.onMouse = function(evt) {
  var rect = window.display.canvas.getBoundingClientRect();

  var pos = {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
  var mvmnt = {x: input.mouse.pos.x-pos.x, y: input.mouse.pos.y-pos.y};
  input.mouse.pos = pos;


  switch(evt.buttons) {
		case 1 : input.mouse.btn = {lmb: true, rmb: false, mmb: false}; break;
		case 2 : input.mouse.btn = {lmb: false, rmb: true, mmb: false}; break;
		case 4 : input.mouse.btn = {lmb: false, rmb: false, mmb: true}; break;
		default : input.mouse.btn = {lmb: false, rmb: false, mmb: false}; break;
	}

  editor.onMouse(pos, mvmnt, input.mouse.btn.lmb, input.mouse.btn.rmb, input.mouse.btn.mmb);
};

input.getWidthField = function() {
	return parseInt(document.getElementById("width").value);
};

input.getHeightField = function() {
	return parseInt(document.getElementById("height").value);
};

input.editCollision = function() {
	editor.editEvent = false; document.getElementById("event").checked = false;
	editor.editObject = false; document.getElementById("object").checked = false;
	editor.editCollision = document.getElementById("collision").checked;

  input.toolbarToggle();
};

input.editEvent = function() {
	editor.editCollision = false; document.getElementById("collision").checked = false;
	editor.editObject = false; document.getElementById("object").checked = false;
	editor.editEvent = document.getElementById("event").checked;

	input.toolbarToggle();
	editor.redrawEventSelection();
};

input.editObject = function() {
	editor.editEvent = false; document.getElementById("event").checked = false;
	editor.editCollision = false; document.getElementById("collision").checked = false;
	editor.editObject = document.getElementById("object").checked;

	input.toolbarToggle();
	editor.redrawObjectSelection();
};

input.editEventMode = function() {
	var m = document.getElementById("mapEditor");
	var e = document.getElementById("eventEditor");
	var o = document.getElementById("objectEditor");
	m.style.display = 'none';
	e.style.display = 'block';
	o.style.display = 'none';

	editor.redrawEventList();
	editor.redrawObjectList();
};

input.editObjectMode = function() {
	var m = document.getElementById("mapEditor");
	var e = document.getElementById("eventEditor");
	var o = document.getElementById("objectEditor");
	m.style.display = 'none';
	e.style.display = 'none';
	o.style.display = 'block';

	editor.redrawEventList();
	editor.redrawObjectList();
};

input.editMapMode = function() {
	var m = document.getElementById("mapEditor");
	var e = document.getElementById("eventEditor");
	var o = document.getElementById("objectEditor");
	m.style.display = 'block';
	e.style.display = 'none';
	o.style.display = 'none';

	editor.saveEventList();
	editor.saveObjectList();
	editor.redrawEventSelection();
	editor.redrawObjectSelection();
};

input.toolbarToggle = function() {
	var ts = document.getElementById("tileList");
	var es = document.getElementById("eventSelection");
	var os = document.getElementById("objectSelection");

	ts.style.display = !editor.editCollision && !editor.editEvent && !editor.editObject ? 'block' : 'none';
	es.style.display = !editor.editCollision && editor.editEvent && !editor.editObject ? 'block' : 'none';
	os.style.display = !editor.editCollision && !editor.editEvent && editor.editObject ? 'block' : 'none';
};
