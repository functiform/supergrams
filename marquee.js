"use strict";

class Marquee {
  constructor() {
    this.shown = false;
  }

  show(x, y) {
    this.x = x;
    this.y = y;
    this.height = 0;
    this.width  = 0;
    this.shown  = true;
  }

  hide() {
    this.shown = false;
  }

  updateSize(offsetX, offsetY) {
    this.width  = offsetX - this.x;
    this.height = offsetY - this.y;
  }

  draw(context) {
    if (this.shown) {
      context.lineWidth = "3";
      context.strokeStyle = "red";
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}
