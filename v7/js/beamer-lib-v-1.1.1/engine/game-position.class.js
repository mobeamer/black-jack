function Position(options)
{
    this.x = options.x;
    this.y = options.y;
    this.blocked = options.blocked;

    this.getTileX = function()
    {
        return Math.ceil(this.x/gameEngine.tileMapTileSize);
    }

    this.getTileY = function()
    {
        return Math.ceil(this.y/gameEngine.tileMapTileSize);
    }

}

if(typeof module !== "undefined") module.exports = Position;