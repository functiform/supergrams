Utils = {

	clamp: function(num, min, max) {
		return (num < min) ? min : ((num > max) ? max : num);
	},

	drawRoundedSquare: function(context, x, y, size, radius) {
    	context.beginPath();
    	context.moveTo(x + radius, y);
    	context.lineTo(x + size - radius, y);
    	context.quadraticCurveTo(x + size, y, x + size, y + radius);
    	context.lineTo(x + size, y + size - radius);
    	context.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
    	context.lineTo(x + radius, y + size);
    	context.quadraticCurveTo(x, y + size, x, y + size - radius);
    	context.lineTo(x, y + radius);
    	context.quadraticCurveTo(x, y, x + radius, y);
    	context.closePath();
    	context.fill();
    }

};

Color = {
	RED: '#ff0000',
	GREEN: '#00ff00',
	BLUE: '#0000ff',
	BLACK: '#000000',
	WHITE: '#ffffff',
	TAN: '#cccccc',
	LIGHTGRAY: '#333333',
	YELLOW: "#ffff99",
	FELT_GREEN: "#001a00"
};

TileState = {
	REGULAR: 'regular',
	DRAGGING: 'dragging',
	SELECTING: 'selecting',
	HOVERING: 'hovering',
	REPLACING: 'replacing',
	NEW: 'new'
};