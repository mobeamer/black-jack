function Data()
{
    this.init = function()
    {

    }
    
    this.save = function(key,value){this.saveData(key,value);}

    this.saveData = function(key, value)
    {
        localStorage.setItem(key, JSON.stringify(value));
    }

    this.get = function(key) {return this.getData(key);}
    this.getData = function(key)
    {
        return JSON.parse(localStorage.getItem(key));
    }
}
   