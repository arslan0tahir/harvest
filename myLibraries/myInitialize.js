const configuration=require('./configuration')
const toRenderer=require('./toRenderer')
const myAutoBackup=require('./myAutoBackup')

let initialize=function(){
    configuration.resetBackupLock();
    let myMsg={
        msg         : "Automatic backup is sheduled at "+myAutoBackup.getAutoBackupTime(),
        msgType     : "backupShedule",
        msgLocation : ""
    
    }
    toRenderer.sendMsgToRenderer(myMsg)
    // console.log(myMsg)

}

exports.initialize = initialize;