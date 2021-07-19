function IsNumeric(str) 
{
    if (typeof str != "string") 
        return false;
        
    return !isNaN(str) && !isNaN(parseFloat(str));
}

function IsIntBetween(val, min, max)
{
    return val >= min && val <= max;
}

 module.exports = 
 {
     IsNumeric,
     IsIntBetween,
 }