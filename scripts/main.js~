var canvas = document.getElementById("game-canvas");
var context = canvas.getContext("2d");
var upPressed = false;
var downPressed = false;
var score1=0;
var score2=0;
var turn=1;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if (e.keyCode == 38) {
        upPressed = true;
    } else if(e.keyCode == 40) {
        downPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 38) {
        upPressed = false;
    } else if(e.keyCode == 40) {
        downPressed = false;
    }
}

// function mouseMoveHandler(e) {
//     var relativeY = e.clientY;
//     if(relativeY  > 50+PADDLE_HALF_LENGTH && relativeY < canvas.height) {
//         playerPaddle.pos.y = relativeY 
//     }
// }

function Pos(x, y) {
	this.x = x;
	this.y = y;
}

function Velocity(v_x, v_y) {
	this.x = v_x;
	this.y = v_y;
}

var BALL_RADIUS = 5;

function Ball(pos, vel) {
	this.pos = Object.assign({}, pos);
	this.vel = Object.assign({}, vel);

	this.move = function(dt, leftPaddle, rightPaddle) {
		var dPos = new Pos(this.vel.x * dt, this.vel.y * dt);
		// if (this.pos.x + dPos.x - BALL_RADIUS <0) {
		// 	//this.vel.x=-this.vel.x;
		// 	//this.pos.x+=this.vel.x * dt;
		// 	score2 += 1;
		// 	return false;
		// } else if (this.pos.x + dPos.x + BALL_RADIUS >= canvas.width) {
		// 	score1 += 1;
		// 	return false;
		// }
		var canMoveNormally = true;
		//if (this.pos.y + dPos.y - BALL_RADIUS < 0) {
		//	this.pos.y = BALL_RADIUS - 1;
		//	this.pos.x += dPos.x;
		//	canMoveNormally = false;
		//} 
		//if (this.pos.y + dPos.y + BALL_RADIUS >= canvas.height) {
		//	this.pos.y = canvas.height - BALL_RADIUS;
		//	this.pos.x += dPos.x;
		//	canMoveNormally = false;
		//} 
		//if (leftPaddle.pos.x < this.pos.x &&
		//	this.pos.y + dPos.y <= leftPaddle.pos.y + PADDLE_HALF_LENGTH &&
		//	this.pos.y + dPos.y >= leftPaddle.pos.y - PADDLE_HALF_LENGTH &&
		//	this.pos.x + dPos.x - BALL_RADIUS <= leftPaddle.pos.x + PADDLE_HALF_BREADTH) {
		//	this.pos.x = leftPaddle.pos.x + PADDLE_HALF_BREADTH + BALL_RADIUS;
		//	this.pos.y += dPos.y
		//	canMoveNormally = false;
		//}
		//if (rightPaddle.pos.x > this.pos.x &&
		//	this.pos.y <= rightPaddle.pos.y + PADDLE_HALF_LENGTH &&
		//	this.pos.y >= rightPaddle.pos.y - PADDLE_HALF_LENGTH &&
		//	this.pos.x + dPos.x + BALL_RADIUS >= rightPaddle.pos.x - PADDLE_HALF_BREADTH) {
		//	this.pos.x = rightPaddle.pos.x - PADDLE_HALF_BREADTH - BALL_RADIUS;
		//	this.pos.y += dPos.y
		//	canMoveNormally = false;
		//}

		if (canMoveNormally) {
			this.pos.x += dPos.x ;
			this.pos.y += dPos.y ;
		}

		return true;
	}

	this.handleCollisionsWithWall = function () {
		if (this.pos.y <= BALL_RADIUS - 1 && this.vel.y < 0) {
			this.vel.y = -this.vel.y;
		} else if (this.pos.y >= canvas.height - BALL_RADIUS) {
			this.vel.y = -this.vel.y;
		}
	}

	this.draw = function() {
		context.arc(this.pos.x, this.pos.y, BALL_RADIUS, 0, 2 * Math.PI)
		context.fillStyle = "white";		;
		context.fill();
	}
}

