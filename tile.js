'use strict';

function clamp(num, min, max) {
	return (num < min) ? min : ((num > max) ? max : num);
}

class Tile {

	constructor(letter, board) {
		this.letter = letter;
		this.board = board;

		this.gridX = -1;
		this.gridY = -1;

		this.targetX = -1.0;
		this.targetY = -1.0;

		this.currentX = -1.0;
		this.currentY = -1.0;

		this.dragging = false;
		this.selected = false;

		this.setEaseAmount(0.3);
	}

	startDragging() {
		this.dragging = true;
	}

	snapToGridX(x) {
		return clamp(Math.round(x), 0, this.board.width - 1);
	}

	snapToGridY(y) {
		return clamp(Math.round(y), 0, this.board.height - 1);
	}

	stopDragging() {
		this.dragging = false;
		var x = this.snapToGridX(this.targetX),
		  	y = this.snapToGridY(this.targetY);
		this.move(x, y);
	}

	canvasCoord() {
		return { x: this.board.tileSize * this.currentX + this.board.transX,
				     y: this.board.tileSize * this.currentY + this.board.transY };
	}

	move(x, y) {
		var isSameTile = x === this.gridX && y === this.gridY;

		if (isSameTile) {
			this.targetX = x;
			this.targetY = y;
			return;
		}

		var otherTile = this.board.tile(x, y);
		if (otherTile) { otherTile.moveToClosest(); }

		this.setGridCoord(x, y); // should be empty at this point
	}

	setGridCoord(x, y) {
		if (this.board.tile(x, y)) return false;

		if (this.gridX !== -1 && this.gridY !== -1) {
			this.board.grid[this.gridX][this.gridY] = null;  // TODO: need to delegate grid changes to Board class only
		}

		this.gridX = x;
		this.gridY = y;
		this.targetX = x;
		this.targetY = y;

		this.board.grid[this.gridX][this.gridY] = this; // TODO: need to delegate grid changes to Board class only

		return true;
	}

	inPile() {
		return this.gridX === -1 && this.gridY === -1;
	}

	inMotion() {
		return !(this.targetX === -1 && this.targetY === -1) || (this.currentX === this.targetX && this.currentY === this.targetY);
	}

	isDragging() {
		return this.dragging;
	}

	moveToClosest() {
		var x = this.gridX,
			  y = this.gridY,
				layer = 1;

		while (true) {
			var a = [-layer, layer];
			for (var i = 0; i < a.length; i++) {
				var z = a[i];

				for (var j = -layer + 1; j < layer; j++) {
					if (this.setGridCoord(x + z, y + j)) return;
					if (this.setGridCoord(x + j, y + z)) return;
				}

				if (this.setGridCoord(x + z, y - layer)) return;
				if (this.setGridCoord(x + z, y + layer)) return;
			}

			layer++;
		}
	}

	worldToGridX(x) {
		return (x - this.board.transX) / this.board.tileSize;
	}

	worldToGridY(y) {
		return (y - this.board.transY) / this.board.tileSize;
	}

	setTarget(x, y) {
		this.targetX = this.worldToGridX(x);
		this.targetY = this.worldToGridY(y);
	}

	setEaseAmount(amt){
		this.easeAmount = amt;
	}

	removeTarget() {
		this.targetX = -1.00;
		this.targetY = -1.00;
	}

	draw(context) {
		var x = this.board.tileSize * this.currentX,
			  y = this.board.tileSize * this.currentY,
			rad = this.board.tileSize / 2;

		context.fillStyle = "#FFFFFF";
		context.strokeStyle = this.selected ? "red" : "black";
		context.lineWidth =  this.selected ? "2" : "1";
		context.fillRect(x-rad, y-rad, rad * 2, rad * 2);
		context.strokeRect(x-rad, y-rad, rad * 2, rad * 2);

		context.fillStyle = "#000000";

		context.font = "40px Helvetica";
		context.fillText(this.letter, x - rad / 2, y + rad / 2);
	}

	update() {
		if (this.inMotion()) {
			this.currentX += this.easeAmount * (this.targetX - this.currentX);
			this.currentY += this.easeAmount * (this.targetY - this.currentY);
		}
	}
}
