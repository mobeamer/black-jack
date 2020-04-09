var targetFps = 60;
var loopInterval = "";
var keepRendering = true;
var lastCalledTime = Date.now();
var fps = 0;
var renderData = [];

function startRenderingLoop()
{
    loopInterval = setInterval("window.requestAnimationFrame(renderLoop)",1000 / targetFps);
}

function stopRenderingLoop()
{
    clearInterval(loopInterval);
}

function addRender(dataPacket)
{
    renderData.push(dataPacket);
}

function renderLoop()
{
    for(var i=0;i<renderData.length;i++)
    {
        var canvasID = renderData[i].canvasID;
        var canvas = document.getElementById(canvasID);
        var context = canvas.getContext("2d");
        context.clearRect(0,0,canvas.width, canvas.height);

        renderData[i].sprite.renderFrame(context,0,0);
        renderData[i].sprite.advanceFrame(fps);
    }
/*
    if(sprite != "")
    {
        for(var i=0;i<4;i++)
        {
            var canvas = document.getElementById("canvas-" + i);
            var context = canvas.getContext("2d");
            context.clearRect(0,0,canvas.width, canvas.height);
            context.fillStyle = "red";
            sprint[i].renderFrame(context);
            sprint[i].advanceFrame(fps);
        
            //context.drawImage(assets.getImg("img/sheets/body/male/dark.png").img, 0,0, 64,64,0,0,64,64);
        
            //context.font = "9px Arial";
            //context.fillStyle = "black";
            //context.fillText("fps: " + Math.round(fps,2), 3,10);
            
        }
    }
*/
    var delta = (Date.now() - lastCalledTime)/1000;
    lastCalledTime = Date.now();
    fps = 1/delta;


}