const myLogger=require('./myLogger')
const myFs=require('./myFolderOpHandler')
const myTime=require('./myTime')
const myWindow=require('./electronWindow')
const myDbHandlers=require('./myDbHandlers')
const myAutoBackup=require('./myAutoBackup')
const configuration=require('./configuration')
const path = require('path')
const toRenderer=require('./toRenderer')
const myNotifications=require('./myNotifications')
const fs=require('fs')
var _ = require('underscore');



const prebackupValidation=require('./preBackupValidation')

var startBackupHandler=async (e)=>{

  myNotifications.testNotification("Harvest","Intiating backup")
  toRenderer.sendMsgToRenderer({
    msgType : "console",
    msg     : "Backup Requested at "+ new Date()
  })
  console.log("Backup Requested at "+ new Date())

    var dataReport=await prebackupValidation.prebackupValidation();
    // console.log(dataReport)

    currDate=new Date();
    var myConfigs=myDbHandlers.getConfig();
    myConfigs.lastBackupDate=currDate.toString();
    myDbHandlers.setConfig(myConfigs);
    
    if (configuration.getBackupLock()){
      toRenderer.sendMsgToRenderer({
        msgType : "console",
        msg     : "Backing up already in progresst "+ new Date()
      })
      console.log("Backing up already in progress");
      return;
    }
    else{
      configuration.setBackupLock();
    } 

    
    myHoldSources=  myDbHandlers.getBackupSources(),
    myHoldDest=  myDbHandlers.getBackupDest()

    
    myData={
      sources      :  myDbHandlers.onlineSourceFolders(myHoldSources),
      destinations :  myDbHandlers.onlineDestFolders(myHoldDest)
    }
    


    //checking online folders
    backupReport={
      dataReport:dataReport,
      sourcesStatus : '',
      destStatus    : '',
      errors        : [],
      copied: [ //ARRAY OF OBJECTS
          //{}{keys > destPath[string], sources[array],filesCopyStatus[2D array] }
      ]
    }



    //checking if destinations are offline    
    if (myData.destinations.length==0){
      backupReport.errors.push("All destinations are offline")
      toRenderer.sendMsgToRenderer({
        msgType : "console",
        msg     : backupReport
      })

      console.log("All destinations are offline")

      toRenderer.sendMsgToRenderer({
        msgType : "alert",
        msg     : "All destination drives are offline"
      })

      configuration.resetBackupLock();
      return;
    }

    //checking if sources are offline    
    if (myData.sources.length==0){
      backupReport.errors.push("All sources are offline")
      toRenderer.sendMsgToRenderer({
        msgType : "console",
        msg     : backupReport
      })
      console.log("All sources are offline")
      toRenderer.sendMsgToRenderer({
        msgType : "alert",
        msg     : "All source folders are offline"
      })
      configuration.resetBackupLock();
      return;
    }
    
    // myNotifications.testNotification("Harvesting","Back Started")
    toRenderer.sendMsgToRenderer({
      msgType : "console",
      msg     : "Backup Started at "+ new Date()
    })
    console.log("Backup Started")



    backupReport.sourcesStatus=myDbHandlers.sourceFoldersStatus(myHoldSources);
    backupReport.destStatus=myDbHandlers.destFoldersStatus(myHoldDest);



    myAutoBackup.assignBackupSlot();
    let myMsg={
      msg         : "Automatic backup is sheduled at "+myAutoBackup.getAutoBackupTime(),
      msgType     : "backupShedule",
      msgLocation : ""
    }
    toRenderer.sendMsgToRenderer(myMsg)
    
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
    let fileCopyStatus 
    for (const key in myDestinations) {
      
      var currDestPath=myDestinations[key]
      var currDest={
        currCount:  Number(key)+1,
        totalCount: myDestinations.length,
        destPath:   myDestinations[key]
      }
      //loop sources

      backupReport.copied.push({
        destPath      : myDestinations[key],
        sources       : [],
        fileCopyStatus: []
      })  //{keys > destPath[string], sources[array] }


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
        backupReport.copied[backupReport.copied.length-1].fileCopyStatus.push([])
        fileCopyStatusArray=backupReport.copied[backupReport.copied.length-1].fileCopyStatus


        //create source folder in destination if does not exist
        let calcDestPath=path.join(currDestPath.folderPath,sourceFolderName)
        if (!fs.existsSync(calcDestPath)) {
          fs.mkdirSync(calcDestPath);
        }
        
        streamStatus={}
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
          
          
          fileCopyStatus=await myFs.myCopyFile(currSourceFilePath,calculatedDestinationFilePath,streamStatus,writeStreamStatusToRendrer); 
          if (fileCopyStatus==1){
              fileCopyStatus= "Copied "+currSourceFilePath;
          }
         
          // fs.utimesSync(destination, sourceStats.atime, sourceStats.mtime);
          // reject("!!ERROR @source@ "+source+" @dest@ "+destination+"  @ERROR@"+err)

          
          let sourceStats = fs.statSync(currSourceFilePath);      
          fs.utimesSync(calculatedDestinationFilePath, sourceStats.atime, sourceStats.mtime);
          
          // console.log(fileCopyStatus)
          fileCopyStatusArray[fileCopyStatusArray.length-1].push([fileCopyStatus]);
        }

        // console.log(backupReport)
        // console.log(backupReport.copied[copied.length-1])

        backupReport.copied[backupReport.copied.length-1].sources.push(mySources[key].folderPath)
        myDbHandlers.updateLastBackupDateInSourceDb(streamStatus,mySources[key].folderPath)   

      }
      toRenderer.sendMsgToRenderer({
        msgType : "console",
        msg     : backupReport
      })
      myFs.purgeDestination(myDestinations[key])  
    
    }


    toRenderer.sendMsgToRenderer({
      msgType : "dataReport",
      msg     : backupReport
    })
    
   
    myLogger.logDataReport(backupReport);
    configuration.resetBackupLock();
    return

}


const writeStreamStatusToRendrer=(data)=> {
    let mainWindow=myWindow.getWindow();
    mainWindow.webContents.send('write-stream-status', data);
}



exports.writeStreamStatusToRendrer = writeStreamStatusToRendrer;
exports.startBackupHandler = startBackupHandler;
