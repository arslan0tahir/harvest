const configuration=require('./configuration')
const toRenderer=require('./toRenderer')
const myAutoBackup=require('./myAutoBackup')
const myFolderOpHandler=require('./myFolderOpHandler')
const myDbHandlers=require('./myDbHandlers')
const fs = require('fs');


const initialize=function(){
    myDbHandlers.resetBackupShedule();
    initializeShedulePlaceholder();
    updateOnlineSourceFoldersInfo();
    updateOnlineDestFoldersInfo();
    backupFolderInZ();



    initializeIntervals();

}

const initializeIntervals=function(){
    setInterval(updateOnlineSourceFoldersInfo,5000)
    setInterval(updateOnlineDestFoldersInfo,5000)
}

const backupFolderInZ=()=>{
    const driveName="Z"
    if (fs.existsSync(driveName+":\\")) {
        if (fs.existsSync(driveName+":\\HARVEST-Backup")) {
            console.log('Directory exists!');
        }
        else{
            fs.mkdirSync(driveName+":\\HARVEST-Backup");
        }
        
    }
    else{

    }
}

const initializeShedulePlaceholder=function(){
    configuration.resetBackupLock();
    let myMsg={
        msg         : "Automatic backup is sheduled at "+myAutoBackup.getAutoBackupTime(),
        msgType     : "backupShedule",
        msgLocation : ""
    
    }
    toRenderer.sendMsgToRenderer(myMsg)
    // console.log(myMsg)
}





  
  
  
const updateOnlineSourceFoldersInfo = function(directoryPath) {
    mySources=myDbHandlers.getBackupSources();
    myDest=myDbHandlers.getBackupDest();
  
    for (key in mySources){
      if (!fs.existsSync(mySources[key].folderPath)){
          toRenderer.sendMsgToRenderer({
            error: "Path not found ",
            msgType: "sourceRowMsg",
            msgLocation: mySources[key].folderPath
          })
      }
      else{
        toRenderer.sendMsgToRenderer({
            error: "Online",
            msgType: "sourceRowMsg",
            msgLocation: ""
        })
      }
    }  
    
}

const updateOnlineDestFoldersInfo = function(directoryPath) {
    mySources=myDbHandlers.getBackupSources();
    myDest=myDbHandlers.getBackupDest(); 

  
    for (key in myDest){
      if (!fs.existsSync(myDest[key].folderPath)){
          toRenderer.sendMsgToRenderer({
            msg: "Offline",
            msgType: "destRowMsg",
            msgLocation: myDest[key].folderPath
        })
      }
      else{
        toRenderer.sendMsgToRenderer({
            msg: "Online",
            msgType: "destRowMsg",
            msgLocation: myDest[key].folderPath
        })
      }
    }
}

exports.initialize = initialize;