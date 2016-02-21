App = class App {

	constructor() {
		this.board = new Board(50, 50);
		this.marquee = new Marquee();
		this.board.setBoardForPlayerOne(15);
		this.canvas = document.getElementById("canvasOne");
		this.context = this.canvas.getContext("2d");

		this.setShifting(false);
		this.setMarqueeing(false);
		this.setIsDown(false);
		this.setLastCoords(-300, -600);
		this.setStartCoords(0, 0);
		this.setEaseAmount(0.5);

		this.setCurrentTransCoords(-300, -600);
		this.setTargetTransCoords(-300, -600);
		this.transform();

		this.board.setTransX(this.lastCoords[0]);
		this.board.setTransY(this.lastCoords[1]);

		this.canvas.addEventListener("mousedown", (e) => {
			this.handleMouseDown(e.offsetX, e.offsetY, e.clientX, e.clientY, e.shiftKey);
		}.bind(this));

		window.addEventListener("mouseup", (e) => {
			this.handleMouseUp(e.offsetX, e.offsetY, e.shiftKey);
		}.bind(this));
		
		window.addEventListener("mousemove", (e) => {
			this.handleMouseMove(e.offsetX, e.offsetY, e.clientX, e.clientY, e.shiftKey);
		}.bind(this));

		// TODO: Replace validate button
		var validateButton = document.getElementById('validateButton');
		validateButton.addEventListener("click", () => {
			alert(this.board.validate());
		}.bind(this));
	}

	setEaseAmount(ease) {
		this.easeAmount = ease;
	}

	setMarqueeing(v) {
		this.marqueeing = v;
	}

	setShifting(v) {
		this.shifting = v;
	}

	setIsDown(v) {
		this.isDown = v;
	}

	setLastCoords(x, y) {
		this.lastCoords = [x, y];
	}

	setStartCoords(x, y) {
		this.startCoords = [x, y];
	}

	setCurrentTransCoords(x, y) {
		this.currentTransX = x;
		this.currentTransY = y;
	}

	setTargetTransCoords(x, y) {
		this.targetTransX = x;
		this.targetTransY = y;
	}

	transform() {
		this.context.setTransform(1, 0, 0, 1, this.currentTransX, this.currentTransY);
	}

	getRelativeCoords(x, y) {
		var bRect = this.canvas.getBoundingClientRect();
		x = (x - bRect.left) * (this.canvas.width / bRect.width),
		y = (y - bRect.top) * (this.canvas.height / bRect.height);
		return [x, y];
	}

	handleMouseUp(offsetX, offsetY, shiftKey) {
		if (this.shifting) {
			var clampX = Utils.clamp(offsetX - this.startCoords[0], -1500, 0),
				clampY = Utils.clamp(offsetY - this.startCoords[1], -1500, 0);  
			
			this.setLastCoords(clampX, clampY);
	    	this.board.setTransX(this.lastCoords[0]);
			this.board.setTransY(this.lastCoords[1]);
			this.setShifting(false);
		} else if (this.marqueeing) {
			this.setMarqueeing(false);
			this.marquee.hide();
		} else {
			this.board.unsetDraggedTiles();
			this.board.setDragVectorStart(0, 0);
			this.board.setDragVectorEnd(0, 0);
		}
	}

	handleMouseDown(offsetX, offsetY, clientX, clientY, shiftKey) {
		var [mouseX, mouseY] = this.getRelativeCoords(clientX, clientY);

		if (this.board.beginDraggingTile(mouseX, mouseY, shiftKey)) { // TODO: make a check for existence here first
			this.board.dragSelectedTiles();
			this.board.setDragVectorStart(mouseX, mouseY);
		} else {
			var clampX = Utils.clamp(offsetX - this.lastCoords[0], 0, 1500),
				clampY = Utils.clamp(offsetY - this.lastCoords[1], 0, 1500);
			
			if (shiftKey) {
				this.setMarqueeing(true);
				this.setStartCoords(clampX, clampY);
				this.marquee.show(this.startCoords[0], this.startCoords[1]);
			} else if (!this.board.beginDraggingTile(mouseX, mouseY)) {
				this.setShifting(true);
				this.setStartCoords(clampX, clampY);
				this.board.deselectTiles();
			}
		}
	}

	stillMoving() {
		return this.currentTransX !== this.targetTransX && this.currentTransY !== this.targetTransY;
	}

	handleMouseMove(offsetX, offsetY, clientX, clientY, shiftKey) {
		if (this.board.isDraggingTile() && !this.marqueeing) {
			var [mouseX, mouseY] = this.getRelativeCoords(clientX, clientY);

			var shapeW = this.board.tileWidth / 2,
				shapeH = this.board.tileHeight / 2,
				minX = shapeW,
				maxX = this.canvas.width - shapeW,
				minY = shapeH,
				maxY = this.canvas.height - shapeH;

			var posX = Utils.clamp(mouseX, minX, maxX),
				posY = Utils.clamp(mouseY, minY, maxY);

			this.board.setDragVectorEnd(posX, posY);
		}

		if (this.shifting) {
			var transX = offsetX - this.startCoords[0],
				transY = offsetY - this.startCoords[1];

			this.setTargetTransCoords(transX, transY);
		}

		if (this.marqueeing) {
			var xMin, yMin, xMax, yMax;

			if (this.marquee.width < 0) {
				xMin = this.marquee.x + this.marquee.width;
				xMax = this.marquee.x;
			} else {
				xMin = this.marquee.x;
				xMax = this.marquee.x + this.marquee.width;
			}

			if (this.marquee.height < 0) {
				yMin = this.marquee.y + this.marquee.height;
				yMax = this.marquee.y;
			} else {
				yMin = this.marquee.y;
				yMax = this.marquee.y + this.marquee.height;
			}

			var sizeX = offsetX - this.lastCoords[0],
				sizeY = offsetY - this.lastCoords[1];

			this.marquee.updateSize(sizeX, sizeY);
			this.board.selectTiles(xMin, yMin, xMax, yMax);
		}
	}

	update() {
		if (this.stillMoving()) {
			this.currentTransX += this.easeAmount * (this.targetTransX - this.currentTransX);
			this.currentTransY += this.easeAmount * (this.targetTransY - this.currentTransY);
			this.transform();
		}
		this.board.update();
	}

	draw() {
		this.context.fillStyle = Color.FELT_GREEN;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.board.draw(this.context);
		this.marquee.draw(this.context);
	}
}