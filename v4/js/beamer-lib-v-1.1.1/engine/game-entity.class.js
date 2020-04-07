var Position = "";
if(typeof module !== "undefined") 
{
	Position = require("./position.class.js");
}

/*
new GameEntity({
	entityID: 1
	,ownerID: 1
	,pos: new Position({x:100,y:100})
	,width: 32
	,height: 32 
	,speed: 1
	,velX: 0
	,velY:0
});
*/
function GameEntity(options)
{
	this.pos = options.pos;
	if(options.pos === undefined)
	{
		console.error("No pos defined for Game Entity: GameEntity:Line 23");
	}

	this.entityID = gameEngine.isNull(options.entityID,gameEngine.entity.length);
    this.ownerID = gameEngine.isNull(options.ownerID,-1);
	this.dest = this.pos;
	this.velX = gameEngine.isNull(options.velX,0);
	this.velY = gameEngine.isNull(options.velY,0);
	this.speed = gameEngine.isNull(options.speed,1);
	this.width = gameEngine.isNull(options.width,32);
	this.height = gameEngine.isNull(options.height,32);
	this.life = gameEngine.isNull(options.life,100);
	this.level = gameEngine.isNull(options.level,1);
	this.attackRange = gameEngine.isNull(options.attackRange,100);
	this.ai = gameEngine.isNull(options.ai, "");
	this.attackDamage = gameEngine.isNull(options.attackDamage, 1);

	this.runningOnServer = gameEngine.isNull(options.runningOnServer, false);
	

	this.sprite = options.sprite;

	this.wayPoints = new Array();
	this.wayPointIdx = 0;
	this.moveThroughWayPoints = true;
	
	
	this.damageTaken = 0;
	
	
	this.attackSpeed = 10;
	this.waitTicks = 0;
	this.isStuck = false;
	

	this.renderWayPoints = false;
	this.renderInfo = false;
	this.renderLOS = false;

	this.usingFrames  = true;
	this.currentFrame = 0;
    this.maxFramesPerRow = 3;
    this.nextFrameCounter = 0;
	this.numTicksBetweenFrames = 10;
	this.currAction = "N";
	this.isMoving = false;
	this.showAttackingAnimation = false;
	this.entityIdx = -1;
	this.targetEntityIdx = -1;
	this.isUpdating = false;

	this.sync = function(options)
	{
		//this.pos = options.pos;
		this.ownerID = options.ownerID;
		this.velX = options.velX;
		this.velY = options.velY;
		this.speed = options.speed;
		this.width = options.width;
		this.height = options.height;
		this.dest = this.isNull(options.dest, options.pos);
		this.sprite = options.sprite;
		this.attackRange = this.isNull(options.attackRange,0);
		this.life = this.isNull(options.life,10);
		this.level = this.isNull(options.level,1);
		this.damageTaken = this.isNull(options.damageTaken,0);
		this.attackDamage = this.isNull(options.attackDamage,0);
		this.ai = this.isNull(options.ai,'');
		this.currAction = options.currAction;
		this.targetEntityIdx = options.targetEntityIdx;
		this.sprite = options.sprite;
	}

	this.getState = function()
	{
		var out ={
			entityID: this.entityID
			,ownerID: this.ownerID
			,pos: this.pos
			,dest: this.dest
			,velX: this.velX
			,velY: this.velY
			,speed: this.speed
			,width: this.width
			,height: this.height
			,life: this.life
			,level: this.level
			,currAction: this.currAction
			,wayPoints : this.wayPoints
			,wayPointIdx : this.wayPointIdx
			,attackRange : this.attackRange
			,damageTaken: this.damageTaken
			,attackDamage: this.attackDamage
			,ai: this.ai
			,targetEntityIdx: this.targetEntityIdx
		};

		return out;
	}

	this.setTargetEnemyIdx = function (targetEntityIdx)
	{
		this.targetEntityIdx = targetEntityIdx;
	}


	this.isAlive = function()
	{
		return this.damageTaken < this.life;
	}

	this.getPosition = function()
	{
		var p = new Position({x:this.pos.x,y:this.pos.y});

		return p;
	}

	this.getColor = function()
	{
		if(this.ownerID == user.userID) return "blue";

		return "red";
	}

	this.addDest = function(destTileX, destTileY)
	{
		var startTileX = this.pos.getTileX();
		var startTileY = this.pos.getTileY();

		console.log("finding path from " + startTileX + "," + startTileY + " to " + destTileX + "," + destTileY);

		var path = gameEngine.findPath(startTileX, startTileY, destTileX, destTileY, this.entityIdx);

		for(var i=0;i<path.length;i++)
		{
			this.addWayPoint(new Position({x: path[i][0] * gameEngine.tileMapTileSize, y: path[i][1] * gameEngine.tileMapTileSize}));
		}
        //this.addWayPoints(path);
	}


	this.setDest = function(destX, destY)
	{
        var path = gameEngine.findPath(this.pos.x,this.pos.y,destX, destY, this.width, this.entityIdx);
        this.clearWayPoints();
        this.addWayPoints(path);
	}


	this.setDestClose = function(destX, destY)
	{
		this.dest = new Position({x:destX, y:destY});
	}

	this.startProcessing = function()
	{
		this.moveThroughWayPoints = true;
	}

	this.stopProcessing = function()
	{
		this.moveThroughWayPoints = false;
	}

	this.collisionPointCheck = function(x,y)
	{
		if(!this.isAlive()) return false;

		return x > this.pos.x 
				&& x < this.pos.x + this.width
				&& y > this.pos.y
				&& y < this.pos.y + this.height;
	}

	this.collisionCheck = function(x1, y1, w1, h1)
	{
		if(!this.isAlive()) return false;
		
		var x2 = this.pos.x + 3;
		var y2 = this.pos.y - 3;
		var h2 = this.height - 6;
		var w2 = this.width - 6;

		return !(
			((y1 + h1) < (y2)) ||
			(y1 > (y2 + h2)) ||
			((x1 + w1) < x2) ||
			(x1 > (x2 + w2))
		);
	}

	this.render = function(context, offsetX, offsetY)
	{
		if(!this.isAlive()) return;

		var drawX =  this.pos.x - offsetX;
		var drawY =  this.pos.y - offsetY;

		if(user.userID == this.ownerID)
		{
			context.fillStyle = "blue";
			gameEngine.drawEllipseByCenter(context, drawX + this.width/2, drawY + this.height , this.width, 10); 
		}

		if(this.entityIdx == gameEngine.selectedEntityIdx)
		{
			context.fillStyle = "yellow";
			gameEngine.drawEllipseByCenter(context, drawX + this.width/2, drawY + this.height , this.width, 10); 
		}

		
		var lifePct = (this.life-this.damageTaken)/this.life;
		var barWidth = this.width/2;
		context.fillStyle = "white";
		context.fillRect(drawX-1 + this.width/4, drawY + this.height + 1, barWidth+2, 5);
		context.fillStyle = "green";
		context.fillRect(drawX + this.width/4, drawY + this.height + 2, barWidth * lifePct, 3);

		context.fillStyle = "white";
		gameEngine.drawEllipseByCenter(context, drawX + this.width/4 - 5, drawY + this.height + 2 + 2 , 10, 10);
        context.fillStyle = "black";
		context.fillText(this.level, drawX + this.width/4 - 8, drawY + this.height + 2 + 5);
		

		if(this.sprite !== undefined)
		{
			this.drawCurrFrame(context, drawX, drawY);
			context.strokeStyle = "yellow";
			context.strokeRect(drawX, drawY, this.width, this.height);
			context.strokeRect(drawX + 6, drawY + 6, this.width - 12, this.height - 12);
		}
		else
		{
			context.fillStyle = "blue";
			context.fillRect(drawX, drawY, this.width, this.height);
		}


		if(this.renderWayPoints && this.wayPoints.length > 0)
		{
			context.strokeStyle = "white";
			context.setLineDash([3, 15]);
			context.beginPath();
			context.moveTo(this.pos.x + this.width/2, this.pos.y + this.height/2);
			

			for(var i=this.wayPointIdx;i<this.wayPoints.length;i++)
			{
				if(this.wayPoints[i].blocked)
				{
					context.stroke();		
					context.strokeStyle = "black";
					context.beginPath();
					context.moveTo(this.wayPoints[i-1].x + this.width/2, this.wayPoints[i-1].y+ this.height/2)
				}

				context.lineTo(this.wayPoints[i].x + this.width/2, this.wayPoints[i].y+ this.height/2);
				
			}
			context.stroke();

			context.setLineDash([]);
		}

		if(this.renderInfo)
		{
			var dX = drawX + this.width + 10;
			var dY = drawY;

			context.fillStyle = "black";
			//context.fillRect(drawX, drawY, 25, 40);
			//context.fillStyle = "white";
			context.fillText('EntityID: ' + this.entityID, dX + 5, dY+=10);
			context.fillText('OwnerID: ' + this.ownerID, dX + 5, dY+=10);
			context.fillText('Pos: ' + this.pos.x + "," + this.pos.y, dX + 5, dY+=10);
			context.fillText('Pos (S): ' + this.screenX() + "," + this.screenY(), dX + 5, dY+=10);
			context.fillText('Target: ' + this.targetEntityIdx, dX + 5, dY+=10);
			context.fillText('Action: ' + this.currAction, dX + 5, dY+=10);
			context.fillText('Wp: ' + this.wayPointIdx, dX + 5, dY+=10);
			context.fillText('Stuck: ' + this.isStuck, dX + 5, dY+=10);
		}

	}

	this.toggleEntityData = function()
	{
		if(this.renderInfo)
		{
			this.renderInfo = false;
		}
		else
		{
			this.renderInfo = true;
		}
	}
	
	this.getLastWayPoint = function()
	{
		if(this.wayPoints.length <= 0)
		{
			return this.pos;
		}

		return this.wayPoints[this.wayPoints.length-1];
	}

	this.drawCurrFrame = function(context, drawX, drawY)
    {
		//context.fillStyle = "red";
		//context.fillRect(drawX, drawY, this.width, this.height);

		this.sprite.renderFrame(context, drawX, drawY);
		if(this.currAction != '') 
		{
			this.sprite.advanceFrame(60);
		}
		else
		{
			this.sprite.frameY = 10;
		}
		if(this.currAction == 'E') this.sprite.frameY = 11;
		if(this.currAction == 'W') this.sprite.frameY = 9;
		if(this.currAction == 'S') this.sprite.frameY = 10;
		if(this.currAction == 'N') this.sprite.frameY = 8;
		if(this.currAction == 'F') 
		{
			if(gameEngine.entity[this.targetEntityIdx].pos.x > this.pos.x)
			{
				this.sprite.frameY = this.sprite.EAST_CLOSE_ATTACK;
			}

			if(gameEngine.entity[this.targetEntityIdx].pos.x < this.pos.x)
			{
				this.sprite.frameY = this.sprite.WEST_CLOSE_ATTACK;
			}

			if(gameEngine.entity[this.targetEntityIdx].pos.y < this.pos.y)
			{
				this.sprite.frameY = this.sprite.NORTH_CLOSE_ATTACK;
			}		

			if(gameEngine.entity[this.targetEntityIdx].pos.y > this.pos.y)
			{
				this.sprite.frameY = this.sprite.SOUTH_CLOSE_ATTACK;
			}					
		}
		

	}
	

	this.update = function()
	{ 

		if(!this.isAlive()) return;

		if(!this.isUpdating) return;

		if(this.waitTicks > 0)
		{
			this.waitTicks--;
			return;
		}

		var keepProcessing = true;

		if(this.ai != ""){ this.processAi();}

		if(keepProcessing){ keepProcessing = this.attack(); }

		if(keepProcessing){ keepProcessing = this.moveToDest(); }
		
		if(keepProcessing){ keepProcessing = this.processWayPoints(); }

	}



	this.stopAttacking = function(gameEngine)
	{
		this.currAction = "";

		if(this.targetEntityIdx >= 0)
		{
			gameEngine.entity[this.targetEntityIdx].currAction = "";
		}

		this.targetEntityIdx = -1;

	}

	this.attack = function()
	{
		var keepProcessing = true;

		if(this.targetEntityIdx >= 0)
		{
			
			var target = gameEngine.entity[this.targetEntityIdx];

			if(!target.isAlive())
			{
				this.targetEntityIdx = -1;
				this.currAction = "N";
				
			}

			if(target.isAlive())
			{

				var dis = gameEngine.getDistance(target.pos.x, target.pos.y, this.pos.x, this.pos.y);
				var dis2 = gameEngine.getDistance(target.pos.x + target.width/2, target.pos.y + target.height/2, this.pos.x + this.width/2, this.pos.y + this.height/2);

				if(dis <= this.attackRange)
				{
					//perform attack
					keepProcessing = false;
					console.log("fighting..." + this.entityIdx + "vs " + this.targetEntityIdx);
					play.fight(this.entityIdx, this.targetEntityIdx);
					this.currAction = "F";
					gameEngine.entity[this.targetEntityIdx].currAction = "F";

				}
				else
				{
					this.setDestClose(target.pos.x, target.pos.y);
					keepProcessing = true;
					this.currAction = "";
					gameEngine.entity[this.targetEntityIdx].currAction = "";
				}
			}
			
			
		}	

		return keepProcessing;
	}




	this.processAi = function()
	{
		if(this.ai == "attack")
		{
			var data = gameEngine.getNearestEnemy(this.entityIdx);
			var targetEntityIdx = data.targetEntityIdx;
			var distance = data.distance;
	
			if(targetEntityIdx >= 0)
			{
				gameEngine.entity[this.entityIdx].setTargetEnemyIdx(targetEntityIdx);
			}
		}

		if(this.ai == "roam")
		{
			if(this.isStuck)
			{
				this.clearWayPoints();
			}

			if((this.isAtDest() && !this.hasWayPointsLeft()) || this.isStuck)
			{
				var roamRange = 200;
				var numPointsToAdd = 4;
				
				for(var i=0;i<numPointsToAdd;i++)
				{
					var destMinX = this.pos.x - roamRange;
					var destMaxX = this.pos.x + roamRange;
					var destMinY = this.pos.y - roamRange;
					var destMaxY = this.pos.y + roamRange;
					var destX = gameEngine.getRandomNumber(destMinX, destMaxX);
					var destY = gameEngine.getRandomNumber(destMinY, destMaxY);
					this.addWayPoint({x:destX,y:destY});
				}
			}
		}
	}

	this.isAtDest = function()
	{

		if(Math.abs(this.dest.y - this.pos.y) <= 1 && Math.abs(this.dest.x - this.pos.x) <= 1)
		{
			return true;
		}

		return false;
	}

	
	this.isAtPos = function(x, y)
	{

		if(Math.abs(y - this.pos.y) <= 1 && Math.abs(x - this.pos.x) <= 1)
		{
			return true;
		}

		return false;
	}


	this.hasWayPointsLeft = function()
	{
		return this.wayPointIdx < this.wayPoints.length-1 && this.wayPoints.length > 0;
	}

	this.addWayPoints = function(points)
	{
		for(var i=0;i<points.length;i++)
		{
			this.wayPoints.push(new Position({x:points[i][0] - this.width/2, y:points[i][1] - this.height/2}));
			//this.wayPoints.push(new Position({x:points[i][0] , y:points[i][1] }));
		}
	}

	this.addWayPoint = function(p)
	{
		this.wayPoints.push(p);
	}

	this.clearWayPoints = function()
	{
		this.wayPointIdx = 0;
		this.wayPoints = new Array();
	}

	this.processWayPoints = function()
	{
		if(this.moveThroughWayPoints)
		{
			if(this.isAtDest() && this.wayPoints.length > 0 && this.isAtPos(this.wayPoints[this.wayPointIdx].x, this.wayPoints[this.wayPointIdx].y))
			{
				if(this.wayPoints.length-1 > this.wayPointIdx)
				{
					this.wayPointIdx++;
					this.dest = this.wayPoints[this.wayPointIdx];
				}
				else
				{
					this.clearWayPoints();
				}
			}
			else
			{
				if(this.wayPoints.length > 0)
				{
					this.dest = this.wayPoints[this.wayPointIdx];
				}
			}
		}
	}

	this.moveToDest = function()
	{

		if(this.dest.x != this.pos.x || this.dest.y != this.pos.y)
		{
			this.velX = 0;
			this.velY = 0;
			//console.log("Dest: " + this.dest.x + "," + this.dest.y);

			if(Math.abs(this.dest.x - this.pos.x) > 1)
			{
				if(this.dest.x > this.pos.x)
				{
					this.velX = 1;
				}

				if(this.dest.x < this.pos.x)
				{
					this.velX = -1;
				}
			}
			

			if(Math.abs(this.dest.y - this.pos.y) > 1)
			{
				if(this.dest.y > this.pos.y)
				{
					this.velY = 1;
				}

				if(this.dest.y < this.pos.y)
				{
					this.velY = -1;
				}
			}

		}

		//console.log("Vel: " + this.velX + "," + this.velY);
		var newX = this.pos.x + (this.velX * this.speed) ;
		var newY = this.pos.y + (this.velY * this.speed);
		this.pos.x =newX;
		this.pos.y = newY;

		//var isAvail = gameEngine.isEmptySpot(newX, newY, this.width, this.height, this.entityIdx);

/*		if(isAvail)
		{
			this.pos.x =newX;
			this.pos.y = newY;
			this.isStuck = false;
		}
		else
		{
			this.isStuck = true;
		}
*/
		//if(!this.inBattle(gameEngine))
		//{
			if(this.velX < 0)
			{
				this.currAction = "W";
			}
			
			if(this.velX > 0)
			{
				this.currAction = "E";
			}

			if(this.velY < 0)
			{
				this.currAction = "N";
			}

			if(this.velY > 0)
			{
				this.currAction = "S";
			}

			if(this.velX != 0 || this.velY !=0)
			{
				this.isMoving = true;
			}



		if(this.entityIdx == 1)
		{
			//console.log(this.pos.x + "," + this.pos.y + " vs " + this.dest.x + "," + this.dest.y + "");
		}

		if(this.isAtDest())
		{
			this.velX = 0;
			this.velY = 0;
			if(this.currAction != "F") this.currAction = "";
			this.isMoving = false;
		}

		return true;
	}

	this.inBattle = function(gameEngine)
	{
		if(this.targetEntityIdx >= 0 && this.withinAttackRange(gameEngine,this.targetEntityIdx)) return true;

		return false;
	}

	this.withinAttackRange = function(gameEngine,targetEntityIdx)
	{
		var target = gameEngine.entity[targetEntityIdx];

		var dis = gameEngine.getDistance(target.pos.x, target.pos.y, this.pos.x, this.pos.y);

		if(dis <= this.attackRange)
		{
			return true;
		}

		return false;
	}

	this.screenX = function()
	{
		return this.pos.x - gameEngine.viewX;
	}

	this.screenY = function()
	{
		return this.pos.y - gameEngine.viewY;
	}

	this.addWait = function(ticks)
	{
		if(this.waiTicks < 0) this.waitTicks=0;

		this.waitTicks+=ticks;
	}

	this.isNull = function(val, defaultVal)
	{
		if(val) return val;

		return defaultVal;
	}

}



if(typeof module !== "undefined") module.exports = GameEntity;