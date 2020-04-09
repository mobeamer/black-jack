
function Tile(options)
{
    this.pos          = options.pos;
    this.tileDisplayWidth    = options.tileDisplayWidth;
    this.tileDisplayHeight   = options.tileDisplayHeight;
    this.label        = options.label;
    this.tileSize     = options.tileSize;
    this.tileSetKey   = options.tileSetKey;
    this.tileIdx      = options.tileIdx;
    this.isWalkable   = options.isWalkable;

    this.debug        = false;
    this.debugOptions = {
                          showTileBounds: false
                          ,showTileData: false
                        }
  
    this.render  = function (context, originX, originY, options)
    {
        var cropX = 0;
        var cropY = 0;
        var cropWidth = this.tileSize;
        var cropHeight = this.tileSize;


        if(this.tileIdx == 6)
        {
            cropY = this.tileSize * 2;
            cropX = 0;            
        }

        if(this.tileIdx == 7)
        {
            cropY = this.tileSize * 2;
            cropX = this.tileSize;            
        }

        if(this.tileIdx == 8)
        {
            cropY = this.tileSize * 2;
            cropX = this.tileSize *2;            
        }


        if(this.tileIdx == 9)
        {
            cropY = this.tileSize * 3;
            cropX = 0;            
        }

        if(this.tileIdx == 10)
        {
            cropY = this.tileSize * 3;
            cropX = this.tileSize;            
        }

        if(this.tileIdx == 11)
        {
            cropY = this.tileSize * 3;
            cropX = this.tileSize * 2;            
        }

        if(this.tileIdx == 12)
        {
            cropY = this.tileSize * 4;
            cropX = 0;            
        }

        if(this.tileIdx == 13)
        {
            cropY = this.tileSize * 4;
            cropX = this.tileSize;            
        }

        if(this.tileIdx == 14)
        {
            cropY = this.tileSize * 4;
            cropX = this.tileSize * 2;            
        }


        //context.drawImage(assets.getImg(this.tileSetKey).img, originX + this.drawX(), originY + this.drawY(),this.tileSize, this.tileSize);
        context.drawImage(assets.getImg(this.tileSetKey).img, cropX, cropY, cropWidth, cropHeight, this.drawX() - originX, this.drawY() - originY,this.tileDisplayWidth, this.tileDisplayHeight);
        
        //context.fillStyle = "white";
        //context.fillText("W:" + this.isWalkable, this.drawX() - originX, this.drawY() - originY);
        
    }

    this.drawX = function()
    {
        //return (this.tileX * this.tileSize/2) + (this.tileY * this.tileSize/2);
        return this.pos.x;
    }

    this.drawY = function()
    {
        //return (this.tileX * this.tileSize/4) - (this.tileY * this.tileSize/4);
        return this.pos.y;
    }

  
    this.centerDrawX = function() {return this.posX + this.tileSize/2}
    this.centerDrawY = function() {return this.posY + this.tileHeight/2;}

	this.collisionCheck = function(x1, y1, w1, h1)
	{
        

        if(this.isWalkable) return false;

		var x2 = this.pos.x;
		var y2 = this.pos.y;
		var h2 = this.tileSize;
		var w2 = this.tileSize;

		return !(
			((y1 + h1) < (y2)) ||
			(y1 > (y2 + h2)) ||
			((x1 + w1) < x2) ||
			(x1 > (x2 + w2))
		);
    }
    
    
	this.getState = function()
	{
		var out ={
            pos: this.pos
            ,tileWidth: this.tileWidth
            ,tileHeight: this.tileHeight
            ,tileIdx: this.tileIdx
            ,label : this.label
            ,tileSize: this.tileSize
            ,tileSetKey: this.tileSetKey
            ,isWalkable: this.isWalkable
                    
		};

		return out;
	}


}

if(typeof module !== "undefined") module.exports = Tile;
