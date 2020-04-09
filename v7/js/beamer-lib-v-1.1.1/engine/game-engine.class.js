var Position = "";
var GameEntity = "";
var Tile = "";

if(typeof module !== "undefined") 
{
    Position = require("./position.class.js");
    GameEntity = require("./game-entity.class.js");
    Tile = require("./game-tile.class.js");
}

function GameEngine()
{
    this.loopInterval = "";
    this.keepRendering = false;
    this.canvas = "";

    this.offscreenOffsetX = 0;
    this.offscreenOffsetY = 0;

    this.lastCalledTime = Date.now();
    this.fps = 0;
    this.targetFps = 60;

    this.lastMouseClick = {x:0,y:0};
    this.lastMouseMoved = [];

    this.entity = [];
    this.tiles = [];

    this.viewX = 0;
    this.viewY = 0;
    this.viewScale = .7;
    this.panX = 0;
    this.panY = 0;
    this.panning = false;

    this.performScaling = false;

    this.autoSelectChar = true;
    this.showDebug = false;
    this.showFps = true;
    this.showWalkableMap = true;
    this.showTileMap = false;

    this.debugOptions = {"show-mouse-click": false,"show-mouse-move": false, "show-walkable": false}
    this.tempPath = [];
    this.tempWalkableMap = [];
    this.logo = "";
    this.gameMenu = [];
    this.selectedEntityIdx = -1;
    
    this.tileMap = [];
    this.tileMapWidth = 0;
    this.tileMapHeight = 0;
    this.tileMapTileSize = 64;


    this.init = function(options)
    {
        this.tileMapWidth = this.isNull(options.tileMapWidth, 50);
        this.tileMapHeight = this.isNull(options.tileMapHeight, 50);
        this.tileMapTileSize = this.isNull(options.tileMapTileSize, 64);

        this.tileMap = new Array(this.tileMapHeight);
        
        for(var x = 0;x<this.tileMapWidth;x++)
        {
            this.tileMap[x] = new Array(this.tileMapWidth);

            for(var y = 0;y<this.tileMapHeight;y++)
            {
                this.tileMap[x][y] = x + "," + y;
            }
        }
        

        console.log("game engine initialized");

    }



    this.addCanvas = function(canvasID)
    {
        this.canvas = document.getElementById(canvasID);
    
        this.orientationChange();

        this.resizeCanvas();
       
    }

    this.setLogo = function(imgSrc)
    {
        assets.addAsset({key: 'logo',imgSrc: imgSrc});
    }
    
    
    this.addMenu = function(menu)
    {
        var html = "<div class='menu floater' onclick='gameEngine.toggleMenu();' style='top:0px; left:" + (screen.width-60) + "px'></div>";
        var d = document.getElementById("gameHtmlObjs");
        d.innerHTML+=html;
        this.gameMenu = menu;
    }

    this.addBottomMenu = function(menu)
    {
        for(var i=0;i<menu.length;i++)
        {
            var html = "<div class='footer-card' onclick=\"" + menu[i].call + "\">" + menu[i].label + "</div>";
            var d = document.getElementById("footer-cards");
            d.innerHTML+=html;
        }
    }

    this.toggleMenu = function()
    {
        if(document.getElementById("menu-contents").innerHTML == "")
        {
            this.openMenu();
        }
        else
        {
            this.closeMenu();
        }
    }
    this.openMenu = function()
    {
        var html = "";
        for(var i=0;i<this.gameMenu.length;i++)
        {
            html+="<div class='menu-item' onclick=\"" + this.gameMenu[i]["call"] + "\">" + this.gameMenu[i]["label"] + "</div>";
        }

        document.getElementById("menu-contents").innerHTML = html;
    }


    this.closeMenu = function()
    {
        document.getElementById("menu-contents").innerHTML = "";
    }

    this.clearAll = function()
    {
        this.entity = [];
        this.tiles = [];
    }

    this.addEntity = function(options)
    {
        this.syncEntity(options);
    }

    this.syncEntity = function(options)
    {
        var entityFound = false;
        for(var i=0;i<this.entity.length;i++)
        {
            if(options.entityID == this.entity[i].entityID)
            {
                this.entity[i].sync(options);
                entityFound = true;
                return;
            }
        }
        
        if(!entityFound)
        {
            var e = new GameEntity(options);
            e.sync(options);
            e.entityIdx = this.entity.length;
            this.entity.push(e);

            if(!this.runningOnServer && e.ownerID == user.userID && this.selectedEntityIdx <= 0)
            {
                this.setSelectedEntityIdx(this.entity.length-1);
            }
        }
    }


    this.zoom = function(zoomAmt)
    {
        gameEngine.performScaling = true;
        gameEngine.viewScale+= zoomAmt;
        console.log("zoomed amt:" + zoomAmt + " : viewScale:" + gameEngine.viewScale);
    }

    this.render = function()
    {
        

        var canvas = gameEngine.canvas;
        var context = canvas.getContext("2d");
        context.clearRect(0,0,canvas.width, canvas.height);     
        context.fillStyle = "green";
        context.fillRect(0,0,canvas.width, canvas.height);
        
        context.save();
        context.scale(gameEngine.viewScale, gameEngine.viewScale);
        context.translate(gameEngine.panX, gameEngine.panY);
        
        for(var i=0;i<gameEngine.tiles.length;i++)
        {
            //gameEngine.tiles[i].update();
            gameEngine.tiles[i].render(context, gameEngine.viewX, gameEngine.viewY, {});

            if(gameEngine.debugOptions["show-walkable"])
            {
                if(!gameEngine.tiles[i].isWalkable)
                {
                    context.fillStyle = "red";
                    context.fillRect(gameEngine.tiles[i].drawX(),gameEngine.tiles[i].drawY(), gameEngine.tiles[i].tileWidth, gameEngine.tiles[i].tileHeight);
                }

            }
    
        }


        for(var i=0;i<gameEngine.entity.length;i++)
        {
            if(!this.runningOnServer) gameEngine.entity[i].update(gameEngine);
            gameEngine.entity[i].render(context, gameEngine.viewX, gameEngine.viewY);
        }

        gameEngine.debugRenderWalkableMap(context);
        


        if(gameEngine.tempPath.length > 0)
        {
            context.strokeStyle = "white";
            context.beginPath();
			context.moveTo(gameEngine.tempPath[0][0],gameEngine.tempPath[0][1]);
            
            for(var i=0;i<gameEngine.tempPath.length;i++)
            {
				context.lineTo(gameEngine.tempPath[i][0], gameEngine.tempPath[i][1]);
                
            }
           
            context.stroke();
        }

        if(typeof play.render !== "undefined") play.render(context);
    
        context.restore();

        if(this.logo != "")
        {
            context.drawImage(assets.getImg("logo").img, 0,0);
        }

        

        if(gameEngine.showDebug) gameEngine.renderDebug(context);

        if(gameEngine.showFps)
        {
            context.fillStyle = "white";
            context.font = "10px Arial";
            context.fillText("fps:" + Math.round(gameEngine.fps), canvas.width - 100, 15);
        } 

        
        if(!gameEngine.keepRendering)
        {
            if(this.loopInterval) clearInterval(this.loopInterval);
            //debug("Stopping rendering");
        }

        if(!gameEngine.lastCalledTime) 
        {
            gameEngine.lastCalledTime = Date.now();
            gameEngine.fps = 0;
         }
         else
         {
            var delta = (Date.now() - gameEngine.lastCalledTime)/1000;
            gameEngine.lastCalledTime = Date.now();
            gameEngine.fps = 1/delta;
         }
         



    }    

    this.debugRenderWalkableMap = function(context)
    {
        if(gameEngine.showTileMap)
        {       
            context.strokeStyle = "white";
            context.fillStyle = "white";
            context.font = "12px Arial";
            context.globalAlpha = .5;

            for(var y = 0;y<this.tileMapHeight;y++)
            {
                for(var x = 0;x<this.tileMapWidth;x++)
                {
                
                    var drawX = x * this.tileMapTileSize;
                    var drawY = y * this.tileMapTileSize;
                    context.fillText(x + "," + y, drawX, drawY + 10);
                    context.fillText(this.tileMap[x][y], drawX, drawY + 20);
                    context.fillText(drawX + "," + drawY, drawX, drawY + 30);
                    context.strokeRect(drawX, drawY, this.tileMapTileSize, this.tileMapTileSize);

                }
            }

            context.globalAlpha = 1;
            /*
            context.fillStyle = "white";
            var tileSize = 64;
            context.globalAlpha = .5;
            for(var x=0;x<gameEngine.tempWalkableMap.length;x++)
            {
                for(var y=0;y<gameEngine.tempWalkableMap[x].length;y++)
                {
                    context.strokeStyle = "white";
                    context.fillStyle = "white";
                    var drawX = y * tileSize;
                    var drawY = x * tileSize;
                    context.fillText(x + "," + y, x * tileSize, y * tileSize + 10);
                    context.fillText(drawX + "," + drawY, x * tileSize, y * tileSize + 20);
                    context.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize );

                    if(!gameEngine.tempWalkableMap[x][y].walkable == 1)
                    {
                        context.fillStyle = "red";
                        context.fillRect(drawX, drawY, tileSize, tileSize );
                        
                    }
                }
            }
            context.globalAlpha = 1;;
            */
        }
    }


    this.renderDebug = function(context)
    {
        //this is called from outside the object (window), don't refer to "this", use gameClient instead
        var drawX = gameEngine.canvas.width - 100;
        var drawY = gameEngine.canvas.height - 300;

        context.fillStyle = "#333";
        context.fillRect(drawX, drawY, 100, 100);
        drawX+=5;
        context.fillStyle = "white";
        context.font = "10px Arial";
        context.fillText("Debug", drawX, drawY+=15);
        context.fillText("FPS: " + Math.round(this.fps), drawX, drawY+=15);
        context.fillText("M: " + this.lastMouseClick.x + "," + this.lastMouseClick.y, drawX, drawY+=15);
        context.fillText("View: " + this.viewX + "," + this.viewY, drawX, drawY+=15);
        context.fillText("Pan: " + this.panX + "," + this.panY, drawX, drawY+=15);
        //context.fillText("Objs: " + this.entity.length, drawX, drawY+=15);

        if(this.debugOptions["show-mouse-click"])
        {
            context.fillStyle = "red";
            context.fillRect(this.lastMouseClick.x-10, this.lastMouseClick.y-10, 10,10);
        }

        if(this.debugOptions["show-mouse-move"])
        {
            for(var i=0;i<this.lastMouseMoved.length;i++)
            {
                context.fillStyle = "red";
                context.fillRect(this.lastMouseMoved[i].x-10, this.lastMouseMoved[i].y-10, 10,10);
            }
        }


     }



     this.setTileAt = function(tileSetKey, tileIdx, tileSize, tileX, tileY, isWalkable)
     {
         var drawX =  tileX * this.tileMapTileSize;
         var drawY = tileY * this.tileMapTileSize;
         
         var tileOptions = {
             tileSetKey: tileSetKey
           , pos: new Position({x:drawX, y: drawY})
           , tileIdx:tileIdx
           , tileDisplayWidth:this.tileMapTileSize
           , tileDisplayHeight:this.tileMapTileSize
           , tileSize:tileSize
           , isWalkable: isWalkable
           , label: ""};         
           
         var t = new Tile(tileOptions);
 
         this.tiles.push(t);

         console.log("tile added at " + tileX + "," + tileY + " at " + drawX + "," + drawY);
     }

     this.loadTileMapAt = function(startTileX,startTileY, tileSize, tileSetKey,  tileMap, isWalkable)
     {
        
         for(var x = 0;x<tileMap.length;x++)
         {
             for(var y = 0; y<tileMap[x].length;y++)
             {
                 
                 if(tileMap[x][y] > 0)
                 {
                     var isWalkable = false;
                     if(tileMap[x][y] == 10) isWalkable = true;

                     this.setTileAt(tileSetKey, tileMap[x][y], tileSize, startTileX + x, startTileY + y, isWalkable);
                     
                 }
             }
         }
     }


     this.startPanning = function()
     {
         this.panning = true;
     }

     this.stopPanning = function()
     {
         this.panning = false;
     }


     this.mouseMoved = function(mouseX, mouseY)
     {
        mouseX = mouseX/this.viewScale;
        mouseY = mouseY/this.viewScale;
        
        if(this.panning)
        {
            var amtToPanX = this.lastMouseClick.x - mouseX;
            var amtToPanY = this.lastMouseClick.y - mouseY;
            this.panX+=amtToPanX/4;
            this.panY+=amtToPanY/4;
            //this.panY = mouseY;
        }
        this.lastMouseMoved.push({x:mouseX,y:mouseY}); 
        play.mouseMoved(mouseX, mouseY);
     }

    
    this.mouseClicked = function(mouseX, mouseY)
    {
        var doubleClicked = false;
        
        var dis = this.getDistance(mouseX, mouseY, this.lastMouseClick.x, this.lastMouseClick.y);
        if(dis < 20)
        {
            doubleClicked = true;
        }
        this.lastMouseClick = {x:mouseX,y:mouseY};
        this.lastMouseMoved = [];


        mouseX = mouseX/this.viewScale;
        mouseY = mouseY/this.viewScale;


        if(mouseX > this.miniMapOriginX && mouseX < this.miniMapOriginX + this.miniMapWidth
            && mouseY > this.miniMapOriginY && mouseY <= this.miniMapOriginY + this.miniMapHeight)
        {
            play.miniMapClicked(mouseX, mouseY);
            debug("Mini Map Clicked at " + mouseX + "," + mouseY);

            return;
        }

        //adjust mouseXY to game coordinates
        var gameX = mouseX + this.viewX;
        var gameY = mouseY + this.viewY;

        var wasCharClicked = false;

        for(var i=0;i<this.entity.length;i++)
        {
            if(this.entity[i].collisionPointCheck(gameX, gameY))
            {
                console.log("Entity Clicked:" + i);

                if(this.autoSelectChar)
                {
                    if(this.entity[i].ownerID == user.userID)
                    {
                        this.setSelectedEntityIdx(i);
                    }
                }
                wasCharClicked = true;
                play.entityClicked(i);
               
            }
        }

        if(!wasCharClicked) 
        {
            play.emptySpaceClicked(mouseX, mouseY, doubleClicked);
            
        }

    }

    this.setSelectedEntityIdx = function(idx)
    {
        if(this.selectedEntityIdx >= 0)
        {
            this.entity[this.selectedEntityIdx].renderWayPoints = false;
        }

        this.selectedEntityIdx = idx;
        this.entity[this.selectedEntityIdx].renderWayPoints = true;
    }

    this.startRendering = function()
    {
        if(!this.keepRendering)
        {
            this.loopInterval = setInterval("window.requestAnimationFrame(gameEngine.render)",1000 / this.targetFps);
            this.keepRendering = true;
        }
    }

    this.stopRendering = function()
    {
        this.keepRendering = false;
        clearInterval(this.loopInterval);
    }


    this.getPointsAlongLine = function(startX, startY, endX, endY)
    {
        var out = [];

        for(var i=0;i<100;i++)
        {
            var x = Math.floor(startX + (endX - startX) * (i/100));
            var y = Math.floor(startY + (endY - startY) * (i/100));
            out.push({x:x,y:y});
        }

        return out;
    }

    this.findPath = function(startTileX, startTileY, endTileX, endTileY, tileSize, excludeEntityIdx)
    {
          var map = gameEngine.getWalkableTileMap(excludeEntityIdx);

        //console.log("map", map);

        var finder = new PF.DijkstraFinder();

        var path = finder.findPath(startTileX, startTileY, endTileX, endTileY, map);
        
        console.log("findPath(): path", path);
        //translate path
        var finalPath = new Array(path.length);
        for(var i=0;i<path.length;i++)
        {
            finalPath[i] = [path[i][0],path[i][1]];

        }
        console.log("findPath(): final-path", finalPath);

        return finalPath;

        var startTileX = Math.ceil(startX / tileSize);
        var startTileY = Math.ceil(startY / tileSize);
        var endTileX = Math.ceil(endX / tileSize);
        var endTileY = Math.ceil(endY / tileSize);


        if(endY > startY) startTileY+=1;
        if(endY < startY) startTileY-=1;
        var data = gameEngine.getWalkableTileMap(0,0,5000,5000, tileSize, excludeEntityIdx);//startX, startY, endX + 300, endY+300, tileSize, excludeEntityIdx);

        if(this.showWalkableMap) { this.tempWalkableMap = data.grid.nodes; }

        var finder = new PF.DijkstraFinder();
        
        var grid = data.grid;
        
        var path = finder.findPath(startTileX, startTileY, endTileX, endTileY, grid);
        
        //console.log("findPath(): path", path);

        return path;
    }

    this.getWalkableTileMap = function(startTileX, startTileY, endTileX, endTileY, excludeEntityIdx)
    {
        var grid = new PF.Grid(gameEngine.tileMapWidth, gameEngine.tileMapHeight);

        
        for(var y = 0;y<this.tileMapHeight;y++)
        {
            for(var x = 0;x<this.tileMapWidth;x++)
            {
            
                if(this.tileMap[x][y] > 0)
                {
                    grid.setWalkableAt(x, y, false);
                }
            }
        }

        
        for(var i=0;i<this.tiles.length;i++)
        {
            var tileX = this.tiles[i].pos.getTileX();
            var tileY = this.tiles[i].pos.getTileY();

            if(!this.tiles[i].isWalkable)
            {
                grid.setWalkableAt(tileX, tileY, false);
            }
        }


        for(var i=0;i<this.entity.length;i++)
        {
            var tileX = this.entity[i].pos.getTileX();
            var tileY = this.entity[i].pos.getTileY();

            grid.setWalkableAt(tileX, tileY, false);
        }
        return grid;

/*
        var width = endX - startX;
        var height = endY - startY;
        var mapWidth = Math.floor(width/tileSize);
        var mapHeight = Math.floor(height/tileSize);

        var grid = new PF.Grid(mapWidth, mapHeight);
        var map = [];

        for(var x=0;x<mapWidth;x++)
        {
            for(var y=0;y<mapHeight;y++)
            {
                var x2 = startX + x * tileSize;
                var y2 =  startY + y * tileSize;
                var isEmpty = gameEngine.isEmptySpot(x2,y2, tileSize, tileSize, excludeEntityIdx);

                if(!isEmpty)
                {
                    //grid.setWalkableAt(x, y, false);
                    grid.setWalkableAt(x,y, false);
                    //console.log(x + "," + y + ": not walkable (" + x2 + "," + y2 + ")");
                }
            }
        }

        return {"grid":grid,"map":map};
*/

        /*
        var grid = new PF.Grid(endX-startX, endY-startY);

        for(var i=0;i<gameEngine.tiles.length;i++)
        {
            if(gameEngine.tiles[i].collisionCheck(startX, startY, width, height))
            {
                var t = gameEngine.tiles[i];
                if(!t.isWalkable || true)
                {
                    for(var x=t.pos.x;x<t.pos.x + t.tileWidth;x++)
                    {
                        for(var y=t.pos.y;y<t.pos.y + t.tileHeight;y++)
                        {
                            if(x < grid.width && y < grid.height)
                            {
                                grid.setWalkableAt(x, y, false);
                            }
                        }
                    }
                }
            }
        }
        */

        return grid;
   
    }



    this.getNearestEnemy = function(currEntityIdx)
	{
        var out = -1;
        var minDistance = 99999;

        var attacker = this.entity[currEntityIdx];

        for(var i=0;i<this.entity.length;i++)
        {
            if(attacker.ownerID != this.entity[i].ownerID && this.entity[i].isAlive())
            {
                var d = this.getDistance(this.entity[i].pos.x, this.entity[i].pos.y, attacker.pos.x, attacker.pos.y);

                if(d < minDistance)
                {
                    out = i;
                    minDistance = d;
                }
            }
        }

        return {"targetEntityIdx":out,"distance": minDistance};
	}




    this.orientationChange = function() {

        switch(window.orientation) {  
        case -90 || 90:
            debug("Landscape Detected");
            gameEngine.resizeCanvas({canvasID:this.canvasID});
            break; 
        default:
            debug("Portrait Detected");
            gameEngine.resizeCanvas({canvasID:this.canvasID});
            break; 
        }
    }

    this.resizeCanvas = function() 
    {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    ///////////////////////////////////////////////////////////////////////////////
    //
    // Drawing functions
    //
    ///////////////////////////////////////////////////////////////////////////////
    this.drawEllipseByCenter = function(ctx, cx, cy, w, h) 
    {
        gameEngine.drawEllipse(ctx, cx - w/2.0, cy - h/2.0, w, h);
    }
      
    this.drawEllipse = function(ctx, x, y, w, h) 
    {
        var kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle
      
        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        //ctx.closePath(); // not used correctly, see comments (use to close off open path)
        ctx.fill();
    }
    
    
    ///////////////////////////////////////////////////////////////////////////////
    //
    // Debug functions
    //
    ///////////////////////////////////////////////////////////////////////////////

    this.toggleEntityDataForAll = function()
    {
        for(var i=0;i<this.entity.length;i++)
        {
            this.entity[i].toggleEntityData();
        }
    }

    ///////////////////////////////////////////////////////////////////////////////
    //
    // Collision, object detection, mapping functions
    //
    ///////////////////////////////////////////////////////////////////////////////

    this.getRandomEmptySpot = function(minX, minY, maxX, maxY, width, height)
    {
        var p = {x:0,y:0};
        for(var i=0;i< 10;i++)
        {
            p.x = this.getRandomNumber(minX, maxX);
            p.y = this.getRandomNumber(minY, maxY);

            if(this.isEmptySpot(p.x, p.y, width, height, -1))
            {
                return p;
            }
        }

        return p;
    }

    this.isEmptySpot = function(x1, y1, width, height, excludeEntityIdx)
    {
        for(var i=0;i<this.entity.length;i++)
        {
            var collision =  this.entity[i].collisionCheck(x1, y1, width, height);
            if(i != excludeEntityIdx && collision)
            {
                return false;                
            }
        }

        for(var i=0;i<this.tiles.length;i++)
        {
            //if(x1 == 128 && y1 == 128)
            //{
            //    console.log("..." + i + ": " + this.tiles[i].collisionCheck(x1, y1, width, height) + " tile.isWalkable:" + this.tiles[i].isWalkable);
            //    console.log("..." + this.tiles[i].pos.x + "," + this.tiles[i].pos.y);
            //}

            if(this.tiles[i].collisionCheck(x1, y1, width, height))
            {
                //console.log(this.tiles[i]);
                if(x1 == 300) console.log(this.tiles[i].pos.x + "," + this.tiles[i].pos.y + " - "  + this.tiles[i].isWalkable + " idx:" + i + ":" + this.tiles[i].tileSetKey);
                return false;                
            }
        }


        return true;
    }





    ///////////////////////////////////////////////////////////////////////////////
    //
    // Utility functions
    //
    ///////////////////////////////////////////////////////////////////////////////
    this.getRandomNumber = function(min, max) 
    { 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }


    this.getDistance = function(x1,y1, x2, y2)
    {
        var a = x1 - x2
        var b = y1 - y2
        
        return Math.sqrt( a*a + b*b );    
    }
    
	this.isNull = function(val, defaultVal)
	{
		if(val) return val;

		return defaultVal;
    }
    

    this.toggleShowWalkableMap = function()
    {
        if(this.showWalkableMap)
        {
            this.showWalkableMap = false;
        }
        else
        {
            this.showWalkableMap = true;
        }
    }
    this.toggleDebug = function()
    {
        if(this.showDebug)
        {
            this.showDebug = false;
        }
        else
        {
            this.showDebug = true;
        }
    }


    this.toggleFps = function()
    {
        if(this.showDebug)
        {
            this.showDebug = false;
        }
        else
        {
            this.showDebug = true;
        }
    }
    
    
}


if(typeof module !== "undefined") module.exports = GameEngine;