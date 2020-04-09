function Deck()
{ 
    this.deck = [];
    this.topOfDeck = 0;

    this.debug = true;


    this.buildDeck = function()
    {
        if(this.debug) console.log("Building Deck...");
        
        var cardClasses = ["C","S","H","D"];
        
        for(var j=0; j<cardClasses.length;j++)
        {
            var cardClass = cardClasses[j];
            
            for(var i=2;i<11;i++)
            {
                var cardFace = i;
                var cardVal = i;
                var imgPath = "img/tiles/cards/" + cardFace + cardClass + ".png";
                var card = {"cardFace": cardFace, "cardClass":cardClass, "cardVal": cardVal, "imgPath": imgPath, "playerIdx":-1, "playerHandIdx": -1};
                this.deck.push(card);
            }

            var card = {"cardFace": "J",  "cardClass":cardClass, "cardVal": 10, "imgPath": "img/tiles/cards/J" + cardClass + ".png", "playerIdx":-1, "playerHandIdx": -1};
            this.deck.push(card);

            var card = {"cardFace": "Q",  "cardClass":cardClass, "cardVal": 10, "imgPath": "img/tiles/cards/Q" + cardClass + ".png", "playerIdx":-1, "playerHandIdx": -1};
            this.deck.push(card);

            var card = {"cardFace": "K",  "cardClass":cardClass, "cardVal": 10, "imgPath": "img/tiles/cards/K" + cardClass + ".png", "playerIdx":-1, "playerHandIdx": -1};
            this.deck.push(card);
            
            var card = {"cardFace": "A",  "cardClass":cardClass, "cardVal": 11, "imgPath": "img/tiles/cards/A" + cardClass + ".png", "playerIdx":-1, "playerHandIdx": -1};
            this.deck.push(card);

        }

    }

    this.placeCard = function(cardFace, cardClass, cardVal, deckPos)
    {
        var card = {"cardFace": cardFace,  "cardClass":cardClass, "cardVal": cardVal, "imgPath": "img/tiles/cards/" + cardFace + "" + cardClass + ".png", "playerIdx":-1, "playerHandIdx": -1};
        this.deck[deckPos] = card;
    }

    
    this.shuffleDeck = function (array) 
    {
        array.sort(() => Math.random() - 0.5);

        this.topOfDeckIdx = 0;

        if(this.debug) console.log("deck.shuffleDeck() completed");
    }

    this.dealCardTo = function(playerIdx, handIdx)
    {
        this.deck[this.topOfDeckIdx].playerIdx = playerIdx;

        this.deck[this.topOfDeckIdx].playerHandIdx = handIdx;

        this.topOfDeckIdx++;

        if(this.debug) console.log("deck.dealCardTo() playeridx:" + playerIdx + " handIdx:" + handIdx + " card: " + this.deck[this.topOfDeckIdx-1].cardFace + "-" +this.deck[this.topOfDeckIdx-1].cardClass);
    }

    this.getPlayerHands = function(playerIdx)
    {        
        var lastHandIdx = -1;
        var currHand = [];
        var hand = [];
        for(var i=0;i<this.deck.length;i++)
        {
            if(this.deck[i].playerIdx == playerIdx)
            {
                if(this.deck[i].playerHandIdx != lastHandIdx)
                {
                    if(currHand.length > 0)
                    {
                        hand.push(currHand);
                    }

                    currHand = [];
                    lastHandIdx = this.deck[i].playerHandIdx;
                }

                currHand.push(this.deck[i]);
                                    
            }
        }

        if(currHand.length > 0)
        {
            hand.push(currHand);
        }

        return hand;
    }
    
}
