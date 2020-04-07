function Gui()
{
    this.growlerTimeout = "";

    this.setLogoHtml = function(html)
    {
        var d = document.getElementById("div-logo-panel");
        d.innerHTML = html;
    }

    
    this.showView = function(viewDivID)
    {
        var i;
        var x = document.getElementsByClassName("view");
        for (i = 0; i < x.length; i++) 
        {
            x[i].style.display = "none"; 
        }
        var d = document.getElementById(viewDivID);
        
        if(d)
        {
            document.getElementById(viewDivID).style.display = "block"; 
        }
        else
        {
            debug("Something went wrong...(view:" + viewDivID + " not found)");
        }        

        debug("showView(" + viewDivID + ")");


    }

    this.addButton = function(label, action)
    {
        var html = "<div class='footer-card' onclick=\"" + action + "\">" + label + "</div>";

        document.getElementById("footer-cards").innerHTML+= html;
    }

    this.clearButtons = function()
    {
        document.getElementById("footer-cards").innerHTML = "";
    }

    this.growl = function(msg, secs)
    {
        var d = document.getElementById("div-pop-msg");
        d.innerHTML = msg;
        d.style.display = "inline-block";
        d.style.visibility = "visible";

        this.growlerTimeout = setTimeout("gui.hideGrowl()", secs * 1000);
        console.log("Growl:" + msg);
    }


    this.hideGrowl = function()
    {
        document.getElementById("div-pop-msg").style.visibility = "hidden";
        clearTimeout(gui.growlerTimeout);
    }

    this.closePopups = function()
    {
        var x = document.getElementsByClassName("panel");
        for (i = 0; i < x.length; i++) 
        {
            x[i].style.display = "none"; 
        }
    }

    this.setLoadingMsg = function(msg)
    {
        var d = document.getElementById("div-loading-msg");
        d.innerHTML = msg;
        this.debug(msg);
    }

    this.debug = function(msg)
    {
        console.log(msg);
    }

    
}
