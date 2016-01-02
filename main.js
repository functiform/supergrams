'use strict';

window.addEventListener("load", windowLoadHandler, false);

var app;
var updateTimer, drawTimer;

function windowLoadHandler() {
	app = new App();
	updateTimer = setInterval(update, 1000/60);
	drawTimer = setInterval(draw, 1000/60);
}

function update(){
	app.update();
}

function draw(){
	app.draw();
}