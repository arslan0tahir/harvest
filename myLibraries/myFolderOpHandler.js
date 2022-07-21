const fs = require("fs")
const path = require("path")
var progress = require('progress-stream');
const myLogger=require('./myLogger')
const myDbHandlers=require('./myDbHandlers')
const myFs=require('./myFolderOpHandler')

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

  //reading stats of source and destination files
  let sourceStats
  let destStats
  try {
    sourceStats = fs.statSync(source);             
  } catch (err) {
    streamStatus.currSourceFile["error"]="source offline"        
  }

  try {
    destStats = fs.statSync(destination);
  } catch (err) {

  }


  if (destStats !== undefined){

    if((sourceStats.mtime.getTime() == destStats.mtime.getTime() ) && (sourceStats.size == destStats.size) ){

      // console.log("File already exist")
      streamStatus["currFileProgress"]={
        percentage: 100,
      };
      writeStreamStatusToRendrer(streamStatus);
      return Promise.resolve("File already exist");
      
    }
  }


  let myCopyPromise=new Promise((resolve,reject) => {
    var stat = fs.statSync(source);
    var str = progress({
        length: stat.size,
        time: 1000 /* ms */
    });
    
    str.on('progress', function(progress) {
      streamStatus["currFileProgress"]=progress;
      writeStreamStatusToRendrer(streamStatus);
      myLogger.logStream(streamStatus)
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


    var destFolder=destination.split("\\");
    destFolder.pop()
    destFolder=destFolder.join("\\");

    if (!fs.existsSync(destFolder)) {
      try {
        fs.mkdirSync(destFolder, {
          recursive: true
        });
      } catch (err) {
        streamStatus.currSourceFile["error"]="destination offline"    
      }

    }

    
    let writeStream=fs.createWriteStream(destination);
    let readStream=fs.createReadStream(source);
    readStream.pipe(str).pipe(writeStream);
    

    
    writeStream.on("finish",()=>{
      fs.utimesSync(destination, sourceStats.atime, sourceStats.mtime);
      resolve("Copied "+source)
    })
    writeStream.on("error",()=>(reject("!!ERROR "+source)))
    
    
  })
  return myCopyPromise;      
}

const purgeDestination=function (dest){
  let destFiles=myFs.getAllFiles(dest.folderPath);
  let destFileRelativePath=''
  for(key in destFiles){
    destFileRelativePath=destFiles[key].split(dest.folderPath)[1]  

    //get my sources 
    mySources=myDbHandlers.getBackupSources();

    //find if destination file exists in all sources
    let found=0
    for (key in mySources){
      // console.log(mySources[key].folderPath+destFileRelativePath)
      if (fs.existsSync(mySources[key].folderPath+destFileRelativePath)){
        found=1;
        myLogger.logPurging("FOUND " + dest.folderPath+destFileRelativePath+" @AT@ " + mySources[key].folderPath+destFileRelativePath+"\n");
        
        break;
      }
    }

    if (found==0){
      myLogger.logPurging("DELETING FILE "+dest.folderPath+destFileRelativePath+"\n")
      fs.rmSync(dest.folderPath+destFileRelativePath)
    }

  }



}


exports.getFolderSummary = getFolderSummary;
exports.getAllFiles = getAllFiles;
exports.myCopyFile=myCopyFile;
exports.purgeDestination=purgeDestination;
// const result = getTotalSize("./my-directory")