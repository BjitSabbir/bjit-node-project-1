const http = require("http");
const { readJsonData, writeJsonData } = require("./controller/Controller");
const { sendResponse, success, failure, checkDataModel } = require("./helpers/Helpers");
const PORT = process.env.PORT || 5000;

const server = http.createServer(async (req, res) => {
  try {
    // get all data
    if (req.url === "/data/getAll" && req.method === "GET") {
      const serverData = await readJsonData();
      sendResponse(res, 200, success("Data Found Successfully", serverData));
    }
    // get single data from query parameters
    else if (req.url.startsWith("/data/getByKey") && req.method === "GET") {
      const queryParams = new URLSearchParams(req.url.split("?")[1]); // Extract query parameters
      const params = [];
      const retrieveData = [];
      for (const [key, value] of queryParams) {
        // check if already the key value exist in params or not
        if (params.find((param) => param.key === key)) {
          continue;
        }else{
            params.push({ key, value });
        }
      }
      const serverData = await readJsonData();
      serverData.forEach((data) => {
        //if all the parameters are matching
        var flag = []
        var sum =0;
        params.forEach((param) => {
          if (data[param.key] == param.value) {
            flag.push(1)
          }else{
            flag.push(0)
          }
        })
    flag.forEach((val)=>{
        sum += val
    })
    if(sum == params.length){
        retrieveData.push(data)
    }
     
      })
      if(retrieveData.length == 0){
        sendResponse(res, 200, failure("Cant Find Data for ",params));
      }else{
        sendResponse(res, 200, success("Data Found Successfully", retrieveData));
      }
    }

    // get aggrigated sum wher first param is key for serch and second param is value
    else if (req.url.startsWith("/data/getAggr") && req.method === "GET") {
      const queryParams = new URLSearchParams(req.url.split("?")[1]); // Extract query parameters
      const params = [];
      const retrieveData = [];
      for (const [key, value] of queryParams) {
        params.push({ key, value });
      }

  
      const serverData = await readJsonData();
      const condition_key = params[0].key;
      const condition_value = params[0].value;

      if(params[1].key == "sum"){
        
        var sumVal = 0;
        var totalElements = 0;
        const sumKey = params[1].value;

        serverData.forEach((data) => {
          if (data[condition_key] == condition_value) {
            sumVal += data[sumKey];
            totalElements++;
          }
        })

        if(totalElements == 0){
          sendResponse(res, 200, failure("Cant Find Data for ",{
            condition_key: condition_key,
            condition_value: condition_value,
            sumKey: sumKey,
            }));
        }else{
            
        sendResponse(res, 200, success("Data Found Successfully", {
            condition_key: condition_key,
            condition_value: condition_value,
            sumKey: sumKey,
              sum: sumVal,
              totalElements: totalElements
            }));
    

        }



      }
      else if (params[1].key == "avg"){
        var avgVal = 0;
        var totalElements = 0;
        const avgKey = params[1].value;
        serverData.forEach((data) => {
          if (data[condition_key] == condition_value) {
            avgVal += data[avgKey];
            totalElements++;
          }

        })
        if(totalElements == 0){    
        sendResponse(res, 200, failure("Cant Find Data for ",{
            condition_key: condition_key,
            condition_value: condition_value,
            avgKey: avgKey,
            }));
        }else{
            
        sendResponse(res, 200, success("Data Found Successfully", {
            condition_key: condition_key,
            condition_value: condition_value,
            avgKey: avgKey,
            avg: avgVal/totalElements,
            totalElements: totalElements
            }));
        }
      
      }
      else{
        sendResponse(res, 200, failure("Please Specify currect params "));
      }

    }
    // get summary report
    else if (req.url === "/data/summary" && req.method === "GET") {
        const serverData = await readJsonData();

        //get all the unique keys and frequency of 
        //how many times each key appears
        const keysFrequency = {};
        serverData.forEach((data) => {
            Object.keys(data).forEach((key) => {
                if (!keysFrequency[key]) {
                    keysFrequency[key] = 1;
                } else {
                    keysFrequency[key]++;
                }
            });
        });
    
        const summaryReport = {
            totalItems: serverData.length,
            unique_keys: keysFrequency
        };

        // console.log("Summary Report:", summaryReport);

        sendResponse(res, 200, success("Summary Report Generated",summaryReport));
    
    }
    //add new data
    else if (req.url.startsWith("/data/add") && req.method === "POST") {
      const body = [];
      req.on("data", (chunk) => {
        body.push(chunk);
      });
      req.on("end", async () => {
        const data = Buffer.concat(body).toString();
        const serverData = await readJsonData();
        const newProduct = JSON.parse(data);
        const newId = serverData.length > 0 ? serverData[serverData.length - 1].id + 1 : 1;
        newProduct.id = newId;

        const checkResponse = checkDataModel(newProduct);

        if(checkResponse.status == 400){
            sendResponse(res, 400, failure("Data Added Successfully", checkResponse.message));

        }else{
            serverData.push(newProduct);
            await writeJsonData(serverData);
            sendResponse(res, 200, success("Data Added Successfully", newProduct));
        }
   });
    }

    //remove data by id
    else if (req.url.startsWith("/data/remove") && req.method === "DELETE") {
        const queryParams = new URLSearchParams(req.url.split("?")[1]); // Extract query parameters
        const params = [];
        for (const [key, value] of queryParams) {
            params.push({ key, value });
        }
        const serverData = await readJsonData();
        const id = params[0].value;
    
        const removedData = serverData.filter((data) =>!(data.id == id));
    
        if (removedData.length < serverData.length) {
            console.log("length not same")
            await writeJsonData(removedData); 
            
            sendResponse(res, 200, success("Data Removed Successfully"));
        } else {
            sendResponse(res, 404, failure("Data Not Found with given id"));
        }
    }
    
    

    //update data by id
    else if (req.url.startsWith("/data/update") && req.method === "PUT") {
      const body = [];
      req.on("data", (chunk) => {
        body.push(chunk);
      });


      req.on("end", async () => {

        const queryParams = new URLSearchParams(req.url.split("?")[1]); // Extract query parameters
        const params = [];
        for (const [key, value] of queryParams) {
            params.push({ key, value });
        }
        const id = params[0].value;

        const data = Buffer.concat(body).toString();
        const serverData = await readJsonData();
        const updatedData = JSON.parse(data);
        console.log("here")
        const index = serverData.findIndex((data) => data.id == id);

        if (index > -1) {
          serverData[index] = {...serverData[index],...updatedData };
          await writeJsonData(serverData);
          sendResponse(res, 200, success("Data Updated Successfully", updatedData));
        }else{
          sendResponse(res, 200, failure("Please Specify your route"));

        }
      });

    }


    else {
      sendResponse(res, 200, failure("Please Specify your route"));
    }
  } catch (err) {
    sendResponse(res, 500, failure("Internal Server Error"));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
