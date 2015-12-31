'use strict';

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
	}

	canvasCoord() {
		return { x: this.board.tileSize * this.gridX + this.board.transX,
				 	 	 y: this.board.tileSize * this.gridY + this.board.transY }
	}

	moveTile(x, y) {
		var otherTile = this.board.tile(x, y);
		if (otherTile) { otherTile.moveToClosest(); }
		setGridCoord(x, y);
	}

	setGridCoord(x, y) {
		if (this.board.tile(x, y)) return false;

		this.gridX = x;
		this.gridY = y;
		return true;
	}

	inPile() {
		return gridX === -1 && gridY === -1;
	}

	moveToClosest() {
		var x = this.gridX,
			y = this.gridY,
			layer = 1;

		while (true) {
			a = [-layer, layer];
			for (var i = 0; i < a.length; i++) {
				z = a[i];

				if (this.setGridCoord(x + z, y - layer)) return;
				if (this.setGridCoord(x + z, y + layer)) return;

				for (var j = -layer + 1; j < layer; j++) {
					if (this.setGridCoord(x + z, y + j)) return;
					if (this.setGridCoord(x + j, y + z)) return;
				}
			}

			layer++;
		}
	}

	draw(context) {
		var coord = this.canvasCoord(),
			x = coord.x,
			y = coord.y,
			rad = this.board.tileSize / 2;

		context.fillStyle = "#FFFFFF";
		context.fillRect(x-rad, y-rad, rad * 2, rad * 2);
		context.strokeRect(x-rad, y-rad, rad * 2, rad * 2);
		// draw letter
		context.fillStyle = "#000000";
		context.font = "40px Helvetica";
		context.fillText(this.letter, x - rad / 2, y + rad / 2);
	}

	// update() {  }
}
