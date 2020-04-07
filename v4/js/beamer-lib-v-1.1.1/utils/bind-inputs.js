var debugBindInputs = false;

var xUp = null;
var yUp = null;
var xDown = null;                                                        
var yDown = null;                                                        
var xDiff = null;
var yDiff = null;

function bindInputs()
{
  document.addEventListener('touchstart', handleTouchStart, false);        
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('touchend', handleTouchEnd, false);
}

function canvasClicked(evt) 
{
    var canvas = document.getElementById('mainCanvas');
    var rect = canvas.getBoundingClientRect();
    var clickX = evt.clientX - rect.left;
    var clickY = evt.clientY - rect.top;

    debug("Clicked:" + clickX + "," + clickY);

    if(game)
    {
      play.mouseClicked(clickX, clickY);
    }

}




function canvasMouseMoved(evt) 
{
    var p = translateToScale(evt.clientX,evt.clientY);
    var clickX = p.x;
    var clickY = p.y;
  
    if(game)
    {
      play.mouseMoved(clickX, clickY);
    }

}
      


function handleTouchStart(evt) 
{      
  var p = translateToScale(evt.touches[0].clientX,evt.touches[0].clientY);
  xDown = p.x;
  yDown = p.y;
  if(debugBindInputs)
  {
    console.log("Touch Start: " + xDown + "," + yDown);
    console.log("Touch Client:" + evt.touches[0].clientX + "," + evt.touches[0].clientY)
    console.log("Touch Screen:" + evt.touches[0].screenX + "," + evt.touches[0].screenY)
  };
  play.mouseClicked(xDown, yDown);
  
}; 

function handleTouchEnd(evt) 
{
    xDiff = null;
    yDiff = null;
    play.mouseMoveEnd(xUp, yUp);
}

function handleTouchMove(evt) 
{
    if ( ! xDown || ! yDown ) {
       return;
    }
     
    var p = translateToScale(evt.touches[0].clientX,evt.touches[0].clientY);
    
  
    xUp = p.x;                                    
    yUp = p.y;

    var keepGoing = gameEngine.mouseMoved(xUp, yUp);
   
    if(keepGoing)
    {

      var xDiff = xDown - xUp;
      var yDiff = yDown - yUp;
      if(xUp < 50 || xUp > window.innerWidth - 50 || yUp < 100 || yUp > window.innerHeight - 50)
      {
        //play.adjustMapOrigin(xDiff/4, yDiff/4);
        //console.log("controls.js: Diff:" + xDiff + "," + yDiff);
      }
    }
    
    //var originX-= xDiff/10;
    //var originY-= yDiff/10;
    //console.log(xDiff + "," + yDiff);

    return;



    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            debug("Left swipe");
            //setViewTile(viewTile.tileX + appOptions.swipeSpeed, viewTile.tileY);
            originX-=tileSize;
        } else {
            debug("Right swipe");
            originX+=tileSize;
            //setViewTile(viewTile.tileX - appOptions.swipeSpeed, viewTile.tileY);
        }                       
    } else {
        if ( yDiff > 0 ) {
            debug("Up swipe");
            originY-=tileSize;
            //setViewTile(viewTile.tileX, viewTile.tileY + appOptions.swipeSpeed);
        } else { 
            debug("Down swipe");
            originY+=tileSize;
            //setViewTile(viewTile.tileX, viewTile.tileY - appOptions.swipeSpeed);
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};




function translateToScale(x,y)
{
  var out = {x:x,y:y};
  
  //out.x = out.x * canvas.width / canvas.clientWidth;
  //out.y = out.y * canvas.height / canvas.clientHeight;
  
  return out;
}

