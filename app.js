'use strict';

class App {

	constructor() {
		var that = this;

		var board = new Board(50, 50); 
		this.board = board;
		board.setBoardForPlayerOne(15);

		var canvas = document.getElementById("canvasOne"); this.canvas = canvas;
		var context = canvas.getContext("2d"); this.context = context;
		
		var validateButton = document.getElementById('validateButton');
		validateButton.addEventListener("click", function(){
			alert(board.validate());
		});

		var shifting = false,
			isDown = false,
			lastCoords = [-300, -600],
			startCoords = [0, 0];

		board.setTransX(lastCoords[0]);
		board.setTransY(lastCoords[1]);

		context.setTransform(1, 0, 0, 1, lastCoords[0], lastCoords[1]);

		var clamp = function(num, min, max) {
			return (num < min) ? min : ((num > max) ? max : num);
		};

		function mousedown(evt) {
			var bRect = canvas.getBoundingClientRect(),
				mouseX = (evt.clientX - bRect.left) * (canvas.width / bRect.width),
				mouseY = (evt.clientY - bRect.top) * (canvas.height / bRect.height);

			if (!board.beginDraggingTile(mouseX, mouseY)) {
				shifting = true;
				startCoords = [
					clamp(evt.offsetX - lastCoords[0], 0, 1500),
		        	clamp(evt.offsetY - lastCoords[1], 0, 1500)
				];
			}
		}

		function mouseup(evt) {
			if (shifting) {
				lastCoords = [
					clamp(evt.offsetX - startCoords[0], -1500, 0),
		        	clamp(evt.offsetY - startCoords[1], -1500, 0)
		        ];
		        board.setTransX(lastCoords[0]);
				board.setTransY(lastCoords[1]);
				shifting = false;
			} else {
				board.unsetDraggedTile();
			}
		}
		
		function mousemove(evt){ 
			if (board.isDraggingTile()) {
				var bRect = canvas.getBoundingClientRect(),
					shapeRad = board.tileSize / 2,
					minX = shapeRad,
					maxX = canvas.width - shapeRad,
					minY = shapeRad,
					maxY = canvas.height - shapeRad,
					mouseX = (evt.clientX - bRect.left) * (canvas.width/bRect.width),
					mouseY = (evt.clientY - bRect.top) * (canvas.height/bRect.height);
		
				var posX = mouseX;
				posX = clamp(posX, minX, maxX);
				var posY = mouseY;
				posY = clamp(posY, minY, maxY);
				
				board.draggedTile.setTarget(posX, posY);
			};

			if (shifting) {
				var x = evt.offsetX;
			    var y = evt.offsetY;

				context.setTransform(1, 0, 0, 1, x - startCoords[0], y - startCoords[1]);
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
		var bgColor = "#000000";
		this.context.fillStyle = bgColor;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.board.draw(this.context);
	}

}
