
module.exports.arrayToJSON = function (array) { 
    if(array){
        return (array).map(v=>{
            return v.toJSON()
         })
    }else{
        return null
    }
    
}

module.exports.objectToJSON = function (object) { 
    return object ? object.toJSON():null;
}