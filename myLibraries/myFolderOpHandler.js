const fs = require("fs")
const path = require("path")
var progress = require('progress-stream');
const myLogger=require('./myLogger')
const myDbHandlers=require('./myDbHandlers')
const myFs=require('./myFolderOpHandler')
const toRenderer=require('./toRenderer')
const checkDiskSpace = require('check-disk-space').default








const getAllFiles = function(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)){
    toRenderer.sendMsgToRenderer({
      error: "Path not found ",
      msgType: "sourceRowMsg",
      msgLocation: dirPath
    })
    
    return "Offline"
  }
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
    sizeBytes: totalSize,
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
      return Promise.resolve("SYNCED : "+source);
      
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

      simpleStreamStatus=[streamStatus.currFileProgress.percentage+" "+streamStatus.currSourceFile.sourcePath+"--"+streamStatus.currDest.destPath.folderPath +"--"+ streamStatus.currSource.sourcePath ]
      myLogger.logStream(simpleStreamStatus)
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
    writeStream.on("error",(err)=>{
      reject("!!ERROR @source@ "+source+" @dest@ "+destination+"  @ERROR@"+err)
    })
    
    
  })
  return myCopyPromise;      
}



const purgeDestination=function (dest){

  // let destFiles=myFs.getAllFiles(dest.folderPath);
  let mySources=myDbHandlers.getBackupSources();
  let destFileRelativePath='';
  let destFiles=[]
  let sourceFolderInDest=[];
  //narrowing scope of destination folder to source folder names
  
  let destinationFolder;
  


  
  if (!fs.existsSync(dest.folderPath)){
    delete mySources[key];
    // console.trace("destination no found",dest)
    return ;
  }



  //collecting destination files with source folder names in absolute paths 
  for (key in mySources){

    hold=mySources[key].folderPath;
    
    if (!fs.existsSync(hold)){
      delete mySources[key];
      continue;
    }


    if (hold=="" || hold==undefined){
      // console.trace("Error reading source paths")
      return
    }

    hold=hold.split("\\");
    hold=hold.pop();

    destinationFolder=path.join(dest.folderPath,hold);
    sourceFolderInDest.push(destinationFolder);
    if (destinationFolder==dest.folderPath){
      console.trace("Critical Error");
      return;
      break;
    }


    holdFiles=myFs.getAllFiles(destinationFolder)
    if (Array.isArray(holdFiles)){
      destFiles=destFiles.concat(myFs.getAllFiles(destinationFolder));
    }
    else{
      console.trace("Error accessing destination files: ",destinationFolder)
      return;
    }
  }

  

  for(key in destFiles){
    destFileRelativePath=destFiles[key].split(dest.folderPath)[1];
    



    //find if destination file exists in all sources
    let found=0
    for (key in mySources){


      hold=mySources[key].folderPath;
      hold=hold.split("\\");
      hold.pop();
      holdSource=hold.join("\\")



      // console.log("looking for --",holdSource,"--",destFileRelativePath)
      
      if (fs.existsSync(path.join(holdSource,destFileRelativePath))){
        found=1;
        myLogger.logPurging("FOUND " + dest.folderPath+destFileRelativePath+" @AT@ " + holdSource+destFileRelativePath+"\n");
        break;
      }
    }

    if (found==0){
      // myLogger.logPurging("DELETING FILE "+dest.folderPath+destFileRelativePath+"\n")
      // console.log(path.join(dest.folderPath,destFileRelativePath))
      fs.rmSync(path.join(dest.folderPath,destFileRelativePath))
    }    
  }

  // console.log("Purging Empty Folders",sourceFolderInDest);
  for (key in sourceFolderInDest){
    console.log("Purging Empty Folders",sourceFolderInDest[key]);
    cleanEmptyFoldersRecursively(sourceFolderInDest[key]);
  }

}

const cleanEmptyFoldersRecursively=function (folder) {
  var fs = require('fs');
  var path = require('path');

  var isDir = fs.statSync(folder).isDirectory();
  if (!isDir) {
    return;
  }
  var files = fs.readdirSync(folder);
  if (files.length > 0) {
    files.forEach(function(file) {
      var fullPath = path.join(folder, file);
      cleanEmptyFoldersRecursively(fullPath);
    });

    // re-evaluate files; after deleting subfolder
    // we may have parent folder empty now
    files = fs.readdirSync(folder);
  }

  if (files.length == 0) {
    console.log("removing: ", folder);
    fs.rmdirSync(folder);
    return;
  }
}




const checkOnlineDestFolders = function(directoryPath) {

}




exports.getFolderSummary = getFolderSummary;
exports.getAllFiles = getAllFiles;
exports.myCopyFile=myCopyFile;
exports.purgeDestination=purgeDestination;
exports.cleanEmptyFoldersRecursively=cleanEmptyFoldersRecursively;


// const result = getTotalSize("./my-directory")