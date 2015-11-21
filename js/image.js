"use strict";

var image = {};

image.init = function() {
	image.cache = {};
	image.loading = {};
  image.readyCalls = [];

	image.load([
			'img/test.png',
			'img/tools.png',
			'img/direction.png',
			'img/collisionTools.png',
			'img/eventTools.png',
			'img/objectTools.png',
			'img/objectDirTools.png'
	]);
};

image.load = function (urlOrArr) {
	if (urlOrArr instanceof Array) {
		urlOrArr.forEach(function(url) {
			image._load(url);
		});
	}
	else {
		image._load(urlOrArr);
	}
};

image._load = function(url) {
	if (image.cache[url]) {
		return image.cache[url];
	}
	else {
		var img = new Image();
		img.onload = function() {
			image.cache[url] = img;

			if (image.isReady()) {
				image.readyCalls.forEach(function(func) {
					func();
				});
			}
		};
		image.cache[url] = false;
		img.src = url;
	}
};

image.get = function(url) {
	return image.cache[url];
};

image.isReady = function() {
	var ready = true;
	for (var k in image.cache) {
		if (image.cache.hasOwnProperty(k) && !image.cache[k]) {
			ready = false;
		}
	}
	return ready;
};

image.onReady = function(func) {
	image.readyCalls.push(func);
};
