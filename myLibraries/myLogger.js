const fs = require("fs")
const logFolder=".\\logs"


const generateLogSession=function(logData){
  //make log folder for backup session
  dirPath='logs\\backup-session-'+new Date().toISOString().replaceAll(":","x");
  global.__backupSessionPath = dirPath;
  
}

const generateLog=function(logData){
          //make log folder for backup session
          let dirPath=global.__backupSessionPath;

          fs.mkdirSync(dirPath);
          
          if (logData.mySources){}
          try {
            fs.writeFileSync(dirPath+"\\sources.txt", JSON.stringify(logData.mySources, null, 2));
            // file written successfully
          } catch (err) {        
            console.error(err);
          }
    
          //loging destination information
          try {
            fs.writeFileSync(dirPath+"\\destinations.txt", JSON.stringify(logData.myDestinations, null, 2));
            // file written successfully
          } catch (err) {
            console.error(err);
          }
    
          
}

const logStream=function(logData){
  //make log folder for backup session
  let dirPath=global.__backupSessionPath; 
  try {
    fs.appendFileSync(dirPath+"\\stream.txt", JSON.stringify(logData, null, 2));
  } catch (err) {
    console.error(err);
  }

  
}

const purgeLog=function(){

    fs.readdir(logFolder, function(err, files){
        files = files.map(function (fileName) {
          return {
            name: fileName,
            time: fs.statSync(logFolder + '/' + fileName).mtime.getTime()
          };
        })
        .sort(function (a, b) {
          return b.time - a.time; })
        .map(function (v) {
          return v.name; });
        
        if (files.length>10){
            
            for(let i=0;i<files.length;i++){
                let f=files.pop();
                fs.rmSync(logFolder+"\\"+f,{recursive: true});

                if (files.length<=10){
                    break;
                }
            }

        }
       
    });


   
}

const logPurging=function(logData){
 
  //make log folder for backup session
  let dirPath=global.__backupSessionPath; 
  try {
    fs.appendFileSync(dirPath+"\\purging.txt", logData);
  } catch (err) {
    console.error(err);
  }

  
}

exports.purgeLog=purgeLog;
exports.generateLog=generateLog;
exports.generateLogSession=generateLogSession;
exports.logStream=logStream;
exports.logPurging=logPurging;







