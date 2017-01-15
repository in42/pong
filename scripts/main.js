var canvas = document.getElementById("game-canvas");
canvas.focus();
var context = canvas.getContext("2d");

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// variables to check if the up or down keys are pressed or not
var upPressed = false;
var downPressed = false;

// object to hold all game variables
var game = {};
game.cpuScore=0;
game.playerScore=0;

var KEY_W = 87;
var KEY_S = 83;
var KEY_P = 80;
var KEY_R = 82;
var KEY_Q = 81;
var ARROW_UP = 26;
var ARROW_DOWN = 28;

function keyDownHandler(e) {
    if (e.keyCode == KEY_W) {
        window.upPressed = true;
    } else if (e.keyCode == KEY_S) {
        window.downPressed = true;
    } else if (e.keyCode == KEY_Q) {
		window.game.isRunning = !game.isRunning;
		if (window.game.isRunning == true) {
			window.game.drawGameState();
			$("#message").text("Score " + game.WINNING_SCORE + " to win!");
		} else {
			$("#message").text("Press Q to start.");
		}
	} else if (e.keyCode == KEY_R) {
		if (window.game.canStart == false) {
			window.game.canStart = true;
			window.game.startGame();
		}
	}
}

function keyUpHandler(e) {
    if (e.keyCode == KEY_W) {
        upPressed = false;
    } else if (e.keyCode == KEY_S) {
        downPressed = false;
    }
}

function Pos(x, y) {
	this.x = x;
	this.y = y;
}

function Velocity(vX, vY) {
	this.x = vX;
	this.y = vY;
}

game.BALL_RADIUS = 7;
game.ballWallCollisionSound = new Audio("sounds/ball_wall_collision.wav");

function Ball(pos, vel) {
	this.pos = Object.assign({}, pos);
	this.vel = Object.assign({}, vel);

	this.move = function(dt, leftPaddle, rightPaddle) {
		var ret = true;
		var dPos = new Pos(this.vel.x * dt, this.vel.y * dt);
		if (this.pos.x + game.BALL_RADIUS < 0) {
			game.cpuScore += 1;
			ret = false;
		} else if (this.pos.x - game.BALL_RADIUS >= canvas.width) {
			game.playerScore += 1;
			ret = false;
		}

		var canMoveNormally = true;
		if (canMoveNormally) {
			this.pos.x += dPos.x ;
			this.pos.y += dPos.y ;
		}

		return ret;
	}

	this.handleCollisionsWithWall = function () {
		if (this.pos.y <= game.BALL_RADIUS - 1 && this.vel.y < 0) {
			this.vel.y = -this.vel.y;
			game.ballWallCollisionSound.play();
		} else if (this.pos.y >= canvas.height - game.BALL_RADIUS &&
			this.vel.y > 0) {
			this.vel.y = -this.vel.y;
			game.ballWallCollisionSound.play();
		}
	}

	this.draw = function() {
		context.arc(this.pos.x, this.pos.y, game.BALL_RADIUS, 0, 2 * Math.PI);
		context.fillStyle = "white";		
		context.fill();
	}
}

game.PADDLE_HALF_BREADTH = 5;
game.PADDLE_HALF_LENGTH = 50;
game.PADDLE_VELOCITY_Y = 525;

game.paddleBallCollisionSound = new Audio("sounds/paddle_ball_collision.wav");

