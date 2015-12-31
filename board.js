'use strict';

class Tile {
	constructor(letter) {
		this.letter = letter;

		// real drawing coordinates
		this.worldX = -1;
		this.worldY = -1;

		// board coordinates
		this.x = -1;
		this.y = -1;
	}
}

class Pile {
	constructor() {
		this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		this.counts   = [13, 3, 3, 6, 18, 3, 4, 3, 12, 2, 2, 5, 3, 8, 11, 3, 2, 9, 6, 9, 6, 3, 3, 2, 3, 2];
		this.tiles    = [];

		this.addTiles();
		this.shuffleTiles();
	}

	addTiles() {
		for (var i = 0; i < this.alphabet.length; i++){
			var c = this.alphabet.charAt(i);
			for (var j = 0; j < this.counts[i]; j++) {
				this.tiles.push(new Tile(c));
			}
		}
	}

	shuffleTiles() {
		var m = this.tiles.length;

		while (m) {
			var i = Math.floor(Math.random() * m--);
			var t = this.tiles[m];
			this.tiles[m] = this.tiles[i];
			this.tiles[i] = t;
		}
	}

	take(n) {
		if (n > this.tiles.length) throw "not enough tiles";
		var toTake = [];
		for (var i = 0; i < n; i ++) {
			toTake.push(this.tiles.pop());
		}

		return toTake;
	}

	pop() {
		return this.tiles.pop();
	}
}

class Board {
	constructor(width, height) {
		this.dictionary = wordsDictionary;

		this.width  = height;
		this.height = width;

		this.tileSize = 50;
		this.tiles = []; // hold tiles
		this.constructGrid(); // hold letters to evaluate
		this.pile = new Pile();
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

	move(tile, toCoord) {
		var letter = tile.letter;

		if (toCoord.x < 0 || toCoord.y < 0 || toCoord.x >= this.height || toCoord.y >= this.width){
			return false;
		}

		if (letter.length === 1 && letter.match(/[a-z]/i)) {
			if (toCoord.x === tile.x && toCoord.y === tile.y){
				return true;
			} else if (this.grid[toCoord.x][toCoord.y] === null){
				this.grid[toCoord.x][toCoord.y] = letter;
				this.grid[tile.x][tile.y] = null;
				tile.x = toCoord.x;
				tile.y = toCoord.y;
				return true;
			} else {
				// var currentLetter = this.grid[toCoord.x][toCoord.y];
				// this.grid[toCoord.x][toCoord.y] = letter;
				// this.grid[fromCoord.x][fromCoord.y] = currentLetter;
				return false;
			}
		} else {
			throw "not a letter";
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
				this.grid[x][y] = letter;
				tile.x = x;
				tile.y = y;
				tile.worldX = this.toWorld(x);
				tile.worldY = this.toWorld(y);
				this.tiles.push(tile);
			} else {
				throw "not an empty space";
			}
		} else {
			throw "not a letter";
		}
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
					word += row[i];
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

}
