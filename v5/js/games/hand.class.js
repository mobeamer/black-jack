function Hand()
{ 
    this.cards = []; 
    this.playerID = "";

    this.debug = true;
    
    this.initialize = function(cards)
    {
        this.cards = cards;
    }

    this.assignToPlayer = function(playerID)
    {
        this.playerID = playerID;
    }

    this.giveCard = function(card)
    {
        this.hand.push(card);

        if(this.debug) console.log("card given:", this.hand);
    }

    this.getTotal = function()
    {
        var total = 0;
        var numAces = 0;

        for(var i=0;i<this.hand.length;i++)
        {
            total+=this.hand[i].cardVal;
            if(this.hand[i].cardFace == "A")
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