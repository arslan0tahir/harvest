const fs = require("fs")
const path = require("path")
var progress = require('progress-stream');

const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, file))
    }
  })

  return arrayOfFiles
}



const convertBytes = function(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  if (bytes == 0) {
    return "n/a"
  }

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))

  if (i == 0) {
    return bytes + " " + sizes[i]
  }

  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i]
}



const getFolderSummary = function(directoryPath) {

  const arrayOfFiles = getAllFiles(directoryPath)

  let totalSize = 0

  arrayOfFiles.forEach(function(filePath) {
    totalSize += fs.statSync(filePath).size
  })

  var summ={
    size: convertBytes(totalSize),
    totalFiles: arrayOfFiles.length    
  }

  return summ
}

/**
 * Return Promise to Copy Files
 * @param  {String} source Source File Path
 * @param  {String} destination Destination File Path
 * @return {Promise} Return Promise
 */
 const myCopyFile = (source,destination,streamStatus,writeStreamStatusToRendrer)=> { 

  let myCopyPromise=new Promise((resolve,reject) => {
    var stat = fs.statSync(source);
    var str = progress({
        length: stat.size,
        time: 1000 /* ms */
    });
    
    str.on('progress', function(progress) {
      streamStatus["currFileProgress"]=progress;
      writeStreamStatusToRendrer(streamStatus);
      // console.log(progress);
    
        /*
        {
            percentage: 9.05,
            transferred: 949624,
            length: 10485760,
            remaining: 9536136,
            eta: 42,
            runtime: 3,
            delta: 295396,
            speed: 949624
        }
        */
    });
    console.log(destination)
    console.log(source)

    var destFolder=destination.split("\\");
    destFolder.pop()
    destFolder=destFolder.join("\\");

    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, {
        recursive: true
      });
    }

    let writeStream=fs.createWriteStream(destination);
    let readStream=fs.createReadStream(source);
    readStream.pipe(str).pipe(writeStream);


    
    writeStream.on("finish",()=>(resolve("Copied "+source)))
    writeStream.on("error",()=>(reject("!!ERROR "+source)))
    
    
  })
  return myCopyPromise;      
}


exports.getFolderSummary = getFolderSummary;
exports.getAllFiles = getAllFiles;
exports.myCopyFile=myCopyFile;
// const result = getTotalSize("./my-directory")