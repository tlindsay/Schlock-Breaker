//  ____       _     _            _    ____                 _             
// / ___|  ___| |__ | | ___   ___| | _| __ ) _ __ ___  __ _| | _____ _ __ 
// \___ \ / __| '_ \| |/ _ \ / __| |/ /  _ \| '__/ _ \/ _` | |/ / _ \ '__|
//  ___) | (__| | | | | (_) | (__|   <| |_) | | |  __/ (_| |   <  __/ |   
// |____/ \___|_| |_|_|\___/ \___|_|\_\____/|_|  \___|\__,_|_|\_\___|_|   
/////////////////////////////////////////////////////////////////////////
// Author: Patrick Lindsay

;(function() {
	var Game = function() {
		console.info('Welcome to Schlock Breaker');

		var self = this;

		var canvas   = document.getElementById('schlock-breaker');
		var screen   = canvas.getContext('2d');
		var gameSize = { x: canvas.width, y: canvas.height };

		this.gameSize = gameSize;
		this.gameOver = false;
		this.win 	  = false;
		this.bodies   = [];
		this.schlocks = [];

		this.addBody(new Player(this));
		this.addBody(new Ball(this));
		createSchlocks(this);

		var tick = function() {
			self.update();
			self.draw(screen, gameSize);
			if(self.gameOver === false && self.win === false)
				requestAnimationFrame(tick);
			else if(self.win === true)
				console.log('YOU WIN!');
			else
				console.error('Game Over');
		};

		tick();
	};

	Game.prototype = {
		update : function() {
			if(this.schlocks.length === 0) {
				this.win = true;
				return 0;
			} else {
				for(body in this.bodies) {
					this.bodies[body].update();
				}

				for(schlock in this.schlocks) {
					this.schlocks[schlock].update();
				}
			}
		},

		draw : function(screen, gameSize) {
			screen.clearRect(0, 0, gameSize.x, gameSize.y);

			for(schlock in this.schlocks) {
				drawRect(screen, this.schlocks[schlock]);
			}

			for(body in this.bodies) {
				drawRect(screen, this.bodies[body]);
			}
		},

		addBody : function(body) {
			this.bodies.push(body);
		},

		addSchlock : function(body) {
			this.schlocks.push(body);
		}
	};

	var Player = function(game) {
		this.game   = game;
		this.size   = { x: 100, y: 15 };
		this.center = { x: this.game.gameSize.x / 2, y: this.game.gameSize.y - 75 };

		this.keyboarder = new Keyboarder();
	}

	Player.prototype = {
		update : function() {
			var speed = 15;
			if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && this.center.x >= this.size.x / 2)
				this.center.x -= speed;
			else if(this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && this.center.x <= this.game.gameSize.x - this.size.x / 2)
				this.center.x += speed;
		}
	};

	var Ball = function(game) {
		this.game   = game;
		this.size   = { x: 10, y: 10 };
		this.center = { x: this.game.gameSize.x / 2, y: this.game.gameSize.y / 2 };
		this.speed  = { x: 5, y: -5 };

		if(coinToss())
			this.speed.x = this.speed.x * -1;
	};

	Ball.prototype = {
		update : function() {
			if(this.center.x >= this.game.gameSize.x || this.center.x <= 0)
				this.speed.x *= -1;
			if(this.center.y <= 0 || colliding(this, this.game.bodies[0]))
				this.speed.y *= -1;
			else if(this.center.y >= this.game.gameSize.y)
				this.game.gameOver = true;

			for(schlock in this.game.schlocks) {
				if(collidingX(this, this.game.schlocks[schlock])) {
					this.speed.x *= -1;
					this.game.schlocks.splice(schlock, 1);
				} else if(collidingY(this, this.game.schlocks[schlock])) {
					this.speed.y *= -1;
					this.game.schlocks.splice(schlock, 1);
				}
			}

			this.center.x += this.speed.x;
			this.center.y += this.speed.y;
		}
	};

	var Schlock = function(game, x, y) {
		this.game = game;
		this.size = { x: 30, y: 10 };
		this.center = {x: x, y: y};
	}

	Schlock.prototype = {
		update : function() {

		}
	};

	var createSchlocks = function(game) {
		var y = 20;
		for(i = 0; i < 6; ++i) {
			var x = 24;
			for(j = 0; j < 12; ++j) {
				game.addSchlock(new Schlock(game, x, y));
				x += 32;
			}
			y += 15;
		}
	};

	var Keyboarder = function() {
		var keyState = {};

		window.addEventListener('keydown', function(e) {
			keyState[e.keyCode] = true;
		});

		window.addEventListener('keyup', function(e) {
			keyState[e.keyCode] = false;
		});

		this.isDown = function(keyCode) {
			return keyState[keyCode] === true;
		};

		this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 };
	};

	var drawRect = function(screen, body) {
		screen.fillRect(body.center.x - body.size.x / 2,
						body.center.y - body.size.y / 2,
						body.size.x,
						body.size.y);
	};

	var colliding = function(b1, b2) {
		return !(
		  b1 === b2 ||
			b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
			b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
			b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
			b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2
		);
	};

	var collidingX = function(b1, b2) {
		return (
			b1 !== b2 &&
			( b1.center.x + b1.size.x / 2 > b2.center.x - b2.size.x / 2 &&
			  b1.center.x - b1.size.x / 2 < b2.center.x + b2.size.x / 2 ) &&
			( b1.center.y > b2.center.y - b2.size.y / 2 &&
			  b1.center.y < b2.center.y + b2.size.y / 2 )
		);
	};

	var collidingY = function(b1, b2) {
		return (
			b1 !== b2 &&
			( b1.center.y + b1.size.y / 2 > b2.center.y - b2.size.y / 2 &&
			  b1.center.y - b1.size.y / 2 < b2.center.y + b2.size.y / 2 ) &&
			( b1.center.x < b2.center.x + b2.size.x / 2 &&
			  b1.center.x > b2.center.x - b2.size.x / 2 )
		);
	};

	var coinToss = function() {
		return Math.floor(Math.random() * 2) === 0;
	};

	window.addEventListener('load', function() {
		document.getElementById('schlock-breaker').addEventListener('click', function() {
			window.theGame = new Game();
		});
	});
})();