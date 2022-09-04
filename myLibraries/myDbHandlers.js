const fs = require("fs")
const path = require("path")
var myTime=require('../myLibraries/myTime.js')
var _ = require('underscore');






const saveBackupSources=function (e,mySources){   

    
    let data = JSON.stringify(mySources, null, 2);

    fs.writeFileSync(path.join(__dirname,'..','/db/backupSources.json'), data, (err) => {
      if (err) throw err;
      
    });  
}

const saveBackupDest=function(e,myDest){      
  let data = JSON.stringify(myDest, null, 2);
  fs.writeFileSync(path.join(__dirname,'..','/db/backupDest.json'), data, (err) => {
    if (err) throw err;        
  });
}

const getBackupSources=function(e,arg){

  var mySources = fs.readFileSync(path.join(__dirname,'..','/db/backupSources.json'));
  if (mySources!=""){
    mySources = JSON.parse(mySources);
  }
  else{
    mySources=[];
  }        

  return mySources;
}


const setBackupShedule=function(){

  let myConfig=getConfig();
  myConfig.mySheduleBackup=1;
  setConfig(myConfig);    
}

const getBackupShedule=function(){

  let myConfig=getConfig();
  return myConfig.mySheduleBackup;
  
}

const resetBackupShedule=function(){
  let myConfig=getConfig();
  myConfig.mySheduleBackup=0;
  setConfig(myConfig);  
}


const getConfig=function(){
  
  var myConfigs = fs.readFileSync(path.join(__dirname,'..','/db/configuration.json'));
  myConfigs = JSON.parse(myConfigs);
  
  return myConfigs;
}

const setConfig=function(data){
  data=JSON.stringify(data,null,2)
  fs.writeFileSync(path.join(__dirname,'..','/db/configuration.json'), data, (err) => {
    if (err) throw err;        
  });  
  
  return data;
}


const getBackupDest=function(e,arg){

  var myDest = fs.readFileSync(path.join(__dirname,'..','/db/backupDest.json'));    
  myDest = JSON.parse(myDest);
  return myDest;

}


const updateLastBackupDateInSourceDb = (streamStatus,sourcePath)=> { 

    var mySources = fs.readFileSync(path.join(__dirname,'..','/db/backupSources.json'));
    if (mySources!=""){
      mySources = JSON.parse(mySources);
    }
    else{
      mySources=[];
    }

    
    for (key in mySources){        
        if (mySources[key].folderPath==sourcePath){
            if (_.isEmpty(streamStatus))  {
              mySources[key].lastBackupDate=myTime.formattedTime(); 
            }    
            else{
              mySources[key].lastBackupDate=streamStatus.currTime; 
            }      
                       
            let data = JSON.stringify(mySources, null, 2);
            fs.writeFileSync(path.join(__dirname,'..','/db/backupSources.json'), data, (err) => {
            if (err) throw err;        
            });
            break;
        }
    } 

}

const onlineSourceFolders=function(mySources){
  var holdMySources=[]
  for (key in mySources){
      if(fs.existsSync(mySources[key].folderPath)){
        holdMySources.push(mySources[key])
      }
      
  }
//  console.log(holdMySources)
  return holdMySources;
}

const onlineDestFolders=function(myDest){
  var holdMyDest=[]
  for (key in myDest){
      if(fs.existsSync(myDest[key].folderPath)){
        holdMyDest.push(myDest[key])          
      }
  }  
  return holdMyDest
}

const sourceFoldersStatus=function(mySources){
  let status={}
  for (key in mySources){
      if(!fs.existsSync(mySources[key].folderPath)){
        status[mySources[key].folderPath] = "offline"
      }
      else{
        status[mySources[key].folderPath] = "online"
      }
  }
  return status;
}

const destFoldersStatus=function(myDest){
  let status={}
  for (key in myDest){
      if(!fs.existsSync(myDest[key].folderPath)){         
        status[myDest[key].folderPath] = "offline"
      }
      else{
        status[myDest[key].folderPath] = "online"
      }
  }
  return status
}


exports.updateLastBackupDateInSourceDb=updateLastBackupDateInSourceDb;
exports.saveBackupSources=saveBackupSources;
exports.saveBackupDest=saveBackupDest;
exports.getBackupSources=getBackupSources;
exports.getBackupDest=getBackupDest;
exports.getConfig=getConfig;
exports.setConfig=setConfig;
exports.onlineSourceFolders=onlineSourceFolders;
exports.onlineDestFolders=onlineDestFolders;
exports.destFoldersStatus=destFoldersStatus
exports.sourceFoldersStatus=sourceFoldersStatus
exports.setBackupShedule=setBackupShedule
exports.getBackupShedule=getBackupShedule
exports.resetBackupShedule=resetBackupShedule


