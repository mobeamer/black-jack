function Player(playerID)
{ 
    this.playerID = playerID;
    this.gameState = "";
    this.playerBank = 1000;
    this.defaultBetAmt = 10;
    this.currBetAmt = 10;
    this.moneyResult = "";
    this.handMsg = "";

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

    


    this.renderHandSmall = function(divID)
    {
        var html = document.getElementById("template-mini-player-hand").innerHTML;

        html = html.replace("[ID]", this.playerID);
        html = html.replace("[TOTAL]", play.getPlayerTotal(this.playerID));
        html = html.replace("[BET_AMT]", this.currBetAmt);
        html = html.replace("[BANK]", this.playerBank);
        html = html.replace("[MSG]", this.handMsg);

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
            var hand = play.getPlayerHand(this.playerID);

            for(var i=0;i<hand.length;i++)
            {
                cardHtml+= "<div id='div-player-card-" + i + "' class='div-blackjack-card'><img src='" + hand[i].imgPath + "' class='card-img'></div>";
            }
    
        }
        
        html = html.replace("[CARDS]", cardHtml);

        document.getElementById(divID).innerHTML = html;        
    }
    
}