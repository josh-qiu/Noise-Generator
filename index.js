const GIFEncoder = require('gifencoder');
const { createCanvas } = require('canvas');
const fs = require('fs');



//PIXEL
function Pixel(x, y, noise){
	this.x = x;
	this.y = y;
	this.noise = noise;
}

//DIMENSIONS
const WIDTH = 2000, HEIGHT = 2000, NUM_POINTS = 200;
var max = 0;

function setMax(map){
	for (let y = 0; y < WIDTH; y++){
		for (let x = 0; x < HEIGHT; x++){
			distance = map[y][x].noise;
			if (distance > max){
				max = distance;
			}
		}
	}
	max *= (2/3);
}

//ANCHOR POINTS
const anchorPoints = [];

for (let i = 0; i < NUM_POINTS; i++){
	anchorPoints.push(new Pixel(Math.floor(Math.random() * WIDTH + 1), Math.floor(Math.random() * HEIGHT + 1), 0));
}

//WORLEY ALGORITHM

function getNoise(pixel){

	let noise = Number.MAX_VALUE;

	for (let i = 0; i < NUM_POINTS; i++){
		let distance = Math.sqrt(Math.pow((pixel.x - anchorPoints[i].x),2) + 
													Math.pow(pixel.y - anchorPoints[i].y, 2));
		if (distance < noise){
			noise = distance;
		}
	}
	return noise;
}

//PIXEL MAP
const map = [];

for (let y = 0; y < HEIGHT; y++){
	const row = [];
	map.push(row);
	for (let x = 0; x < WIDTH; x++){
		let pixel = new Pixel(x, y, 0);
		pixel.noise = getNoise(pixel);
		row.push(pixel);
	}
}

//STREAM SETUP
const encoder = new GIFEncoder(WIDTH, HEIGHT);

encoder.createReadStream().pipe(fs.createWriteStream('myanimated.gif'));

encoder.start();
encoder.setRepeat(-1);   // 0 for repeat, -1 for no-repeat
encoder.setDelay(500);  // frame delay in ms
encoder.setQuality(10); // image quality. 10 is default.
//CANVAS

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

//WHITE BACKGROUND
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

//DRAW ANCHOR POINTS
ctx.fillStyle = '#AA2277'

for (let i = 0; i < NUM_POINTS; i++){
	ctx.beginPath();
	ctx.arc(anchorPoints[i].x, anchorPoints[i].y, 5, 0, 2 * Math.PI);
	ctx.fill();

}	

//NORMALIZE NOISE
setMax(map);
function normalize(noise){
	
	if (noise >= max){
		noise == max;
	}
	noise = ((noise / (max))) * 255;
	return noise;
}
let counter = 0;
for (let y = 0; y < HEIGHT; y++){
	for (let x = 0; x < WIDTH; x++){
		let pixel = map[y][x];
		let point = ctx.createImageData(1, 1);
		let rgba = point.data;
		let noise = normalize(pixel.noise);
		rgba[0] = noise;
		rgba[1] = noise;
		rgba[2] = noise;
		rgba[3] = noise;
		ctx.putImageData(point, x, y);
		// if ((counter % 12500) == 0){
		// 	encoder.addFrame(ctx);
		// }
		counter++;
	}
}

encoder.addFrame(ctx);
encoder.finish();

