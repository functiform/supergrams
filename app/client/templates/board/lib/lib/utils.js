Utils = {

	clamp: function(num, min, max) {
		return (num < min) ? min : ((num > max) ? max : num);
	},

	drawRoundedRectangle: function(context, x, y, w, h, radius) {
    	context.beginPath();
    	context.moveTo(x + radius, y);
    	context.lineTo(x + w - radius, y);
    	context.quadraticCurveTo(x + w, y, x + w, y + radius);
    	context.lineTo(x + w, y + h - radius);
    	context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    	context.lineTo(x + radius, y + h);
    	context.quadraticCurveTo(x, y + h, x, y + h - radius);
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