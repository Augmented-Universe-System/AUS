var canvas;
var ctx;

function init() {
	canvas = document.getElementById('gameCanvas');
	ctx = canvas.getContext('2d');

	canvas.width = 800;
	canvas.height = 400;
	canvas.style.border = "1px solid";

	//positions: (x, y, width, height)
	ctx.rect(20,20,150,100);
	ctx.fillStyle = "red";
	ctx.fill();

	ctx.rect(600,250,150,100);
	ctx.fillStyle = "black";
	ctx.fill();
}