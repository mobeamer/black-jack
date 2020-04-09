function BlackJackGame()
{ 
    this.deck = [];    
    this.topOfDeckIdx = 0;
    this.debug = false;
    this.gameState = "";
    this.showDealerHand = false;
    this.defaultBetAmt = 10;
    this.betAmt = 10;
    this.playerBank = 100;
    this.moneyResult = "";

    this.initialize = function(options)
    {
        gui.setLogoHtml("Black Jack");

        gui.showView("view-black-jack");        

        var cardClasses = ["C","S","H","D"];
        
        for(var j=0; j<cardClasses.length;j++)
        {
            var cardClass = cardClasses[j];
            
            for(var i=2;i<11;i++)
            {
                var cardFace = i;
                var cardVal = i;
                var imgPath = "img/tiles/cards/" + cardFace + cardClass + ".png";
                var card = {"cardFace": cardFace, "cardClass":cardClass, "cardVal": cardVal, "imgPath": imgPath, "location":"deck", "splitHand": 0};
                this.deck.push(card);
            }

            var card = {"cardFace": "J",  "cardClass":cardClass, "cardVal": 10, "imgPath": "img/tiles/cards/J" + cardClass + ".png", "location":"deck", "splitHand": 0};
            this.deck.push(card);

            var card = {"cardFace": "Q",  "cardClass":cardClass, "cardVal": 10, "imgPath": "img/tiles/cards/Q" + cardClass + ".png", "location":"deck", "splitHand": 0};
            this.deck.push(card);

            var card = {"cardFace": "K",  "cardClass":cardClass, "cardVal": 10, "imgPath": "img/tiles/cards/K" + cardClass + ".png", "location":"deck", "splitHand": 0};
            this.deck.push(card);
            
            var card = {"cardFace": "A",  "cardClass":cardClass, "cardVal": 11, "imgPath": "img/tiles/cards/A" + cardClass + ".png", "location":"deck", "splitHand": 0};
            this.deck.push(card);

        }

        this.shuffle(this.deck);

        
        //Test: Double Down
        //this.deck[1] = {"cardFace": "9",  "cardClass":'C', "cardVal": 9, "imgPath": "img/tiles/cards/9C.png", "location":"deck", "splitHand": 0};
        //this.deck[3] = {"cardFace": "9",  "cardClass":'S', "cardVal": 9, "imgPath": "img/tiles/cards/9S.png", "location":"deck", "splitHand": 0};
        //this.deck[4] = {"cardFace": "9",  "cardClass":'S', "cardVal": 9, "imgPath": "img/tiles/cards/9S.png", "location":"deck", "splitHand": 0};
        //this.deck[5] = {"cardFace": "9",  "cardClass":'S', "cardVal": 9, "imgPath": "img/tiles/cards/9S.png", "location":"deck", "splitHand": 0};
       
        
        this.updateDisplay();

        
    }

    this.clearLastHand = function()
    {
        for(var i=0;i<=this.topOfDeckIdx;i++)
        {
            this.deck[i].location = "discard";
        }

        this.numSplits = 0;
        this.currSplitHand = 1;

        this.showDealerHand = false;
        this.moneyResult = "";
        this.gameState = "playing";

        document.getElementById("div-dealer-hand-val").innerHTML = "";
        document.getElementById("div-player-hand-val").innerHTML = "";
        document.getElementById("div-dealer-card-holder").innerHTML = "";
        document.getElementById("div-player-card-holder").innerHTML = "";
        document.getElementById("div-hand-results").innerHTML = "";
    
        gui.hideGrowl();
    }

    this.startNextHand = function(skipShuffle)
    {
        this.clearLastHand();

        if(!skipShuffle)
        {
            for(var i=0;i<this.deck.length;i++)
            {
                this.deck[i].location = "deck";
                this.deck[i].splitHand = 0;
                this.topOfDeckIdx = 0;
            }

            this.shuffle(this.deck);
        }

        this.dealNextCardTo("dealer");
        this.dealNextCardTo("player");
        this.dealNextCardTo("dealer");
        this.dealNextCardTo("player");

        this.betAmt = this.defaultBetAmt;

        var p = this.getPlayerHand("player");
        if(this.debug) console.log("player hand",p);

        var d = this.getPlayerHand("dealer");
        if(this.debug) console.log("dealer hand",d);

        this.gameState = "play";

        this.updateDisplay();
        

    }

    this.finishCurrentHand = function()
    {
        this.dealToDealer();
        this.showDealerHand = true;
        this.calculateResults();
        this.gameState = "";

    }

    this.playerHit = function()
    {
        this.dealNextCardTo("player");

        if(this.numSplits == 0)
        {
            var tot = this.getPlayerTotal("player");

            if(tot > 21)
            {
                this.gameState = "player-bust";
                this.finishCurrentHand();
            }
        }
        else
        {
            this.deck[this.topOfDeckIdx-1].splitHand = this.currSplitHand;

            var hand = this.getPlayerSplitHand(this.currSplitHand);
            var tot = this.getHandTotal(hand);

            if(tot > 21)
            {
                this.currSplitHand++;
                console.log("busted....moving to next split hand");

                if(this.currSplitHand > this.numSplits+1)
                {
                    this.finishCurrentHand();
                }
            }
        }

        this.updateDisplay();

    }

    this.playerDoubleDown = function()
    {
        this.betAmt=this.betAmt * 2;
        //gui.growl("Double Down, betting " + this.betAmt);
        
        this.playerHit();
        this.playerStand();        
        
    }

    this.playerStand = function()
    {
        if(this.numSplits<= 0)
        {
            this.finishCurrentHand();
        }
        else
        {
            
            if(this.currSplitHand > this.numSplits)
            {
                this.finishCurrentHand();
            }

            this.currSplitHand++;
        }

        this.updateDisplay();

    }    

    this.dealToDealer = function()
    {
        var moreDealerCards = true;
        var failSafeCount=0;

        while(moreDealerCards && failSafeCount < 10)
        {
            console.log("Dealing next card to dealer");

            var tot = this.getPlayerTotal("dealer");

            if(tot <= 16)
            {
                this.dealNextCardTo("dealer");
            }
            else
            {
                moreDealerCards = false;
            }

            if(tot > 21)
            {
                this.gameState = "dealer-bust";
            }
            
            failSafeCount++;
        }
    }


    this.calculateResults = function()
    {
        if(this.numSplits <= 0)
        {
            var dealerSum = this.getPlayerTotal("dealer");
            
            var playerSum = this.getPlayerTotal("player");
            
            var data = this.calculateHandResults(dealerSum, playerSum);
                
            if(this.debug) 
            {
                console.log("playerSum:" + playerSum + " vs dealer:" + dealerSum);
            
                console.log("data:", data);

                console.log("moneyResult: " + data.moneyResult);
                console.log("betAmt: " + this.betAmt);
                console.log("bank (before): " + this.playerBank);
            }
            
            gameMsg=data.msgResult;
            
            document.getElementById("div-hand-results").innerHTML = gameMsg;
            
            gui.growl(gameMsg, 3000);

            if(data.moneyResult == "+")
            {
                this.playerBank+=this.betAmt;
            }
            
            if(data.moneyResult == "-")
            {
                this.playerBank-=this.betAmt;
            }

            if(this.debug) console.log("bank (after): " + this.playerBank);
            
            
        }
        else
        {
            var dealerSum = this.getPlayerTotal("dealer");
            
            var gameMsg = "";
            for(var i=1;i<=this.numSplits+1;i++)
            {
                var playerSum = this.getPlayerSplitTotal(i);

                var data = this.calculateHandResults(dealerSum, playerSum);
                
                if(this.debug) console.log("playerSum:" + playerSum + " vs dealer:" + dealerSum);

                if(this.debug) console.log(data);

                gameMsg+=data.msgResult +"<br>";

                if(data.moneyResult == "+")
                {
                    this.playerBank+=this.betAmt;
                }
                
                if(data.moneyResult == "-")
                {
                    this.playerBank-=this.betAmt;
                }
            
                
            }
            
            document.getElementById("div-hand-results").innerHTML = gameMsg;
        }

        //can they double?


    }

    this.calculateHandResults = function(dealerSum, playerSum)
    {
        var msgResult = "";
        var moneyResult = "";

        if(playerSum > 21)
        {
            msgResult = "Busted";
            moneyResult = "-";
        }

        if(playerSum == 21)
        {
            msgResult = "You Win";
            moneyResult = "+";
        }        

        if(dealerSum == 21)
        {
            msgResult = "Dealer Wins";
            moneyResult = "-";
        }



        if(dealerSum > 21)
        {
            msgResult = "Dealer Busts, You Win";
            moneyResult = "+";
        }

        if(dealerSum < 21 && playerSum < 21)
        {
            if(dealerSum > playerSum)
            {
                msgResult = "Dealer Wins";
                moneyResult = "-";
            }

            if(dealerSum < playerSum)
            {
                msgResult = "Player Wins";
                moneyResult = "+";
            }            

            if(dealerSum == playerSum)
            {
                msgResult = "Push";
                moneyResult = "";
            }            

        }


        return {msgResult: msgResult, moneyResult:moneyResult};

    }

    this.playerCanDouble = function(playerID)
    {
        var ableToDouble = false;

        var h = this.getPlayerHand(playerID);

        if(h.length == 2)
        {
            //if(h[0].cardFace == h[1].cardFace)
            //{
                ableToDouble = true;
            //}
        }

        return ableToDouble
    }
    
    this.playerCanSplit = function(playerID)
    {
        var ableToSplit = false;

        var h = this.getPlayerHand(playerID);

        if(h.length == 2)
        {
            if(h[0].cardVal == h[1].cardVal)
            {
                ableToSplit = true;
            }
        }

        return ableToSplit
    }

    this.getHandTotal = function(hand)
    {
        var total = 0;
        var numAces = 0;

        for(var i=0;i<hand.length;i++)
        {
            total+=hand[i].cardVal;

            if(hand[i].cardFace == "A")
            {
                numAces++;
            }

        }
       
        if(total > 21 && numAces > 0)
        {
            for(var i=0;i<numAces;i++)
            {
                total-=10;
                if(this.debug) console.log("Ace is 1");

                if(total <= 21)
                {
                    break;
                }
            }
        }

        return total;
    }

    this.getPlayerSplitHand = function(splitIdx)
    {
        var hand = [];
        for(var i=0;i<this.deck.length;i++)
        {
            if(this.deck[i].splitHand == splitIdx)
            {
                hand.push(this.deck[i]);
            }
        }

        return hand;
    }

    this.getPlayerSplitTotal = function(splitIdx)
    {
        var hand = this.getPlayerSplitHand(splitIdx);

        total = this.getHandTotal(hand);


        return total;

    }


    this.getPlayerTotal = function(playerID)
    {
        var total = 0;
        var numAces = 0;

        for(var i=0;i<this.deck.length;i++)
        {
            if(this.deck[i].location == playerID)
            {
                total+=this.deck[i].cardVal;

                if(this.deck[i].cardFace == "A")
                {
                    numAces++;
                }


            }
        }
       
        if(total > 21 && numAces > 0)
        {
            for(var i=0;i<numAces;i++)
            {
                total-=10;
                if(this.debug) console.log("Ace is 1");

                if(total <= 21)
                {
                    break;
                }
            }
        }

        return total;

    }

    this.getPlayerHand = function(playerID)
    {
        var hand = [];
        for(var i=0;i<this.deck.length;i++)
        {
            if(this.deck[i].location == playerID)
            {
                hand.push(this.deck[i]);
            }
        }

        return hand;
    }




    this.shuffle = function (array) 
    {
        array.sort(() => Math.random() - 0.5);
    }

    this.dealNextCardTo = function(playerID)
    {
        this.deck[this.topOfDeckIdx].location = playerID;

        this.topOfDeckIdx++;
    }

    this.updatePlayerHandDisplay = function()
    {
        document.getElementById("div-player-card-holder").innerHTML = "";
        document.getElementById("div-player-hand-val").innerHTML = "";

        var playerHand = this.getPlayerHand("player");

        if(this.debug) console.log("playerHand",playerHand);
    
        //if(true)//this.numSplits <= 0)
        if(this.numSplits <= 0)
        {
            var tot = this.getPlayerTotal("player");

            if(tot > 0) document.getElementById("div-player-hand-val").innerHTML = tot;

            var d = document.getElementById("div-player-card-holder");

            for(var i=0;i<playerHand.length;i++)
            {
                if(playerHand.length <= 3)
                {
                            d.innerHTML+= "<div id='div-player-card-" + i + "' class='div-blackjack-card'><img src='" + playerHand[i].imgPath + "' class='card-img'></div>";
                }
                else
                {
                    d.innerHTML+= "<div id='div-player-card-" + i + "' class='div-blackjack-card-small'><img src='" + playerHand[i].imgPath + "' class='card-img-small'></div>";
                }
                //d.innerHTML+= playerHand[i].splitHand;
            }
        }
        else
        {
            var d = document.getElementById("div-player-card-holder");
            
            var html = "";
            for(var j=1;j<=this.numSplits+1;j++)
            {
                html+="<div style='display:inline-block;border:0px solid white;'>";

                for(var i=0;i<playerHand.length;i++)
                {
                    if(playerHand[i].splitHand == j)
                    {
                        if(this.currSplitHand == j)
                        {
                            html+= "<div id='div-player-card-" + i + "' class='div-blackjack-card'><img src='" + playerHand[i].imgPath + "' class='card-img'></div>";
                            //d.innerHTML+= playerHand[i].splitHand;
                            
                        }
                        else
                        {
                            html+= "<div id='div-player-card-" + i + "' class='div-blackjack-card-small'><img src='" + playerHand[i].imgPath + "' class='card-img-small'></div>";
                            //d.innerHTML+= playerHand[i].splitHand;
                        
                        }


                    }

                }
                var hand = this.getPlayerSplitHand(j);
                var tot = this.getHandTotal(hand);

                html+= "<br>Hand:" + tot + "</div>";
                
            }

            d.innerHTML = html;

            
        }
    }

    
    this.updateDealerHandDisplay = function()
    {
        var dealerHand = this.getPlayerHand("dealer");
        if(this.debug) console.log("dealerHand",dealerHand);
        var dealerSum = 0;

        var d = document.getElementById("div-dealer-card-holder");  
        d.innerHTML = "";

        if(!this.showDealerHand)
        {
            d.innerHTML = "<div id='div-dealer-card-0' class='div-blackjack-card'><img src='img/tiles/cards/gray_back.png' class='card-img'></div>";
            
        }
        else
        {
            document.getElementById("div-dealer-hand-val").innerHTML = this.getPlayerTotal("dealer");
        }



        for(var i=0;i<dealerHand.length;i++)
        {
            var d = document.getElementById("div-dealer-card-holder");
            
            if(this.showDealerHand && i == 0)
            {
                if(dealerHand.length <= 3)
                {
                    d.innerHTML+= "<div id='div-dealer-card-0' class='div-blackjack-card'><img src='" + dealerHand[i].imgPath + "' class='card-img'></div>";
                }
                else
                {
                    d.innerHTML+= "<div id='div-dealer-card-0' class='div-blackjack-card-small'><img src='" + dealerHand[i].imgPath + "' class='card-img-small'></div>";
                }
            }
            
            if(i > 0)
            {
                if(dealerHand.length <= 3)
                {
                    d.innerHTML+= "<div id='div-dealer-card-" + i + "' class='div-blackjack-card'><img src='" + dealerHand[i].imgPath + "' class='card-img'></div>";
                }
                else
                {
                    d.innerHTML+= "<div id='div-dealer-card-" + i + "' class='div-blackjack-card-small'><img src='" + dealerHand[i].imgPath + "' class='card-img-small'></div>";
                }
            }

            dealerSum+= dealerHand[i].cardVal;
            
        }

    }

    this.adjustBet = function(amt)
    {
        this.defaultBetAmt+=amt;

        if(this.defaultBetAmt <= 0)
        {
            this.defaultBetAmt = 10;
            gui.growl("Bet increased to " + this.betAmt, 3);
        }

        if(this.defaultBetAmt > this.playerBank)
        {
            this.defaultBetAmt = this.playerBank;
            gui.growl("You can't bet more than you have!",3);
        }

        gui.growl("Betting " + this.defaultBetAmt, 3);

        this.updateDisplay();

    }


    this.updatePlayerButtons = function()
    {
        gui.clearButtons();
        
        if(this.gameState == "play")
        {
            if(this.getPlayerTotal("player") == 21)
            {
                gui.addButton("Black Jack!", "play.playerStand()");
            }
            else
            {
                gui.addButton("Hit", "play.playerHit()");
                gui.addButton("Stand", "play.playerStand()");
                
                if(this.playerCanDouble("player"))
                {
                    gui.addButton("Double Down", "play.playerDoubleDown()");
                }

                if(this.playerCanSplit("player"))
                {
                    gui.addButton("Split", "play.playerSplit()");
                }

            }
        }
        else
        {
            gui.addButton("New Hand","play.startNextHand()");
            gui.addButton("Raise Bet","play.adjustBet(10)");
            gui.addButton("Lower Bet","play.adjustBet(-10)");            
        }

        




    }

    
    this.numSplits = 0;
    this.currSplitHand = 1;

    this.playerSplit = function()
    {
        this.numSplits++;

        for(var i=0;i<this.deck.length;i++)
        {
            if(this.deck[i].location == "player" && this.deck[i].splitHand == 0)
            {
                this.deck[i].splitHand = this.numSplits;
                this.deck[i+2].splitHand = this.numSplits + 1;
            }
        }

        this.dealNextCardTo("player");
        this.deck[this.topOfDeckIdx-1].splitHand = this.numSplits;

        this.dealNextCardTo("player");
        this.deck[this.topOfDeckIdx-1].splitHand = this.numSplits+1;
        
        this.updateDisplay();

    }

    this.updateDisplay = function()
    {
        this.updatePlayerHandDisplay();
        
        this.updateDealerHandDisplay();

        this.updatePlayerButtons();

        document.getElementById("div-money").innerHTML = this.playerBank;

        document.getElementById("div-bet-amt").innerHTML = this.defaultBetAmt;

        if(this.gameState != "play")
        {
            if(this.gameState == "player-bust" || this.gameState == "dealer-bust")
            {
                var gameMsg = "Next Hand";

                if(this.gameState == "player-bust")
                {
                    gameMsg = "You have busted";
                }
                
                if(this.gameState == "dealer-bust")
                {
                    gameMsg = "Dealer Busted";
                    
                }
            }
            
            if(this.gameState == "player-wins")
            {
                gameMsg = "You Win!";
            }

            if(this.gameState == "dealer-wins")
            {
                gameMsg = "You Lose!";
            }

            if(this.gameState == "push")
            {
                gameMsg = "Push!";
            }

            if(this.moneyResult != "") 
            {
                gameMsg += " " + this.moneyResult + "" + this.betAmt;
            }

            if(this.debug) console.log("GameState:" + this.gameState);
            if(this.debug) console.log("MoneyResult:" + this.moneyResult);
            if(gameMsg)
            {
                gui.growl(gameMsg, 5);
            }
            //document.getElementById("div-hand-results").innerHTML = gameMsg;
        }





    }

}