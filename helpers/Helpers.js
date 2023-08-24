const sendResponse = (res, status, data) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(data);
}

const success = (message , data=null) =>{
    var response = {
        status : 200,
        message:message,
        data : data
    }
    return JSON.stringify(response)
}


const failure = (message , err=null) =>{
    var error =  {
        status : 400,
        message:message,
        err : err
       
    }

    return JSON.stringify(error)
}

const checkDataModel = (data ,res) =>{
    if(data){
       const message = []
        const dataKeys = Object.keys(data);
        //if dataKeys includes all the keys
        if(!dataKeys.includes("title") ){
            message.push("title is missing");
        } if(!dataKeys.includes("description")){
            message.push("description is missing");
        }  if(!dataKeys.includes("price")){
            message.push("price is missing");
        } if(!dataKeys.includes("discountPercentage")){
            message.push("discountPercentage is missing");
        }
         if(!dataKeys.includes("rating")){
            message.push("rating is missing");
        }
         if(!dataKeys.includes("stock")){
            message.push("stock is missing");
        }
         if (!dataKeys.includes("brand")){
            message.push("brand is missing");
        } if (!dataKeys.includes("category")){
            message.push("category is missing");
        }
        
        if(message.length > 0){
          return {
              status : 400,
              message:message}
        }else{
            return {
                status : 200
            }
        }

      
       
    }
 
}




module.exports={checkDataModel,sendResponse,success,failure}
