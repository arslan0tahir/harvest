const myLogger=require('./myLogger')
const myFs=require('./myFolderOpHandler')
const myTime=require('./myTime')
const myWindow=require('./electronWindow')
const myDbHandlers=require('./myDbHandlers')
const myAutoBackup=require('./myAutoBackup')
const configuration=require('./configuration')
const path = require('path')
const toRenderer=require('./toRenderer')


const prebackupValidation=require('./preBackupValidation')

var startBackupHandler=async (e)=>{
    
    await prebackupValidation.prebackupValidation();


    var myConfigs=myDbHandlers.getConfig();
    
    if (configuration.getBackupLock()){
      console.log("Backing up already in progress");
      return;
    }
    else{
      configuration.setBackupLock();
    }

    

    // myData={
    //   sources      :  myDbHandlers.getBackupSources(),
    //   destinations :  myDbHandlers.getBackupDest()
    // } 




    // {

          // sourcesStatus:{
          //   sourcePaths: {
          //     status   : online/offline
          //     copiedTo : 
          //   }
          // }
          // destStatus:{
          //   destPaths: online/offline
          // }
          // backupStatus:{

          // }  

    // }



    myHoldSources=  myDbHandlers.getBackupSources(),
    myHoldDest=  myDbHandlers.getBackupDest()



    //checking online folders
    backupReport={
      sourcesStatus : myDbHandlers.sourceFoldersStatus(myHoldSources),
      destStatus    : myDbHandlers.destFoldersStatus(myHoldDest),
      errors        : []
    }


    
    myData={
      sources      :  myDbHandlers.onlineSourceFolders(myHoldSources),
      destinations :  myDbHandlers.onlineDestFolders(myHoldDest)
    }
    

    //checking if destinations are offline    
    if (myData.destinations.length==0){
      backupReport.error.push("All destination are offline")
      toRenderer.sendMsgToRenderer({
        msgType : "console",
        msg     : backupReport
      })

      console.log("All destinations are offline")
      return;
    }

    //checking if sources are offline    
    if (myData.sources.length==0){
      backupReport.error.push("All sources are offline")
      toRenderer.sendMsgToRenderer({
        msgType : "console",
        msg     : backupReport
      })
          console.log("All sources are offline")
      return;
    }
    

    myAutoBackup.assignBackupSlot();
    const mySources=myData.sources;
    const myDestinations=myData.destinations;
  
    
    // Preparing and appending additional sources data in mySources array 
    // let allSourcesFound=1;
    for (const key in mySources) {
      if (mySources.hasOwnProperty(key)) {   
        
        
        //Append folder name and file paths in each item of "mySources" array (json objects)
        mySources[key]["files"]=myFs.getAllFiles(mySources[key].folderPath);   
        if(!Array.isArray(mySources[key]["files"])){
          configuration.resetBackupLock();
          // allSourcesFound=0;
          delete mySources[key];
          continue;
          
        }
        mySources[key]["folderName"]=mySources[key]["folderPath"].split("\\").pop();       
      }
    }
    // if (!allSourcesFound){
    //   return;
    // }


    let logData={
      mySources:      mySources,
      myDestinations: myDestinations
    }
    myLogger.generateLogSession();
    myLogger.purgeLog() //purge old log files
    // console.log(logData)
    myLogger.generateLog(logData)     



    //Initializing Replication of source data to destination folders.
    //loop myDestinations   
    var streamStatus   
    for (const key in myDestinations) {
      
      var currDestPath=myDestinations[key]
      var currDest={
        currCount:  Number(key)+1,
        totalCount: myDestinations.length,
        destPath:   myDestinations[key]
      }
      //loop sources
      for (const key in mySources) {

        var sourceFilePaths=mySources[key].files;
        var sourceFolderPath=mySources[key].folderPath;
        var sourceFolderName=sourceFolderPath.split("\\").pop()
        var currSource={
          currCount:    Number(key)+1,
          totalCount:   mySources.length,
          sourcePath:   mySources[key].folderPath
        }
        //loop all sources files       
       
        for (const key in sourceFilePaths){
          
          var currSourceFilePath=sourceFilePaths[key];
          var relativeSourceFilePath=currSourceFilePath.split(sourceFolderPath)[1];
          var calculatedDestinationFilePath=path.join(currDestPath.folderPath,sourceFolderName,relativeSourceFilePath)
          var currSourceFile={
            currCount:    Number(key)+1,
            totalCount:   sourceFilePaths.length,
            sourcePath:   currSourceFilePath
          }

          //stramStatus holds complete summary of real time copy stream
          streamStatus={
            currDest: currDest,
            currSource: currSource,
            currSourceFile: currSourceFile,
            currTime: myTime.formattedTime()
          }
          
          
          await myFs.myCopyFile(currSourceFilePath,calculatedDestinationFilePath,streamStatus,writeStreamStatusToRendrer); 
           
        }

        myDbHandlers.updateLastBackupDateInSourceDb(streamStatus)   

      }
      myFs.purgeDestination(myDestinations[key])  
    
    }

    
    currDate=new Date();
    myConfigs.lastBackupDate=currDate.toString();
    myDbHandlers.setConfig(myConfigs);    
    configuration.resetBackupLock();
    return

}


const writeStreamStatusToRendrer=(data)=> {
    let mainWindow=myWindow.getWindow();
    mainWindow.webContents.send('write-stream-status', data);
}



exports.writeStreamStatusToRendrer = writeStreamStatusToRendrer;
exports.startBackupHandler = startBackupHandler;