function Paddle(pos) {
	this.pos = Object.assign({}, pos);
	this.velY = game.PADDLE_VELOCITY_Y;

	// max angle the ball will bounce when hitting the paddle
	this.MAX_BALL_BOUNCE_ANGLE = Math.PI / 4;

	this.moveUp = function(dt) {
		var dy = this.velY * dt;
		if (this.pos.y - game.PADDLE_HALF_LENGTH - dy < 0) {
			this.pos.y = game.PADDLE_HALF_LENGTH;
		} else {
			this.pos.y -= dy;
		}
	}

	this.moveDown = function(dt) {
		var dy = this.velY * dt;
		if (this.pos.y + game.PADDLE_HALF_LENGTH + dy >= canvas.height) {
			this.pos.y = canvas.height - 1 - game.PADDLE_HALF_LENGTH;
		} else {
			this.pos.y += dy;
		}
	}

	this.tryToHitBall = function (ball) {
		if (this.pos.x < ball.pos.x) {
			if (ball.vel.x < 0 &&
					ball.pos.y >= this.pos.y - game.PADDLE_HALF_LENGTH &&
					ball.pos.y <= this.pos.y + game.PADDLE_HALF_LENGTH &&
					ball.pos.x - game.BALL_RADIUS <= this.pos.x +
						game.PADDLE_HALF_BREADTH) {
				this.handleCollision(ball);
			}
		} else {
			if (ball.vel.x > 0 &&
					ball.pos.y >= this.pos.y - game.PADDLE_HALF_LENGTH &&
					ball.pos.y <= this.pos.y + game.PADDLE_HALF_LENGTH &&
					ball.pos.x + game.BALL_RADIUS >= this.pos.x -
						game.PADDLE_HALF_BREADTH) {
				this.handleCollision(ball);
			}
		}
	}
	this.draw = function () {
		context.fillstyle = "white";
		context.fillRect(this.pos.x - game.PADDLE_HALF_BREADTH,
				this.pos.y - game.PADDLE_HALF_LENGTH,
				2 * game.PADDLE_HALF_BREADTH, 2 * game.PADDLE_HALF_LENGTH);
	}

	this.calculateBounceAngle = function (ball) {
		var relativeIntersectionY = this.pos.y - ball.pos.y;
		var normalizedRelativeIntersectionY =
			relativeIntersectionY / (game.PADDLE_HALF_LENGTH);
		var bounceAngle = this.MAX_BALL_BOUNCE_ANGLE *
			normalizedRelativeIntersectionY;
		return bounceAngle;
	}

	this.handleCollision = function (ball) {
		var angle = this.calculateBounceAngle(ball);
		// var ballSpeed =
		// 	Math.sqrt(ball.vel.x * ball.vel.x +
		// 			ball.vel.y * ball.vel.y);
		var hitSpeed = 800;
		ball.vel.x = -Math.sign(ball.vel.x) * hitSpeed *
			Math.cos(angle);
		ball.vel.y = -hitSpeed * Math.sin(angle);
		// ball.vel.x = -ball.vel.x;
		game.paddleBallCollisionSound.play();
	}
}

game.PADDLE_DIST_FROM_END = 40;
// We are maintaing the centre of the ball in {pos}
game.BALL_START_POS = new Pos(canvas.width / 2, canvas.height / 2);
// We are maintaining the centre of the rectangle in { pos}
game.CPU_PADDLE_START_POS = new Pos(canvas.width - 1 - game.PADDLE_DIST_FROM_END,
	canvas.height / 2); 
game.PLAYER_PADDLE_START_POS =
	new Pos(game.PADDLE_DIST_FROM_END, canvas.height / 2);
game.BALL_START_SPEED = 350;

game.ball = null;
game.cpuPaddle = null;
game.playerPaddle = null;

game.initBoard = function () {
	this.ballStartVel = new Velocity(-game.BALL_START_SPEED, 0);
	this.ball = new Ball(this.BALL_START_POS, this.ballStartVel);
	this.cpuPaddle = new Paddle(this.CPU_PADDLE_START_POS);
	this.playerPaddle = new Paddle(this.PLAYER_PADDLE_START_POS);
	this.cpuPaddle.dir = 0;
	this.cpuPaddle.takeDecision = function (ball) {
		if (ball.pos.y > this.pos.y - game.PADDLE_HALF_LENGTH / 2 &&
				ball.pos.y < this.pos.y + game.PADDLE_HALF_LENGTH / 2) {
			this.dir = 0;
		} else if (this.pos.x < ball.pos.x && ball.vel.x < 0 ||
				this.pos.x > ball.pos.x && ball.vel.x > 0) {
			if (ball.pos.y > this.pos.y) {
				this.dir = -1;
			} else if (ball.pos.y < this.pos.y) {
				this.dir = 1;
			}
		} else {
			this.dir = 0;
		}
	}

	this.cpuPaddle.move = function(nSecsPassed) {
		if (this.dir > 0) {
			this.moveUp(nSecsPassed);
		} else if (this.dir < 0){
			this.moveDown(nSecsPassed);
		}
	}
}


