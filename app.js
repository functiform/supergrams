'use strict';

class App {

	constructor() {
		this.theCanvas = document.getElementById("canvasOne");
		console.log(this.theCanvas.constructor.name);
		this.validateButton = document.getElementById('validateButton');
		this.context = this.theCanvas.getContext("2d");
		this.easeAmount = 0.40;
		this.bgColor = "#000000";

		this.board = new Board(50, 50);

		this.board.setBoardForPlayerOne(15);

		this.dragging = false;

		// this.theCanvas.addEventListener("mousedown", this.mouseDownListener, false);
		this.validateButton.addEventListener("click", function(){
			alert(app.board.validate());
		});

		this.isDown = false; // whether mouse is pressed
		this.startCoords = []; // 'grab' coordinates when pressing mouse

		this.last = [-300, -600]; // previous coordinates of mouse release
		this.startCoords = [0, 0];
		this.context.setTransform(1, 0, 0, 1, -300, -600);
		this.drawScreen();
		var that = this;

		var clamp = function(num, min, max) {
			return (num < min) ? min : ((num > max) ? max : num);
		};

		this.theCanvas.onmousedown = function(e) {
			console.log(that);
			app.mouseDownListener(e);
			if (app.dragging) return;
			app.isDown = true;
		    app.startCoords = [
		        clamp(e.offsetX - app.last[0], 0, 1500), // set start coordinates
		        clamp(e.offsetY - app.last[1], 0, 1500)
		   ];
		};

		this.theCanvas.onmouseup = function(e) {
			if (app.dragging) return;
		    app.isDown = false;
		    app.last = [
		        clamp(e.offsetX - app.startCoords[0], -1500, 0), // set last coordinates
		        clamp(e.offsetY - app.startCoords[1], -1500, 0)
		    ];
		};

		this.theCanvas.onmousemove = function(e) {
			if (app.dragging) return;
		    if(!app.isDown) return; // don't pan if mouse is not pressed

		    var x = e.offsetX;
		    var y = e.offsetY;

		    // set the canvas' transformation matrix by setting the amount of movement:
		    // 1  0  dx
		    // 0  1  dy 
		    // 0  0  1

		    app.context.setTransform(1, 0, 0, 1, x - app.startCoords[0], y - app.startCoords[1]);

		    app.drawScreen(); // render to show changes
		};
	}

	mouseDownListener(evt) {
		var bRect = app.theCanvas.getBoundingClientRect();
		var mouseX = (evt.clientX - bRect.left)*(app.theCanvas.width/bRect.width);
		var mouseY = (evt.clientY - bRect.top)*(app.theCanvas.height/bRect.height);
				
		//find which tile was clicked
		for (var i = 0; i < app.board.tiles.length; i++) {
			if	(app.hitTest(app.board.tiles[i], mouseX, mouseY)) {
				app.dragging = true;
				//the following variable will be reset if this loop repeats with another successful hit:
				app.draggedTile = app.board.tiles[i];
				app.dragIndex = i;
			}
		}
		
		if (app.dragging) {
			window.addEventListener("mousemove", app.mouseMoveListener, false);

			app.board.tiles.push(app.board.tiles.splice(app.dragIndex, 1)[0]);

			// We read record the point on this object where the mouse is "holding" it:
			app.dragHoldX = mouseX - app.draggedTile.worldX;
			app.dragHoldY = mouseY - app.draggedTile.worldY;
			
			//The "target" position is where the object should be if it were to move there instantaneously. But we will
			//set up the code so that this target position is approached gradually, producing a smooth motion.
			app.targetX = mouseX - app.dragHoldX;
			app.targetY = mouseY - app.dragHoldY;
			
			//start timer
			app.timer = setInterval(app.onTimerTick, 1000/60);
		}
		// app.theCanvas.removeEventListener("mousedown", app.mouseDownListener, false);
		window.addEventListener("mouseup", app.mouseUpListener, false);
		
		//code below prevents the mouse down from having an effect on the main browser window:
		if (evt.preventDefault) {
			evt.preventDefault();
		} //standard
		else if (evt.returnValue) {
			evt.returnValue = false;
		} //older IE
		return false;
	}