var PADDLE_HALF_BREADTH = 4;
var PADDLE_HALF_LENGTH = 25;
var PADDLE_VELOCITY_Y = 200;

function Paddle(pos) {
	this.pos = Object.assign({}, pos);
	this.velY = PADDLE_VELOCITY_Y;

	this.moveUp = function(dt) {
		var dy = this.velY * dt;
		if (this.pos.y - PADDLE_HALF_LENGTH - dy < 0) {
			this.pos.y = PADDLE_HALF_LENGTH;
		} else {
			this.pos.y -= dy;
		}
	}

	this.moveDown = function(dt) {
		var dy = this.velY * dt;
		if (this.pos.y + PADDLE_HALF_LENGTH + dy >= canvas.height) {
			this.pos.y = canvas.height - 1 - PADDLE_HALF_LENGTH;
		} else {
			this.pos.y += dy;
		}
	}

	this.tryToHitBall = function (ball) {
		if (this.pos.x < ball.pos.x) {
			if (ball.vel.x < 0 &&
					ball.pos.y >= this.pos.y - PADDLE_HALF_LENGTH &&
					ball.pos.y <= this.pos.y + PADDLE_HALF_LENGTH &&
					ball.pos.x - BALL_RADIUS <= this.pos.x + PADDLE_HALF_BREADTH) {
				ball.vel.x = -ball.vel.x;
			}
		} else {
			if (ball.vel.x > 0 &&
					ball.pos.y >= this.pos.y - PADDLE_HALF_LENGTH &&
					ball.pos.y <= this.pos.y + PADDLE_HALF_LENGTH &&
					ball.pos.x + BALL_RADIUS >= this.pos.x - PADDLE_HALF_BREADTH) {
				ball.vel.x = -ball.vel.x;
			}
		}
	}
	this.draw = function() {
		context.fillstyle = "white";
		context.fillRect(this.pos.x - PADDLE_HALF_BREADTH,
				this.pos.y - PADDLE_HALF_LENGTH,
				2 * PADDLE_HALF_BREADTH, 2 * PADDLE_HALF_LENGTH);
	}
	
	this.move = function() {
		if(this.pos.y + PADDLE_HALF_LENGTH + this.velY > canvas.height || this.pos.y -PADDLE_HALF_LENGTH + this.velY <50 )
			this.velY= -this.velY ;
		this.pos.y += this.velY;
	}
	
	this.move2 = function() {
		if(upPressed && this.pos.y - PADDLE_HALF_LENGTH - this.velY > 50) {
			this.moveUp();
		}
		else if(downPressed && this.pos.y + PADDLE_HALF_LENGTH + this.velY < canvas.height) {
			this.moveDown();
		}
	}
}

function drawBoard() {
	context.beginPath();
	context.strokeStyle = "white";
	context.moveTo(canvas.width / 2, 0);
	context.lineTo(canvas.width / 2, canvas.height - 1);
	context.moveTo(canvas.width / 2 - 1, canvas.height - 1);
	context.lineTo(canvas.width / 2 - 1, 0);
	context.moveTo(0, 50);
	context.lineTo(canvas.width , 50)
	context.moveTo(0, 52);
	context.lineTo(canvas.width , 52)
	context.stroke();
	context.closePath();
}

var PADDLE_DIST_FROM_END = 9;
var BALL_START_POS = new Pos(canvas.width / 2, BALL_RADIUS); //We are maintaing the centre of the balll in {pos}
var CPU_PADDLE_START_POS = new Pos(PADDLE_DIST_FROM_END, canvas.height / 2); // We are maintaining the centre of the rectangle in { pos}
var PLAYER_PADDLE_START_POS = new Pos(canvas.width - 1 - PADDLE_DIST_FROM_END,
	canvas.height / 2);
var BALL_START_VEL = new Velocity(-300, 300);

