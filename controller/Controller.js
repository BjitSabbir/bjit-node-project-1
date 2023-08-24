const fs = require("fs").promises;
const path = require("path");


//file read and write 

const FILE_NAME = "product.json";
const dataFilePath = path.join(__dirname, "./../data", FILE_NAME);
const FILE_LOG_NAME = "data_log.txt";
const logFilePath = path.join(__dirname, "./../log", FILE_LOG_NAME);


//file read
async function readJsonData() {
    return fs
        .readFile(dataFilePath, "utf-8")
        .then((data) => JSON.parse(data))
        .catch((err) => {
            console.log(err);
})
}


//file write
async function writeJsonData(data) {
    return fs
        .writeFile(dataFilePath, JSON.stringify(data, null, 2))
        .catch((err) => {
            console.log(err);
        })


    // try {
    //     await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
    //     appendToLogFile("Data written to JSON file.");
    //     console.log("Data written to JSON file.");
    //   } catch (error) {
    //     console.error("Error writing to JSON file:", error);
    //     throw error;
    //   }
}

module.exports = {
    readJsonData,
    writeJsonData
}