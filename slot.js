'use strict';

class Slot {
	constructor(tile = null) {
		this.tile = tile;
	}

	tradeTiles(slot){
		if (slot instanceof Slot) {
			var temp = this.tile;
			this.tile = slot.tile;
			slot.tile = temp;
		} else {
			throw "argument is not a Slot"
		}
	}

	receiveTile(tile){
		if (this.tile !== null){
			this.tile = tile
		} else {
			throw "slot is not empty"
		}
	}

}

