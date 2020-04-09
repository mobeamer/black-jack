function Player(playerName, playerID,seatID)
{ 
    this.playerID = playerID;
    this.playerName = playerName;
    
    this.seatID = seatID;
    this.playerState = "betting";
    this.playerBank = 1000;
    this.defaultBetAmt = 10;
    this.currBetAmt = 10;
    this.moneyResult = "";
    
    this.handMsg = [];    
    this.handStatus = [];

    this.currHandIdx = 0;


    this.adjustBet = function(amt)
    {
        this.defaultBetAmt+=amt;

        if(this.defaultBetAmt <= 0)
        {
            this.defaultBetAmt = 10;
            gui.growl("Bet set to " + this.currBetAmt, 3);
        }

        if(this.defaultBetAmt > this.playerBank)
        {
            this.defaultBetAmt = this.playerBank;
            gui.growl("You can't bet more than you have!",3);
        }

        gui.growl("Betting " + this.defaultBetAmt, 3);

        this.currBetAmt = this.defaultBetAmt;

        play.updateDisplay();

    }

    this.adjustBankRoll = function(amt)
    {
        this.playerBank+=amt;

    }

    this.split = function()
    {
        
        play.dealNextCardTo(this.playerID);
        play.dealNextCardTo(this.playerID);
        var hand = play.getPlayerHand(this.playerID);
        this.splitHands = [];
        this.splitHands[0] = [hand[0],hand[2]];
        this.splitHands[1] = [hand[1],hand[3]];
        
    }

    this.doubleDown = function()
    {
        this.currBetAmt=this.currBetAmt * 2;
        gui.growl("Double Down, betting " + this.betAmt);
    }    

    this.getButtons = function()
    {
        var html = "";

        if(this.playerState == "waiting")
        {
            return "";
        }

        if(this.playerState == "betting")
        {
            html+="<button onclick='play.gotoNextPlayer()'>Ready</button>";
            html+="<button onclick='play.playerAdjustBet(" + this.playerID + ",10)'>Bet More</button>";
            html+="<button onclick='play.playerAdjustBet(" + this.playerID + ",-10)'>Bet Less</button>";
        }

        if(play.gameState == "player-drawing" && this.playerState != "waiting")
        {
            html+="<br><button onclick='play.playerHit(" + this.playerID + ")'>Hit</button>";
            html+="<button onclick='play.playerStand(" + this.playerID + ")'>Stand</button>";
        }


        return html;
    }

    this.renderToDiv = function(divID)
    {
        var html = document.getElementById("template-player-seat").innerHTML;

        html = html.replace("[ID]", this.playerName);
        
        html = html.replace("[BET_AMT]", this.currBetAmt);
        html = html.replace("[BANK]", this.playerBank);
        //html = html.replace("[MSG]", this.handMsg);
        html = html.replace("[BUTTONS]", this.getButtons());
        html = html.replace("[STATE]", this.playerState);
        

        var handHtml = "";
        
        var hands = play.getPlayerHand(this.playerID);
        
        //if(debug) console.log("hands", hands);

        if(hands.length > 0)
        {
            html = html.replace("[TOTAL]", play.getHandTotal(hands[this.currHandIdx]));
        }
        else
        {
            html = html.replace("[TOTAL]", "");
        }
        
        for(var i=0;i<hands.length;i++)
        {
            var style = "";

            if(hands[i][0].playerHandIdx == this.currHandIdx)
            {
                style+="background:#999999;";
            }

            handHtml+="<div style='display:inline-block;" + style + "'>";

            handHtml+= this.getHandHtml(hands[i]);

            handHtml+="<br>Hand " + (i+1);

            if(this.handMsg.length > 0) 
            {
                handHtml+="<br>" + this.handMsg[i];
            }
            
            handHtml+="</div>";
        }

        

        html = html.replace("[CARDS]", handHtml);

        document.getElementById(divID).innerHTML+=html;
        
    }

    this.getHandHtml = function(hand)
    {
        var handHtml = "";

        for(var i=0;i<hand.length;i++)
        {
            
            handHtml+= "<div class='div-blackjack-card-small'><img src='" + hand[i].imgPath + "' class='card-img-small'></div>";
        }

        return handHtml;
    }

















    this.renderHandSmall = function(divID)
    {
        var html = document.getElementById("template-mini-player-hand").innerHTML;

        html = html.replace("[ID]", this.playerID);
        html = html.replace("[TOTAL]", play.getPlayerTotal(this.playerID));
        html = html.replace("[BET_AMT]", this.currBetAmt);
        html = html.replace("[BANK]", this.playerBank);
        //html = html.replace("[MSG]", this.handMsg);

        var hand = play.getPlayerHand(this.playerID);

        var cardHtml = "";

        if(play.gameState == "betting")
        {
            cardHtml+= "<div class='div-blackjack-card-small'><img src='img/tiles/cards/gray_back.png' class='card-img-small'></div>";
            cardHtml+= "<div class='div-blackjack-card-small'><img src='img/tiles/cards/gray_back.png' class='card-img-small'></div>";
        }
        else
        {
                
            for(var i=0;i<hand.length;i++)
            {
                cardHtml+= "<div class='div-blackjack-card-small'><img src='" + hand[i].imgPath + "' class='card-img-small'></div>";
            }
        }

        html = html.replace("[CARDS]", cardHtml);

        document.getElementById(divID).innerHTML+=html;

    }

    this.renderHand = function(divID)
    {
        var html = document.getElementById("template-player-hand").innerHTML;

        html = html.replace("[ID]", this.playerID);
        html = html.replace("[TOTAL]", play.getPlayerTotal(this.playerID));
        html = html.replace("[BET_AMT]", this.currBetAmt);
        html = html.replace("[BANK]", this.playerBank);
        html = html.replace("[MSG]", this.handMsg);

        var cardHtml = "";

        if(play.gameState == "betting")
        {
            cardHtml+= "<div class='div-blackjack-card'><img src='img/tiles/cards/gray_back.png' class='card-img'></div>";
            cardHtml+= "<div class='div-blackjack-card'><img src='img/tiles/cards/gray_back.png' class='card-img'></div>";
        }
        else
        {
            if(this.splitHands.length > 0)
            {
                console.log("SPLIT HAND");
                for(var j=0;j<this.splitHands.length;j++)
                {
                    var hand = this.splitHands[j];

                    for(var i=0;i<hand.length;i++)
                    {
                        cardHtml+= "<div id='div-player-card-" + i + "' class='div-blackjack-card-small'><img src='" + hand[i].imgPath + "' class='card-img-small'></div>";
                    
                    }

                    cardHtml+="<div style='width:50px;display:inline-block;'>&nbsp;</div>";

                }
            }

            if(this.splitHands.length == 0)
            {
                var hand = play.getPlayerHand(this.playerID);

                for(var i=0;i<hand.length;i++)
                {
                    cardHtml+= "<div id='div-player-card-" + i + "' class='div-blackjack-card'><img src='" + hand[i].imgPath + "' class='card-img'></div>";
                
                }
            }
    
        }
        
        html = html.replace("[CARDS]", cardHtml);

        document.getElementById(divID).innerHTML = html;        
    }

    
    


}