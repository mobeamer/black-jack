function BlackJackGame()
{ 
    this.deck = [];  
    this.hand = [];
    this.players = [];
    this.currentPlayerIdx = 0;

    this.topOfDeckIdx = 0;
    this.debug = true;
    this.gameState = "add-players";
    
    this.showDealerHand = false;
    this.defaultBetAmt = 10;
    this.betAmt = 10;
    this.playerBank = 100;
    this.moneyResult = "";


    this.updateCurrPlayerState = function(s)
    {
        this.players[this.currentPlayerIdx].gameState = s;
    }

    this.updatePlayerButtons = function()
    {
        gui.clearButtons();

        if(this.gameState == "add-players")
        {
            gui.addButton("Ready","play.startBetting()");
            gui.addButton("Add Player","play.addPlayer();play.updateDisplay();");
        }

        
        if(this.gameState == "hand-over")
        {
            gui.addButton("Ready","play.startBetting()");
            gui.addButton("Add Player","play.addPlayer();play.updateDisplay();");   
        }

        if(this.gameState == "betting")
        {
            gui.addButton("Ready","play.updateCurrPlayerState('ready');play.gotoNextPlayer();");
            gui.addButton("Raise Bet","play.buttonAdjustBetClicked(10)");
            gui.addButton("Lower Bet","play.buttonAdjustBetClicked(-10)");    
        }

        if(this.gameState == "dealing")
        {
            if(this.getPlayerTotal(this.getCurrPlayerID()) == 21)
            {
                gui.addButton("Black Jack!", "play.playerStand()");
            }
            else
            {
                gui.addButton("Hit", "play.playerHit()");
                gui.addButton("Stand", "play.playerStand()");
                
                if(this.playerCanDouble(this.getCurrPlayerID()))
                {
                    gui.addButton("Double Down", "play.playerDoubleDown()");
                }
            }  
        }


        document.getElementById("div-game-state").innerHTML = this.gameState;



    }


    this.initialize = function(options)
    {
        gui.setLogoHtml("Black Jack");

        gui.showView("view-black-jack");

        this.buildDeck();

        this.shuffle(this.deck);
       
        //Double Down
        //this.deck[1] = {"cardFace": "9",  "cardClass":'C', "cardVal": 9, "imgPath": "img/tiles/cards/9C.png", "location":"deck"};
        //this.deck[3] = {"cardFace": "9",  "cardClass":'S', "cardVal": 9, "imgPath": "img/tiles/cards/9S.png", "location":"deck"};

        this.addPlayer();

        //this.startNextHand();

        this.updateDisplay();
        

        //testing
        //play.addPlayer();
        //this.startBetting();
        //play.updateCurrPlayerState('ready');
        //play.gotoNextPlayer();
        //play.updateCurrPlayerState('ready');
        //play.gotoNextPlayer();
        
    }

    
    this.updateDisplay = function()
    {
        this.updatePlayersHandDisplay();
        
        this.updateDealerHandDisplay();

        this.updatePlayerButtons();

        //this.updateGameMsg();

    }


    this.buildDeck = function()
    {
        var cardClasses = ["C","S","H","D"];
        
        for(var j=0; j<cardClasses.length;j++)
        {
            var cardClass = cardClasses[j];
            
            for(var i=2;i<11;i++)
            {
                var cardFace = i;
                var cardVal = i;
                var imgPath = "img/tiles/cards/" + cardFace + cardClass + ".png";
                var card = {"cardFace": cardFace, "cardClass":cardClass, "cardVal": cardVal, "imgPath": imgPath, "location":"deck"};
                this.deck.push(card);
            }

            var card = {"cardFace": "J",  "cardClass":cardClass, "cardVal": 10, "imgPath": "img/tiles/cards/J" + cardClass + ".png", "location":"deck"};
            this.deck.push(card);

            var card = {"cardFace": "Q",  "cardClass":cardClass, "cardVal": 10, "imgPath": "img/tiles/cards/Q" + cardClass + ".png", "location":"deck"};
            this.deck.push(card);

            var card = {"cardFace": "K",  "cardClass":cardClass, "cardVal": 10, "imgPath": "img/tiles/cards/K" + cardClass + ".png", "location":"deck"};
            this.deck.push(card);
            
            var card = {"cardFace": "A",  "cardClass":cardClass, "cardVal": 11, "imgPath": "img/tiles/cards/A" + cardClass + ".png", "location":"deck"};
            this.deck.push(card);

        }

    }

    this.addPlayer = function()
    {
        var playerName = "guest-" + (this.players.length+1);
        
        var p = new Player(playerName);

        this.players.push(p);
        
        var h = new Hand();
        
        h.assignToPlayer(p.playerID);

        this.hand.push(h);

    }


    this.updatePlayersHandDisplay = function()
    {
        var d = document.getElementById("div-player-mini-hands");

        d.innerHTML = "";

        for(var i=0;i<this.players.length;i++)
        {
            this.players[i].renderHandSmall("div-player-mini-hands");
        }

        this.players[this.currentPlayerIdx].renderHand("div-current-player-hand");

    }

    

    this.startBetting = function()
    {
        play.gameState='betting';
        play.updateDisplay();
    }


    this.gotoNextPlayer = function()
    {
        this.currentPlayerIdx++;

        if(this.currentPlayerIdx >= this.players.length)
        {
            gui.growl("All players have gone", 5);
            this.currentPlayerIdx = 0;

            if(this.gameState == "betting" || this.gameState == "hand-over")
            {
                this.gameState = "dealing";
                this.startNextHand();
            }
            else
            {
                if(this.gameState == "dealing")
                {
                    this.gameState = "dealer-hand";
                    this.dealToDealer();
                    
                }
    
            }

                        

        }
        
        

        this.updateDisplay();
    }

    this.startNextHand = function()
    {
        this.clearLastHand();
        
        this.currentPlayerIdx = 0;

        //everyone gets two cards, dealer included
        
        //round 1
        this.dealNextCardTo("dealer");

        for(var i=0;i<this.players.length;i++)
        {
            this.dealNextCardTo(this.players[i].playerID);
            this.players[i].gameState = "play";
        }

        //round 2
        this.dealNextCardTo("dealer");

        
        for(var i=0;i<this.players.length;i++)
        {
            this.dealNextCardTo(this.players[i].playerID);
        }

        this.updateDisplay();

        if(this.debug) console.log("new hand dealt");

    }

    this.clearLastHand = function()
    {
        for(var i=0;i<=this.topOfDeckIdx;i++)
        {
            this.deck[i].location = "discard";
        }

        this.showDealerHand = false;

        document.getElementById("div-current-player-hand").innerHTML = "";
        
        document.getElementById("div-dealer-card-holder").innerHTML = "";
        
        document.getElementById("div-player-mini-hands").innerHTML = "";

        gui.hideGrowl();
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


    this.playerHit = function()
    {
        this.dealNextCardTo(this.getCurrPlayerID());

        var tot = this.getPlayerTotal(this.getCurrPlayerID());

        if(tot > 21)
        {
            this.players[this.currentPlayerIdx].gameState = "player-bust";
            this.players[this.currentPlayerIdx].handMsg = "You Busted!";
            this.gotoNextPlayer();
        }

        this.updateDisplay();

    }

    this.getCurrPlayerID = function()
    {
        return this.players[this.currentPlayerIdx].playerID;
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


    this.buttonAdjustBetClicked = function(amt)
    {
        this.players[this.currentPlayerIdx].adjustBet(amt);
        
        this.updateDisplay();
    }


    this.playerNewGame = function()
    {
        //this.startNextHand();
        this.gameState = "betting";
    
        this.updateDisplay();
    }


    

    this.playerStand = function()
    {
       this.gotoNextPlayer();
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

        this.showDealerHand = true;

        this.calculateResults();

        //this.gameState = "betting";

        this.updateDisplay();

    }  






    this.calculateResults = function()
    {
        this.gameState = "hand-over";
        
        for(var i=0;i<this.players.length;i++)
        {
            this.calculateHandResults(i);
            
        }

        this.updateDisplay();

    }

    this.calculateHandResults = function(playerIdx)
    {
        var dealerSum = this.getPlayerTotal("dealer");
        var dealerHand = this.getPlayerHand("dealer");

        var playerSum = this.getPlayerTotal(this.players[playerIdx].playerID);
        var playerHand = this.getPlayerHand(this.players[playerIdx].playerID);

        this.players[playerIdx].gameState = "";
        this.players[playerIdx].moneyResult = "";
        this.players[playerIdx].handMsg = "";

        
        if(playerSum == 21 && playerHand.length == 2)
        {
            this.players[playerIdx].gameState = "player-wins";
            this.players[playerIdx].moneyResult = "+";
            this.players[playerIdx].handMsg = "BlackJack! +" + this.players[playerIdx].currBetAmt;
            this.players[playerIdx].playerBank -= this.players[playerIdx].currBetAmt;
            return;
        }      

                
        if(dealerSum == 21 && dealerHand.length == 2)
        {
            this.players[playerIdx].gameState = "player-loses";
            this.players[playerIdx].moneyResult = "-";
            this.players[playerIdx].handMsg = "Dealer has BlackJack... -" + this.players[playerIdx].currBetAmt;
            this.players[playerIdx].playerBank -= this.players[playerIdx].currBetAmt;
            return;
        }      

        if(playerSum > 21)
        {
            this.players[playerIdx].gameState = "player-loses";
            this.players[playerIdx].moneyResult = "-";
            this.players[playerIdx].handMsg = "You Busted -" + this.players[playerIdx].currBetAmt;
            this.players[playerIdx].playerBank -= this.players[playerIdx].currBetAmt;
            return;
        }    

        if(dealerSum > 21)
        {
            this.players[playerIdx].gameState = "player-wins";
            this.players[playerIdx].moneyResult = "-";
            this.players[playerIdx].handMsg = "Dealer Busts +" + this.players[playerIdx].currBetAmt;
            this.players[playerIdx].playerBank += this.players[playerIdx].currBetAmt;
            return;
        }    


        if(playerSum > dealerSum)
        {
            this.players[playerIdx].gameState = "player-wins";
            this.players[playerIdx].moneyResult = "-";
            this.players[playerIdx].handMsg = "You Win +" + this.players[playerIdx].currBetAmt;
            this.players[playerIdx].playerBank += this.players[playerIdx].currBetAmt;
            return;
        }    

        if(playerSum < dealerSum)
        {
            this.players[playerIdx].gameState = "player-loses";
            this.players[playerIdx].moneyResult = "-";
            this.players[playerIdx].handMsg = "You Lost -" + this.players[playerIdx].currBetAmt;
            this.players[playerIdx].playerBank -= this.players[playerIdx].currBetAmt;
            return;
        }    


        if(playerSum == dealerSum)
        {
            this.players[playerIdx].gameState = "player-loses";
            this.players[playerIdx].moneyResult = "";
            this.players[playerIdx].handMsg = "Push";
            
            return;
        }    


    }





















    this.playerDoubleDown = function()
    {
        this.betAmt=this.betAmt * 2;
        gui.growl("Double Down, betting " + this.betAmt);
        
        this.playerHit();
        this.playerStand();        
        
    }
  


    this.playerCanDouble = function(playerID)
    {
        var ableToDouble = false;

        var h = this.getPlayerHand(playerID);

        if(h.length == 2)
        {
            if(h[0].cardFace == h[1].cardFace)
            {
                ableToDouble = true;
            }
        }

        return ableToDouble
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
        var playerHand = this.getPlayerHand("player");

        if(this.debug) console.log("playerHand",playerHand);
    
        document.getElementById("div-player-hand-val").innerHTML = this.getPlayerTotal("player");

        var d = document.getElementById("div-player-card-holder");

        d.innerHTML = "";

        for(var i=0;i<playerHand.length;i++)
        {
            d.innerHTML+= "<div id='div-player-card-" + i + "' class='div-blackjack-card'><img src='" + playerHand[i].imgPath + "' class='card-img'></div>";
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
                d.innerHTML+= "<div id='div-dealer-card-0' class='div-blackjack-card'><img src='" + dealerHand[i].imgPath + "' class='card-img'></div>";
            }
            
            if(i > 0)
            {
                d.innerHTML+= "<div id='div-dealer-card-" + i + "' class='div-blackjack-card'><img src='" + dealerHand[i].imgPath + "' class='card-img'></div>";
            }

            dealerSum+= dealerHand[i].cardVal;
            
        }

    }



    this.updateGameMsg = function()
    {

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

            console.log("GameState:" + this.gameState);
            console.log("MoneyResult:" + this.moneyResult);
            if(gameMsg)
            {
                gui.growl(gameMsg, 5);
            }
            //document.getElementById("div-hand-results").innerHTML = gameMsg;
        }


    }


}