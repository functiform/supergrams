Utils = {

	clamp: function(num, min, max) {
		return (num < min) ? min : ((num > max) ? max : num);
	}

};

Color = {
	RED: '#FF0000',
	GREEN: '#00FF00',
	BLUE: '#0000FF',
	BLACK: '#000000',
	WHITE: '#FFFFFF',
	TAN: '#cccccc',
	LIGHTGRAY: '#333333',
	YELLOW: "ffff99"
};

TileState = {
	REGULAR: 'regular',
	DRAGGING: 'dragging',
	SELECTING: 'selecting',
	HOVERING: 'hovering',
	REPLACING: 'replacing',
	NEW: 'new'
};