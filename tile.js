'use strict';

function clamp(num, min, max) {
	return (num < min) ? min : ((num > max) ? max : num);
}

var Color = {
	RED: '#FF0000',
	GREEN: '#00FF00',
	BLUE: '#0000FF',
	BLACK: '#000000',
	WHITE: '#FFFFFF'
};

var TileState = {
	REGULAR: 'regular',
	DRAGGING: 'dragging',
	SELECTING: 'selecting',
	HOVERING: 'hovering',
	REPLACING: 'replacing',
	NEW: 'new'
};

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

		this.setEaseAmount(0.3);

		this.state = TileState.REGULAR;
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
		if (this.move(x, y)) {
			this.state = TileState.REGULAR;
		}
	}

	canvasCoord() {
		return { x: this.board.tileSize * this.currentX + this.board.transX,
		         y: this.board.tileSize * this.currentY + this.board.transY };
	}

	move(x, y) {
		// console.log('(' + this.gridX + ',' + this.gridY + ')');
		// console.log('(' + x + ',' + y + ')');

		var isSameTile = x === this.gridX && y === this.gridY;

		if (isSameTile) {
			this.targetX = x;
			this.targetY = y;
			return true;
		}

		var otherTile = this.board.tile(x, y);
		if (otherTile) {
			if (otherTile.state !== TileState.SELECTING) {
				otherTile.moveToClosest(); 
			} else {
				return false;
			}
		}

		this.setGridCoord(x, y); // should be empty at this point OR tile at that location is selected.
		return true;
	}

	setGridCoord(x, y) {
		var otherTile = this.board.tile(x, y);

		if (otherTile) {
			return false;
		}

		if (this.gridX !== -1 && this.gridY !== -1) {
			this.board.grid[this.gridX][this.gridY] = null;  // TODO: need to delegate grid changes to Board class only
		}

		// console.log(this.letter + ' ' + y + '->' + this.gridY);

		this.gridX = x;
		this.gridY = y;
		this.targetX = x;
		this.targetY = y;

		this.board.grid[x][y] = this; // TODO: need to delegate grid changes to Board class only

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

	worldToGridNoOffsetX(x) {
		return x / this.board.tileSize;
	}

	worldToGridNoOffsetY(y) {
		return y / this.board.tileSize;
	}

	setTarget(x, y) {
		this.targetX = this.worldToGridX(x);
		this.targetY = this.worldToGridY(y);
	}

	setEaseAmount(amt) {
		this.easeAmount = amt;
	}

	fillColor() {
		switch(this.state) {
		    case TileState.REGULAR:
		        return Color.WHITE;
		    case TileState.DRAGGING:
		        return Color.WHITE;
		    case TileState.SELECTING:
		        return Color.GREEN;
		    case TileState.HOVERING:
		        return Color.WHITE;
		    case TileState.REPLACING:
		        return Color.BLACK;
		    case TileState.NEW:
		        return Color.RED;
		    default:
		        throw 'Invalid enum value for TileState'
		};
	}

	strokeColor() {
		switch(this.state) {
		    case TileState.REGULAR:
		        return Color.BLACK;
		    case TileState.DRAGGING:
		        return Color.RED;
		    case TileState.SELECTING:
		        return Color.BLUE;
		    case TileState.HOVERING:
		        return Color.WHITE;
		    case TileState.REPLACING:
		        return Color.BLACK;
		    case TileState.NEW:
		        return Color.RED;
		    default:
		        throw 'Invalid enum value for TileState'
		};
	}

	strokeThickness() {
		switch(this.state) {
		    case TileState.REGULAR:
		        return 0;
		    case TileState.DRAGGING:
		        return 2;
		    case TileState.SELECTING:
		        return 1;
		    case TileState.HOVERING:
		        return 1;
		    case TileState.REPLACING:
		        return 1;
		    case TileState.NEW:
		        return 1;
		    default:
		        throw 'Invalid enum value for TileState'
		};
	}

	draw(context) {
	    var x = this.board.tileSize * this.currentX,
	        y = this.board.tileSize * this.currentY,
	        rad = this.board.tileSize / 2;

		context.fillStyle = this.fillColor();
		context.lineWidth = this.strokeThickness();
		context.strokeStyle = this.strokeColor();

		context.fillRect(x-rad, y-rad, rad * 2, rad * 2);
		context.strokeRect(x-rad, y-rad, rad * 2, rad * 2);

		context.fillStyle = "#000000";

		context.font = "40px Helvetica";
		context.fillText(this.letter, x - rad / 2, y + rad / 2);
	}

	update() {
		if (this.state === TileState.SELECTING) {
			this.targetX = this.gridX + this.worldToGridNoOffsetX(this.board.dragVector.x);
			this.targetY = this.gridY + this.worldToGridNoOffsetY(this.board.dragVector.y);
		}
		if (this.inMotion()) {
			this.currentX += this.easeAmount * (this.targetX - this.currentX);
			this.currentY += this.easeAmount * (this.targetY - this.currentY);
		}
	}
}
