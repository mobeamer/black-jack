function Player()
{ 
    this.hand = [];    
    this.debug = true;
    this.showHand = false;
    this.betAmt = 10;
    this.playerBank = 100;

    this.initialize = function(options)
    {

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