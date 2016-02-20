var app;
var updateTimer, drawTimer;

function update(){
	app.update();
}

function draw(){
	app.draw();
}

Template.board.onCreated(function() {
	
});

Template.board.onRendered(function() {
	$.getScript("https://use.typekit.net/rih2ssh.js", function() {
		try {
			Typekit.load({ async: true });
			app = new App();
			updateTimer = setInterval(update, 1000/60);
			drawTimer = setInterval(draw, 1000/60);
		} catch(e) {
			console.log(e);
		}
	});
});