function BlackJackGame()
{ 
    this.numSeats = 2;
    this.deck = [];  
    this.hands = [];
    this.players = [];
    this.currentPlayerIdx = 0;

    this.topOfDeckIdx = 0;
    this.debug = true;
    this.gameState = "add-players";
    
    this.showDealerHand = false;
    

    this.initialize = function(options)
    {
        gui.setLogoHtml("Black Jack");

        gui.showView("view-black-jack");

        this.arrangeUi();
        
        this.buildDeck();

        this.deck.shuffleDeck(this.deck.deck);
        
        this.addPlayer(0);

        this.addPlayer(1);

        gui.addButton("Start Playing","play.startDealing()");

        this.gameState = "betting";

        this.setAllPlayersState("waiting");

        this.play();

        //testing
        //play.startDealing();
        //play.playerStand(1);

        //Testing Split
        //this.deck.placeCard("7","C",7, 1);
        //this.deck.placeCard("7","S",7, 3);
        //play.startDealing();

        //console.log("Stacked Deck", this.deck.deck);
        //this.startBetting();
        //this.updateCurrPlayerState('ready');
        //this.gotoNextPlayer();
        //this.playerSplit();
        //this.updateDisplay();
        
        
        //Testing Double Down - 2
        //this.deck[1] = {"cardFace": "7",  "cardClass":'C', "cardVal": 7, "imgPath": "img/tiles/cards/7C.png", "location":"deck"};
        //this.deck[3] = {"cardFace": "4",  "cardClass":'S', "cardVal": 4, "imgPath": "img/tiles/cards/4S.png", "location":"deck"};
        //this.startBetting();
        //this.updateCurrPlayerState('ready');
        //this.gotoNextPlayer();
        //this.updateDisplay();

        //testing multiple players
        //play.addPlayer();
        //this.startBetting();
        //play.updateCurrPlayerState('ready');
        //play.gotoNextPlayer();
        //play.updateCurrPlayerState('ready');
        //play.gotoNextPlayer();
        

        this.updateDisplay();


    }

    this.moveToNextStage = function()
    {
        if(this.gameState == "betting")
        {
            this.gameState = "drawing";
            this.setAllPlayersState("waiting");
        }

        this.play();

    }
    
    this.play = function()
    {
        if(this.gameState == "betting")
        {
            this.players[this.currentPlayerIdx].playerState = "betting";
        }

        if(this.gameState == "drawing")
        {
            this.dealInitialHands();
            this.setAllPlayersState("drawing");
        }

        this.updateDisplay();


        return;
        
        if(this.gameState == "betting")
        {
            this.updateDisplay();
        }


        if(this.gameState == "dealing")
        {
           
            this.dealNextCardTo("dealer", 0); 

            //first card
            for(var i=0;i<this.players.length;i++)
            {
                this.dealNextCardTo(this.players[i].playerID, 0);
            }

            this.dealNextCardTo("dealer", 0); 

            //second card
            for(var i=0;i<this.players.length;i++)
            {
                this.dealNextCardTo(this.players[i].playerID,0);
            }            
            
            this.gameState = "drawing";
  
            this.updateDisplay();
            
            return;
        }

        
        if(this.gameState == "drawing")
        {
            var handIdx = this.players[this.currentPlayerIdx].currHandIdx;
            var playerHands = this.getPlayerHand(this.players[this.currentPlayerIdx].playerID);            
            var playerHand = playerHands[handIdx];
            var playerSum = this.getHandTotal(playerHand);
            
            if(playerSum > 21)
            {
                this.players[this.currentPlayerIdx].handMsg[handIdx] = "You Busted!!!!";
                this.players[this.currentPlayerIdx].handStatus[handIdx] = "hand-over";

                waitingOnInput = this.gotoNextHandOfCurrentPlayer();
            
                if(!waitingOnInput) 
                {
                    this.players[this.currentPlayerIdx].playerState = "waiting";
                    
                    waitingOnInput = this.gotoNextPlayer();
                    
                }

                if(!waitingOnInput) 
                {
                    this.gameState = "dealer";
                    this.play();
                    //waitingOnInput = this.dealToDealer();
                }

            }
                
            this.updateDisplay();

            return;
            
        }




        if(this.gameState == "drawing")
        {
            var waitingOnInput = false;
            
            waitingOnInput = this.gotoNextHandOfCurrentPlayer();
            
            if(!waitingOnInput) waitingOnInput = this.gotoNextPlayer();

            //if(!waitingOnInput) waitingOnInput = this.gotoNextPlayer();

            this.gameState = "dealer";
            
            this.dealToDealer();

            this.updateDisplay();

            return;
            
        }

        if(this.gameState == "dealer")
        {
            this.dealToDealer();
            
            this.calculateResults();
            
            this.updateDisplay();
            
            return;
        }

        this.updateDisplay();


    }




    this.startDealing = function()
    {
        this.gameState = "dealing";

        this.setAllPlayersState("playing");

        this.play();

        this.updateDisplay();
    }

    this.setAllPlayersState = function(s)
    {
        for(var i=0;i<this.players.length;i++)
        {
            this.players[i].playerState = s;
        }
    }




    this.dealNextCardTo = function(playerID, handIdx)
    {
        var playerIdx = this.getPlayerIdx(playerID);

        this.deck.dealCardTo(playerIdx,handIdx);
        
    }


    this.arrangeUi = function()
    {
        var seatWidth = Math.floor(window.innerWidth/this.numSeats) - 25;
        var seatHeight = 250;

        var d = document.getElementById("div-seat-wrapper");
        var html = "";

        for(var i=0;i<this.numSeats;i++)
        {
            html+= "<div id='div-seat-" + i + "' class='div-hand-wrapper' style='border:1px solid white;display:inline-block;width:" + seatWidth + "px; height:" + seatHeight + "px;'></div>";
        }
        
        d.innerHTML = html;

    }

    this.buildDeck = function()
    {
        if(this.debug) console.log("Building Deck...");
        
        this.deck = new Deck();

        this.deck.buildDeck();
    }

    this.addPlayer = function(seatID)
    {
        var playerName = "guest-" + (this.players.length+1);

        var playerID = this.players.length+1;

        var p = new Player(playerName, playerID, seatID);

        this.players.push(p);
        
        if(this.debug) console.log("play.addPlayer(): completed");
    }

    
    this.updateDisplay = function()
    {
        this.updatePlayerDisplay();

        this.updateDealerHandDisplay();
        
        //this.updatePlayersHandDisplay();
        
        //this.updateDealerHandDisplay();

        //this.updatePlayerButtons();

        this.updateGameUi();

    }

    

    this.updateGameUi = function()
    {
        document.getElementById("div-game-state").innerHTML = this.gameState;       

    }


    this.updatePlayerDisplay =function()
    {
        for(var i=0;i<this.players.length;i++)
        {
            document.getElementById("div-seat-" + this.players[i].seatID).innerHTML = "";

            this.players[i].renderToDiv("div-seat-" + this.players[i].seatID);
        }
    }

    
    this.updateDealerHandDisplay = function()
    {
        document.getElementById("div-dealer-hand-val").innerHTML = "";
        
        var dealerHand = this.getPlayerHand("dealer");

        //if(this.debug) console.log("dealerHand",dealerHand);

        var dealerSum = 0;

        var d = document.getElementById("div-dealer-card-holder");  
        d.innerHTML = "";

        if(!this.showDealerHand)
        {
            d.innerHTML = "<div id='div-dealer-card-0' class='div-blackjack-card'><img src='img/tiles/cards/gray_back.png' class='card-img'></div>";
            
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

            
        }

        if(this.showDealerHand)
        {
            var dealerHand = this.getPlayerHand("dealer");
                
            var dealerTotal = this.getHandTotal(dealerHand);
            
            document.getElementById("div-dealer-hand-val").innerHTML = dealerTotal;
        }


    }


    this.dealInitialHands = function()
    {
        //first card
        for(var i=0;i<this.players.length;i++)
        {
            this.dealNextCardTo(this.players[i].playerID, 0);
        }

        this.dealNextCardTo("dealer", 0); 

        //second card
        for(var i=0;i<this.players.length;i++)
        {
            this.dealNextCardTo(this.players[i].playerID,0);
        }            
        
        this.gameState = "drawing";

        this.updateDisplay();
        
        return;
                
    }
    
    this.dealToDealer = function()
    {
       
        var moreDealerCards = true;
        var failSafeCount=0;

        while(moreDealerCards && failSafeCount < 10)
        {
            console.log("Dealing next card to dealer");

            var dealerHand = this.getPlayerHand("dealer");
            
            var tot = this.getHandTotal(dealerHand);

            if(this.debug) console.log("Dealer Total:", tot);


            if(tot <= 16)
            {
                this.dealNextCardTo("dealer", 0); 
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

        //this.calculateResults();

        //this.gameState = "betting";

        this.updateDisplay();

    }  



    this.calculateResults = function()
    {
        this.gameState = "hand-over";
        
        var dealerHand = this.getPlayerHand("dealer");
        var dealerSum = this.getHandTotal(dealerHand);

        for(var i=0;i<this.players.length;i++)
        {
            var playerHands = this.getPlayerHand(this.players[i].playerID);
            var playerIdx = i;

            for(var j=0;j<playerHands.length;j++)
            {
                var playerHand = playerHands[j];
                var playerSum = this.getHandTotal(playerHand);

                var handMsg = "";
                var adjustBankRollAmt = 0;
                var solved = false;

                if(!solved && playerSum == 21 && playerHand.length == 2)
                {
                    handMsg = "BlackJack! +" + this.players[playerIdx].currBetAmt;
                    adjustBankRollAmt+=this.players[playerIdx].currBetAmt;
                    solved = true;
                }      


                if(!solved && dealerSum == 21 && dealerHand.length == 2)
                {
                    handMsg = "Dealer has BlackJack... -" + this.players[playerIdx].currBetAmt;
                    adjustBankRollAmt-=this.players[playerIdx].currBetAmt;
                    solved = true;
                    
                }      
        
                if(!solved && playerSum > 21)
                {
                    handMsg = "You Busted -" + this.players[playerIdx].currBetAmt;
                    adjustBankRollAmt-=this.players[playerIdx].currBetAmt;
                    solved = true;
                }    
        
                if(!solved && dealerSum > 21)
                {
                    handMsg = "Dealer Busts +" + this.players[playerIdx].currBetAmt;
                    adjustBankRollAmt+=this.players[playerIdx].currBetAmt;
                    solved = true;
                    
                }    
        
        
                if(!solved && playerSum > dealerSum)
                {
                    handMsg = "You Win +" + this.players[playerIdx].currBetAmt;
                    adjustBankRollAmt+=this.players[playerIdx].currBetAmt;
                    solved = true;
                
                }    
        
                if(!solved && playerSum < dealerSum)
                {
                    handMsg = "You Lost -" + this.players[playerIdx].currBetAmt;
                    adjustBankRollAmt-=this.players[playerIdx].currBetAmt;
                    solved = true;
                    
                }    
        
        
                if(!solved && playerSum == dealerSum)
                {
                    handMsg = "Push";
                    adjustBankRollAmt-=0;
                    solved = true;
                    
                    this.players[playerIdx].gameState = "player-loses";
                    this.players[playerIdx].moneyResult = "";
                    this.players[playerIdx].handMsg = "Push";
                    
                    return;
                }    

                this.players[i].handMsg[j] = handMsg
                this.players[i].adjustBankRoll(adjustBankRollAmt);

                if(this.debug) 
                {
                    console.log("Solved:" + solved + " Player " + i + ": Hand " + j + ": " + handMsg + " (amt:" + adjustBankRollAmt + ")");
                }

            }
        }

    }

    this.playerStand = function(playerID)
    {
        var playerIdx = this.getPlayerIdx(playerID);
    
        var handIdx =  this.players[playerIdx].currHandIdx;

        this.players[playerIdx].playerState = "waiting";

        this.players[playerIdx].handStatus[handIdx] = "hand-over";

        this.play();
       
    }  

    this.playerHit = function(playerID)
    {
       var playerIdx = this.getPlayerIdx(playerID);

       this.deck.dealCardTo(playerIdx,this.players[playerIdx].currHandIdx);

       this.play();
    }  


    this.gotoNextHandOfCurrentPlayer = function()
    {
        var waitingOnInput = true;
        
        currHandIdx = this.players[this.currentPlayerIdx].currHandIdx;
        
        var hands =  play.getPlayerHand(this.players[this.currentPlayerIdx].playerID);

        if(currHandIdx == hands.length-1)
        {
            waitingOnInput = false;
            currHandIdx = 0;
        }
        else
        {
            currHandIdx++;
        }

        if(this.debug) console.log("Waiting on next hand:" + waitingOnInput);

        return waitingOnInput;
    }



    this.gotoNextPlayer = function()
    {
        this.players[this.currentPlayerIdx].playerState = "waiting";

        this.currentPlayerIdx++;

        if(this.currentPlayerIdx >= this.players.length)
        {
            waitingOnInput = false;
            gui.growl("All players have gone", 5);
            this.currentPlayerIdx = 0;
            this.moveToNextStage();
        }
    
        this.play();
    }


    this.playerAdjustBet = function(playerID, amt)
    {
        var playerIdx = this.getPlayerIdx(playerID);

        this.players[playerIdx].adjustBet(amt);

        this.updateDisplay();
    }

    this.getPlayerIdx = function(playerID)
    {
        if(playerID == "dealer") return "dealer";

        for(var i=0;i<this.players.length;i++)
        {
            if(this.players[i].playerID == playerID)
            {
                return i;
            }

        }

        return -1;
    }

    

    this.getPlayerHand = function(playerID)
    {
        var playerIdx = this.getPlayerIdx(playerID);

        var hands = this.deck.getPlayerHands(playerIdx);

        if(playerID == "dealer")
        {
            var hands = this.deck.getPlayerHands("dealer");
            if(hands.length > 0)
            {
                hands = hands[0];
            }    
        }

        return hands;
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





}