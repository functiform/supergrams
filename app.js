'use strict';

class App {

	constructor() {
		var that = this;

		var board = new Board(50, 50);
		this.board = board;

		var marquee = new Marquee();
		this.marquee = marquee;

		board.setBoardForPlayerOne(15);

		var canvas = document.getElementById("canvasOne"); this.canvas = canvas;
		var context = canvas.getContext("2d"); this.context = context;

		var validateButton = document.getElementById('validateButton');
		validateButton.addEventListener("click", function(){
			alert(board.validate());
		});

		var shifting = false,
		    marqueeing = false,
		    isDown = false,
		    lastCoords = [-300, -600],
		    startCoords = [0, 0];

		board.setTransX(lastCoords[0]);
		board.setTransY(lastCoords[1]);

		context.setTransform(1, 0, 0, 1, lastCoords[0], lastCoords[1]);

		function mousedown(evt) {
			var bRect = canvas.getBoundingClientRect(),
				mouseX = (evt.clientX - bRect.left) * (canvas.width / bRect.width),
				mouseY = (evt.clientY - bRect.top) * (canvas.height / bRect.height);
			if (board.beginDraggingTile(mouseX, mouseY, evt.shiftKey)) { // TODO: make a check for existence here first
				board.dragSelectedTiles();
				board.setDragVectorStart(mouseX, mouseY);
			} else {
				if (evt.shiftKey) {
					marqueeing = true;
					startCoords = [
						Utils.clamp(evt.offsetX - lastCoords[0], 0, 1500),
						Utils.clamp(evt.offsetY - lastCoords[1], 0, 1500)
					];
					that.marquee.show(startCoords[0], startCoords[1]);
					return;
				}

				if (!board.beginDraggingTile(mouseX, mouseY)) {
					shifting = true;
					startCoords = [
						Utils.clamp(evt.offsetX - lastCoords[0], 0, 1500),
			        	Utils.clamp(evt.offsetY - lastCoords[1], 0, 1500)
					];
				}

			}
		}

		function mouseup(evt) {
			if (shifting) {
				lastCoords = [
					Utils.clamp(evt.offsetX - startCoords[0], -1500, 0),
		    		Utils.clamp(evt.offsetY - startCoords[1], -1500, 0)
		    	];
		    	board.setTransX(lastCoords[0]);
				board.setTransY(lastCoords[1]);
				shifting = false;
			} else if (marqueeing) {
				marqueeing = false;
				marquee.hide();
			} else {
				board.unsetDraggedTiles();
				board.setDragVectorStart(0, 0);
				board.setDragVectorEnd(0, 0);
			}
		}

		function mousemove(evt){
			if (board.isDraggingTile() && !marqueeing) {
				var bRect = canvas.getBoundingClientRect(),
					shapeRad = board.tileSize / 2,
					minX = shapeRad,
					maxX = canvas.width - shapeRad,
					minY = shapeRad,
					maxY = canvas.height - shapeRad,
					mouseX = (evt.clientX - bRect.left) * (canvas.width/bRect.width),
					mouseY = (evt.clientY - bRect.top) * (canvas.height/bRect.height);

				var posX = mouseX;
				posX = Utils.clamp(posX, minX, maxX);
				var posY = mouseY;
				posY = Utils.clamp(posY, minY, maxY);
								
				board.setDragVectorEnd(posX, posY);
			};

			if (shifting) {
				var x = evt.offsetX;
			    var y = evt.offsetY;

				context.setTransform(1, 0, 0, 1, x - startCoords[0], y - startCoords[1]);
			}

			if (marqueeing) {
				var xMin, yMin, xMax, yMax;

				if (marquee.width < 0) {
					xMin = marquee.x + marquee.width;
					xMax = marquee.x;
				} else {
					xMin = marquee.x;
					xMax = marquee.x + marquee.width;
				}

				if (marquee.height < 0) {
					yMin = marquee.y + marquee.height;
					yMax = marquee.y;
				} else {
					yMin = marquee.y;
					yMax = marquee.y + marquee.height;
				}

				marquee.updateSize(evt.offsetX - lastCoords[0], evt.offsetY - lastCoords[1]);
				board.selectTiles(xMin, yMin, xMax, yMax);
			}
		}

		this.canvas.addEventListener("mousedown", mousedown);
		window.addEventListener("mouseup", mouseup);
		window.addEventListener("mousemove", mousemove);
	}

	update() {
		this.board.update();
	}

	draw() {
		var bgColor = "#001a00";
		this.context.fillStyle = bgColor;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.board.draw(this.context);
		this.marquee.draw(this.context);
	}

}

