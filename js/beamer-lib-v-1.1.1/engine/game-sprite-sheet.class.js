function SpriteSheet()
{
    this.frameWidth = 64;
    this.frameHeight = 64;
    this.frameX = 0;
    this.frameY = 2;
    this.maxFrameX = 6;
    this.frameDir = +1;
    this.fps = 50;
    this.frameCounter = 0;
    this.backAndForth = false;
    this.imgLayers = new Array();

    this.EAST_CLOSE_ATTACK = 7;
    this.WEST_CLOSE_ATTACK = 5;
    this.NORTH_CLOSE_ATTACK = 4;
    this.SOUTH_CLOSE_ATTACK = 6;

    this.renderFrame = function(context, drawX, drawY)
    {
        var cropX = this.frameWidth * (this.frameX);
        var cropY = this.frameHeight * this.frameY;

        for(var i=0;i<this.imgLayers.length;i++)
        {
            context.drawImage(assets.getImg(this.imgLayers[i]).img, cropX,cropY, this.frameWidth, this.frameHeight,drawX, drawY,this.frameWidth, this.frameHeight);
        }
        this.frameCounter++;
    }

    this.addSheet = function(imgKey)
    {
        this.imgLayers.push(imgKey);
        assets.addAsset({"key":imgKey, "imgSrc":imgKey});
    }

    this.advanceFrame = function(fps)
    {
        if(this.frameCounter > fps - this.fps)
        {
            this.frameCounter = 0;

            if(this.backAndForth)
            {
                if(this.frameX >= this.maxFrameX)
                {
                    this.frameDir = -1;
                }

                if(this.frameX <= 0)
                {
                    this.frameDir = +1;
                }

                this.frameX+=this.frameDir;
            }
            else
            {
                this.frameX++;
                if(this.frameX >= this.maxFrameX)
                {
                    this.frameX = 0;
                }    
            }
            
        }
    }
}