game.drawBoard = function () {
	context.beginPath();
	context.strokeStyle = "white";
	context.moveTo(canvas.width / 2, 0);
	context.lineTo(canvas.width / 2, canvas.height - 1);
	context.moveTo(canvas.width / 2 - 1, canvas.height - 1);
	context.lineTo(canvas.width / 2 - 1, 0);
	context.stroke();
	context.closePath();
}

game.drawScore = function () {
    context.font = "bolder 80px Arial";
    context.fillStyle = "white";
	
	context.fillText(game.playerScore, canvas.width / 4 - 30, 330)
	context.fillText(game.cpuScore, canvas.width * 3 / 4 - 30, 330)
}

game.N_FRAMES_BETWEEN_CPU_DECISION = 12;
game.n_frames_from_last_decision = 0;

game.updateGameState = function () {
	this.ball.handleCollisionsWithWall();
	this.playerPaddle.tryToHitBall(this.ball);
	this.cpuPaddle.tryToHitBall(this.ball);

	var now = new Date().getTime();
	var nSecsPassed = (now - this.lastDrawnTime) / 1000;
	// var nSecsPassed = 1 / 60;

	if (!(upPressed && downPressed)) {
		if (upPressed) {
			this.playerPaddle.moveUp(nSecsPassed);
		} else if (downPressed) {
			this.playerPaddle.moveDown(nSecsPassed);
		}
	}

	if (this.n_frames_from_last_decision % this.N_FRAMES_BETWEEN_CPU_DECISION == 0) {
		this.cpuPaddle.takeDecision(this.ball);
		this.n_frames_from_last_decision = 1;
	} else {
		this.n_frames_from_last_decision++;
	}

	this.cpuPaddle.move(nSecsPassed);

	var ret = this.ball.move(nSecsPassed, this.cpuPaddle, this.playerPaddle);

	if (ret) {
		return true;
	} else {
		return false;
	}
}

game.lastDrawnTime = null; 
game.drawGameState = function () {
	context.clearRect(0, 0, canvas.width, canvas.height);
	this.drawBoard();
	this.drawScore();
	this.ball.draw();
	this.playerPaddle.draw();
	this.cpuPaddle.draw();

	this.lastDrawnTime = new Date().getTime();
}

// game.drawGameState();
game.turn = 1;

game.serve = function () {
	this.turn *= -1;
	this.ballStartVel.x *= this.turn;
	// this.BALL_START_POS.x += this.turn * 40;
	this.ball = new Ball(this.BALL_START_POS, this.ballStartVel);
	this.isRunning = true;
	game.drawGameState();
}

game.isRunning = true;
game.nextServe = function () {
	game.ball.vel = new Velocity(0, 0);
	setTimeout(function() {
		window.game.serve();
	}, 500);
}

game.WINNING_SCORE = 7;

game.startGame = function () {
	this.initBoard();
	this.turn = 1;
	this.n_frames_from_last_decision = 0;
	this.isRunning = true;
	this.cpuScore=0;
	this.playerScore=0;
	this.drawGameState();
	this.winner = null;
	this.isRunning = false;
	$("#message").text("Press Q to start.");
}

game.canStart = true;
game.startGame();

game.nextGame = function(previousWinner) {
	this.winner = previousWinner;
	setTimeout(function() {
		if (window.game.winner == "player") {
			$("#message").text("You won! Press R to start a new game");
		} else {
			$("#message").text("You lost! Press R to start a new game");
		}
		window.game.canStart = false;
	}, 10);
}

window.main = function () {
	window.requestAnimationFrame(main);
	if (game.canStart && game.isRunning) {
		var ret = game.updateGameState();
		game.drawGameState();
		if (!ret) {
			game.isRunning = false;
			if (game.playerScore == game.WINNING_SCORE) {
				game.nextGame("player");
			} else if (game.cpuScore == game.WINNING_SCORE) {
				game.nextGame("cpu");
			} else {
				game.nextServe();
			}
		}
	}

}

main();
