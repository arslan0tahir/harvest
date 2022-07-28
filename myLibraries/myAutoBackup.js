const myDbHandlers=require('./myDbHandlers')
const myUiHandlers=require('./myUiHandlers')



function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

backupLockUnlocked=function () {
    var myConfigs=myDbHandlers.getConfig();
    myConfigs.isBackingUp=0;
    myDbHandlers.setConfig(myConfigs)
}

backupLockLocked=function () {
    var myConfigs=myDbHandlers.getConfig();
    myConfigs.isBackingUp=1;
    // console.log(myConfigs)
    myDbHandlers.setConfig(myConfigs)
}

backupLockStatus=function () {
    var myConfigs=myDbHandlers.getConfig();
    return myConfigs.isBackingUp;
}


var autoBackup=()=>{
    // console.log("auto backup check called")
    var myRnd=getRandomInt(72) //72 5min interval from 9:00
    //if 0 the 9:00, if 8 then 9:40, if 60 then 02:00, -1 is not defined
    
    var myConfigs=myDbHandlers.getConfig();
    var backupSlot=myConfigs.backupSlot;

    backupSlotMin=backupSlot*5;
    myRelHrs=Math.floor(backupSlotMin/60);
    
    myHrs=myRelHrs+9;

    myMin=Math.floor((backupSlotMin/60-myRelHrs)*60);

    currDate=new Date();

    
    

    const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
    
    estimatedBackupDate=new Date(monthNames[currDate.getMonth()]+' '+currDate.getDate()+', '+currDate.getFullYear()+' ' +myHrs+':'+myMin+':00');
   

    myLastBackupDate=myConfigs.lastBackupDate;
    myLastBackupDate=new Date(myLastBackupDate);

    // console.log(estimatedBackupDate.toString(),currDate.toString(),myLastBackupDate.toString())
    
    if (estimatedBackupDate<=currDate && myLastBackupDate.getDate()!=estimatedBackupDate.getDate()){
        // console.log("auto backup condition valid")        
        myUiHandlers.startBackupHandler();        
    }
}

var startAutoBackup=()=>{
    // console.log("auto backup check called");

    setInterval(autoBackup, 6000);
}


var assignBackupSlot=function (){
    var myRnd=getRandomInt(72)     
    var myConfigs=myDbHandlers.getConfig();
    if (myConfigs.backupSlot<0){
        myConfigs.backupSlot=myRnd
    }
    // console.log(myConfigs)
    myDbHandlers.setConfig(myConfigs,null, 2);
    return myRnd;
}


exports.autoBackup = autoBackup;
exports.assignBackupSlot=assignBackupSlot;
exports.startAutoBackup=startAutoBackup;
exports.backuplock={
    backupLockLocked:   backupLockLocked,
    backupLockStatus:   backupLockStatus,
    backupLockUnlocked: backupLockUnlocked
};
