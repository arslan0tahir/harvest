const fs = require("fs")







const saveBackupSources=function (e,mySources){      
    let data = JSON.stringify(mySources, null, 2);
    fs.writeFileSync('db/backupSources.json', data, (err) => {
      if (err) throw err;
      
    });  
}

const saveBackupDest=function(e,myDest){      
  let data = JSON.stringify(myDest, null, 2);
  fs.writeFileSync('db/backupDest.json', data, (err) => {
    if (err) throw err;        
  });
}

const getBackupSources=function(e,arg){

  var mySources = fs.readFileSync('db/backupSources.json');
  if (mySources!=""){
    mySources = JSON.parse(mySources);
  }
  else{
    mySources=[];
  }        

  return mySources;
}

const getBackupDest=function(e,arg){

  var myDest = fs.readFileSync('db/backupDest.json');    
  myDest = JSON.parse(myDest);
  return myDest;

}


const updateLastBackupDateInSourceDb = (streamStatus)=> { 

    var mySources = fs.readFileSync('db/backupSources.json');
    if (mySources!=""){
      mySources = JSON.parse(mySources);
    }
    else{
      mySources=[];
    }

    
    for (key in mySources){        
        if (mySources[key].folderPath==streamStatus.currSource.sourcePath){            
            mySources[key].lastBackupDate=streamStatus.currTime;            
            let data = JSON.stringify(mySources, null, 2);
            fs.writeFileSync('db/backupSources.json', data, (err) => {
            if (err) throw err;        
            });
            break;
        }
    } 

}


exports.updateLastBackupDateInSourceDb=updateLastBackupDateInSourceDb;
exports.saveBackupSources=saveBackupSources;
exports.saveBackupDest=saveBackupDest;
exports.getBackupSources=getBackupSources;
exports.getBackupDest=getBackupDest;
