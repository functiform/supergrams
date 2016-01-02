'use strict';

class Board {

	constructor(width, height) {
		this.dictionary = wordsDictionary;

		this.width  = height;
		this.height = width;

		this.tileSize = 50;
		this.transX = 0;
		this.transY = 0;

		this.shifting = false;

		this.easeAmount = 0.40;

		this.tiles = []; // hold tiles
		this.draggedTile = null;

		this.constructGrid(); // hold letters to evaluate
		this.constructPile();
		this.shufflePile();
	}

	setTransX(x) {
		this.transX = x;
	}

	setTransY(y) {
		this.transY = y;
	}

	tile(x, y) {
		return this.grid[x][y];
	}

	hitTest(tile, mx, my) {
		var coord = tile.canvasCoord(),
			x = coord.x,
			y = coord.y,
			halfsize = this.tileSize / 2;

		return mx > x - halfsize
		    && mx < x + halfsize
		    && my > y - halfsize
		    && my < y + halfsize;
	}

	isDraggingTile() {
		return this.draggedTile;
	}

	setDraggedTile(i, x, y) {
		this.draggedTile = this.tiles[i];
		
		// move dragged tile to end, so that it will draw last
		this.tiles.push(this.tiles.splice(i, 1)[0]);

		var draggedTile = this.draggedTile;

		draggedTile.setTarget(x, y);
		draggedTile.startDragging();
	}

	unsetDraggedTile() {
		this.draggedTile.stopDragging();
		this.draggedTile = null;
	}

	beginDraggingTile(x, y) {
		for (var i = 0; i < this.tiles.length; i++) {
			if (this.hitTest(this.tiles[i], x, y)) {
				this.setDraggedTile(i, x, y);
				return true;
			}
		}
		return false;
	}

	constructGrid() {
		var row = [];
		for (var i = 0; i < this.width; i++){
			row.push(null);
		}
		this.grid = [];
		for (var i = 0; i < this.height; i++){
			this.grid.push(row.slice()); // copy array `row` by value
		}
	}

	constructPile() {
		var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var counts   = [13, 3, 3, 6, 18, 3, 4, 3, 12, 2, 2, 5, 3, 8, 11, 3, 2, 9, 6, 9, 6, 3, 3, 2, 3, 2];

		this.pile = [];

		for (var i = 0; i < alphabet.length; i++){
			var c = alphabet.charAt(i);
			for (var j = 0; j < counts[i]; j++) {
				this.pile.push(new Tile(c, this));
			}
		}
	}

	shufflePile() {
		var m = this.pile.length;

		while (m) {
			var i = Math.floor(Math.random() * m--);
			var t = this.pile[m];
			this.pile[m] = this.pile[i];
			this.pile[i] = t;
		}
	}

	setBoardForPlayerOne(numTiles) {
		for (var i = 0; i < numTiles; i++) {
			var keepGoing = true;
			while (keepGoing) {
				var x = Math.floor(Math.random()*10 + this.height/2.0 - 10);
				var y = Math.floor(Math.random()*10 + this.width/2.0  - 10);
				if (this.grid[x][y] === null) {
					var tile = this.pile.pop();
					this.insert(tile, {x: x, y: y});
					keepGoing = false;
				}
			}
		}
	}

	toWorld(c) {
		return c * 50 + 50;
	}

	insert(tile, toCoord) {
		var letter = tile.letter;
		var x = toCoord.x,
			y = toCoord.y;

		if (toCoord.x < 0 || toCoord.y < 0 || toCoord.x >= this.height || toCoord.y >= this.width){
			return false;
		}

		if (letter.length === 1 && letter.match(/[a-z]/i)) { // validate letter
			if (this.grid[x][y] === null){
				tile.setGridCoord(x, y);
				this.grid[x][y] = tile;
				this.tiles.push(tile);
			} else {
				throw "not an empty space";
			}
		} else {
			throw "not a letter";
		}

		return true;
	}

	validate() {
		if (!this.isOneIsland()){
			return false;
		} else {
			var invalidWords = [];
			this.validateRows(invalidWords, this.grid);
			this.validateRows(invalidWords, this.transpose(this.grid));
		}
		return invalidWords;
	}

	validateRows(invalidWords, grid) {
		for (var i = 0; i < grid.length; i++){
			this.validateRow(invalidWords, grid[i]);
		}
	}

	validateRow(invalidWords, row) {
		var words = this.getWords(row);
		for (var i = 0; i < words.length; i++){
			this.validateWord(invalidWords, words[i]);
		}
	}

	validateWord(invalidWords, word) {
		if (!this.dictionary[word.toLowerCase()]){
			invalidWords.push(word);
		}
	}

	getWords(row) {
		var words = [];
		for (var i = 0; i < row.length; i++) {
			var word = '';
			if (row[i]) {
				while (row[i]) {
					word += row[i].letter;
					i += 1;
				}
				if (word.length > 1) { words.push(word); };
			}
		}
		return words;
	}

	transpose(matrix) {
		var x = matrix[0].map(function (_, col) { 
			return matrix.map(function (row) { 
				return row[col]; 
			}); 
		});
		return x;
	}

	isOneIsland() {
		var tgrid = this.grid.map(function(arr) {
		    return arr.slice();
		});

		if (tgrid==null || tgrid.length==0 || tgrid[0].length==0) return 0;
		
		function merge(i, j){
		    //validity checking
		    if(i<0 || j<0 || i>tgrid.length-1 || j>tgrid[0].length-1)
		        return;
		 
		    //if current cell is water or visited
		    if(tgrid[i][j] === null) return;
		 
		    //set visited cell to null
		    tgrid[i][j] = null;
		 
		    //merge all adjacent land
		    merge(i-1, j);
		    merge(i+1, j);
		    merge(i, j-1);
		    merge(i, j+1);
		}

		var count = 0;
	 
	    for (var i=0; i<tgrid.length; i++) {
	        for (var j=0; j<tgrid[0].length; j++) {
	            if(tgrid[i][j] !== null){
	                count++;
	                if (count > 1){
	                	return false;
	                }
	                merge(i, j);
	            }
	        }
	    }

	    return count === 1;
	}

	update() {
		for (var i = 0; i < this.tiles.length; i++) {
			this.tiles[i].update();
		}
	}

	draw(context) {
		for (var i = 0; i < this.tiles.length; i++) {
			this.tiles[i].draw(context);
		}
	}

}