	onTimerTick() {
		app.draggedTile.worldX += app.easeAmount*(app.targetX - app.draggedTile.worldX);
		app.draggedTile.worldY += app.easeAmount*(app.targetY - app.draggedTile.worldY);

		//stop the timer when the target position is reached (close enough)
		if ((!app.dragging)&&(Math.abs(app.draggedTile.worldX - app.targetX) < 0.1) && (Math.abs(app.draggedTile.worldY - app.targetY) < 0.1)) {
			app.draggedTile.worldX = app.targetX;
			app.draggedTile.worldY = app.targetY;

			var possibleGridTargetX = Math.round(app.targetX / 50) * 50;
			var possibleGridTargetY = Math.round(app.targetY / 50) * 50;

			var newX = Math.round(possibleGridTargetX / 50 - 1),
				newY = Math.round(possibleGridTargetY / 50 - 1);

			if (app.board.move(app.draggedTile, {x: newX, y: newY})) {
				app.gridTargetX = possibleGridTargetX;
				app.gridTargetY = possibleGridTargetY;
			} else {
				app.gridTargetX = app.draggedTile.x * 50 + 50;
				app.gridTargetY = app.draggedTile.y * 50 + 50;
			}

			clearInterval(app.timer);
			app.timer = setInterval(app.shiftToClosestGridLocation, 1000/60);
		}

		app.drawScreen();
	}

	mouseUpListener(evt) {
		//app.theCanvas.addEventListener("mousedown", app.mouseDownListener, false);
		window.removeEventListener("mouseup", app.mouseUpListener, false);
		if (app.dragging) {
			app.dragging = false;
			window.removeEventListener("mousemove", app.mouseMoveListener, false);
		}
	}

	shiftToClosestGridLocation() {
		app.draggedTile.worldX += app.easeAmount*(app.gridTargetX - app.draggedTile.worldX);
		app.draggedTile.worldY += app.easeAmount*(app.gridTargetY - app.draggedTile.worldY);

		//stop the timer when the target position is reached (close enough)
		if ((!app.dragging)&&(Math.abs(app.draggedTile.worldX - app.gridTargetX) < 0.1) && (Math.abs(app.draggedTile.worldY - app.gridTargetY) < 0.1)) {
			app.draggedTile.worldX = app.gridTargetX;
			app.draggedTile.worldY = app.gridTargetY;
			clearInterval(app.timer);
		}

		app.drawScreen();
	}

	mouseMoveListener(evt) {
		var bRect 	 = app.theCanvas.getBoundingClientRect(),
			shapeRad = app.board.tileSize / 2,
			minX 	 = shapeRad,
			maxX 	 = app.theCanvas.width - shapeRad,
			minY 	 = shapeRad,
			maxY 	 = app.theCanvas.height - shapeRad,
			mouseX 	 = (evt.clientX - bRect.left) * (app.theCanvas.width/bRect.width),
			mouseY 	 = (evt.clientY - bRect.top) * (app.theCanvas.height/bRect.height);
		
		//clamp x and y positions to prevent object from dragging outside of canvas
		var posX = mouseX - app.dragHoldX;
		posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
		var posY = mouseY - app.dragHoldY;
		posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);
		
		app.targetX = posX;
		app.targetY = posY;
	}

	hitTest(tile, mx, my) {
		var x 	 	 = tile.worldX + this.last[0],
			y 	 	 = tile.worldY + this.last[1],
			halfsize = this.board.tileSize / 2;

		return mx > x - halfsize
		    && mx < x + halfsize
		    && my > y - halfsize
		    && my < y + halfsize;
	}

	drawShapes() {
		var rad  = this.board.tileSize / 2;
		for (var i = 0; i < this.board.tiles.length; i++) {
			var x = this.board.tiles[i].worldX,
				y = this.board.tiles[i].worldY;
			// draw tile
			this.context.fillStyle = "#FFFFFF";
			this.context.fillRect(x-rad, y-rad, rad*2, rad*2);
			this.context.strokeRect(x-rad, y-rad, rad*2, rad*2);
			// draw letter
			this.context.fillStyle = "#000000";
			this.context.font = "40px Helvetica";
			this.context.fillText(this.board.tiles[i].letter, x-rad/2, y+rad/2);
		}
	}

	drawScreen() {
		this.context.fillStyle = this.bgColor;
		this.context.fillRect(0, 0, this.theCanvas.width, this.theCanvas.height);
		this.drawShapes();
	}

}
