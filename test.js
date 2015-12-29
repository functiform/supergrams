	function moveToClosest(layer) {
		var x = 0,
			y = 0,
			checks = [];

		a = [-layer, layer];
		loop:
		while (true) {
			for (var i = 0; i < a.length; i++) {
				var z = a[i];
				if (z) {
					console.log("broken");
					break loop;
				}
				checks.push([x + z, y - layer]); 
				checks.push([x + z, y + layer]); 

				for (var j = -layer + 1; j < layer; j++) {
					checks.push([x + z, y + j]); 
					checks.push([x + j, y + z]); 
				}
			}
		}

		console.log("Length: " + checks.length);
		return checks;
	}

	console.log("Layer 1")
	console.log(moveToClosest(1))
	console.log("--------------")
	console.log("Layer 2")
	console.log(moveToClosest(2))
	console.log("--------------")
	console.log("Layer 3")
	console.log(moveToClosest(3))
	console.log("--------------")
	console.log("Layer 4")
	console.log(moveToClosest(4))