var ball = new Ball(BALL_START_POS, BALL_START_VEL);
var cpuPaddle = new Paddle(CPU_PADDLE_START_POS);
var playerPaddle = new Paddle(PLAYER_PADDLE_START_POS);

function collisionLeft(ball,paddle){
	if( ball.pos.x - BALL_RADIUS < (9 + 2* PADDLE_HALF_BREADTH ) &&  (ball.pos.y < paddle.pos.y + PADDLE_HALF_LENGTH ) && ( ball.pos.y >  paddle.pos.y - PADDLE_HALF_LENGTH )) 
		ball.vel.x=-ball.vel.x;
	
}

function collisionRight(ball,paddle){
	if( ball.pos.x + BALL_RADIUS >(canvas.width-9 - 2* PADDLE_HALF_BREADTH ) &&  (ball.pos.y < paddle.pos.y + PADDLE_HALF_LENGTH ) && ( ball.pos.y >  paddle.pos.y - PADDLE_HALF_LENGTH )) 
		ball.vel.x=-ball.vel.x;
	
}

function drawScore() {
    context.font = "bolder 20px Arial";
    context.fillStyle = "#FFFFFF";
	
    context.fillText("Score:", 8, 30);
	context.fillText(score1, canvas.width/4+0, 30)
	context.fillText(score2, canvas.width*3/4, 30)
	
	
	
}

function intelligentPlay(ball,cpuPaddle){
	if (ball.vel.y > 0) {
		cpuPaddle.velY =Math.abs(cpuPaddle.velY);
	} else {
		cpuPaddle.velY = -1 * Math.abs(cpuPaddle.velY);
	}
}

cpuPaddle.move = function(nSecsPassed, ball) {
	if (ball.pos.y > cpuPaddle.pos.y) {
		cpuPaddle.moveDown(nSecsPassed);
	} else if (ball.pos.y < cpuPaddle.pos.y) {
		cpuPaddle.moveUp(nSecsPassed);
	}
}

function updateGameState() {
	ball.handleCollisionsWithWall();
	playerPaddle.tryToHitBall(ball);
	cpuPaddle.tryToHitBall(ball);

	var now = new Date().getTime();
	var nSecsPassed = (now - lastDrawnTime) / 1000;
	// var nSecsPassed = 1 / 60;

	if (!(upPressed && downPressed)) {
		if (upPressed) {
			playerPaddle.moveUp(nSecsPassed);
		} else if (downPressed) {
			playerPaddle.moveDown(nSecsPassed);
		}
	}
	cpuPaddle.move(nSecsPassed, ball);

	var ret = ball.move(nSecsPassed, cpuPaddle, playerPaddle);

	if (ret) {
		return true;
	} else {
		return false;
	}
}

function drawGameState() {
	drawBoard();
	// drawScore();
	ball.draw();
	// intelligentPlay(ball,cpuPaddle);
	// cpuPaddle.move();
	// playerPaddle.move2();
	// collisionLeft(ball,cpuPaddle);
	// collisionRight(ball,playerPaddle);
	// cpuPaddle.draw();
	
	playerPaddle.draw();
	cpuPaddle.draw();
	
	lastDrawnTime = new Date().getTime();
}

drawGameState();
var lastDrawnTime = new Date().getTime();

window.main = function() {
	window.requestAnimationFrame(main);

	if (updateGameState()) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawGameState();
	} else {
		//alert("LOST GAME OVER");
		//document.location.reload();
		ball = new Ball(BALL_START_POS, BALL_START_VEL);
		// ball.pos.x=canvas.width / 2;
		// ball.pos.y=BALL_RADIUS+50;
		// cpuPaddle.pos.x=9;
		// cpuPaddle.pos.y=canvas.height / 2;
		playerPaddle = new Paddle(PLAYER_PADDLE_START_POS);
		// playerPaddle.pos.x=canvas.width - 1 - 9;
		// playerPaddle.pos.y=canvas.height / 2;
		// ball.vel.x=5*turn;
		// ball.vel.y=5;
		turn=-turn;
	}
}

main();
