const fs = require("fs")
const myDbHandlers=require('./myDbHandlers')
const myFs=require('./myFolderOpHandler')
const toRenderer=require('./toRenderer')
const myFolderOpHandler=require('./myFolderOpHandler')
const path=require('path');
const checkDiskSpace = require('check-disk-space').default




//checking floder sizes
const prebackupValidation=async function(){
    let sizeReport={};
    sizeReport['diffSourceVSdestAlready']=[];
    let sourcesSize=sourcesSizeAccumlated();

    let destSizeAlreadyObj=getDestSizeAlready();
    destSizeAlready=destSizeAlreadyObj.destSizeArray

    let destSizeObj=await getDestSizeArray();//destDiskSizeArray
    destSizeArray=destSizeObj.destSizeArray


    console.log(sourcesSize)

    sizeReport={
        sourcesSizeAccumulated  : sourcesSize,
        destSizeAlreadyObj      : destSizeAlreadyObj,
        destSizeNew             : destSizeObj
    }

    // console.log(sourcesSize-destSizeAlready[0].sizeBytes)
   


    
    if ( destSizeAlready.length != destSizeArray.length){ 
        toRenderer.sendMsgToRenderer({
            msgType : "console",
            msg     : "destination mismatch"
        })       
        return 0;
    }
    
    
    for (key in destSizeArray){
        if ( (sourcesSize-destSizeAlready[key].sizeBytes) >= destSizeArray[key].size){
            sizeReport['diffSourceVSdestAlready'].push(sourcesSize-destSizeAlready[key].sizeBytes)
            destSizeArray["error"]="Disk Full";
            toRenderer.sendMsgToRenderer(
                {
                    msg         : "Disk Full",
                    msgType     : "destRowMsg",
                    msgLocation : destSizeArray[key].folderPath
                
                }
            )
            return 0;
        }
        else{
            // destSizeArray["error"]="Online";
            toRenderer.sendMsgToRenderer(
                {
                    msg         : "Online",
                    msgType     : "destRowMsg",
                    msgLocation : destSizeArray[key].folderPath
                
                }
            )
        }
    }
    // console.log(sizeReport)
    return sizeReport
    // console.log(sourcesSize)
    // console.log(destSizeArray)

}




const getDiskSpace=async function(myPath){
    // console.log("PPPPPATH",myPath)
    
    let a=await checkDiskSpace(myPath).then((diskSpace) => {
        return diskSpace;
        // {
        //     diskPath: 'C:',
        //     free: 12345678,
        //     size: 98756432
        // }
        // Note: `free` and `size` are in bytes
    })

    return a;
} 

const getDestSizeArray=async function(){
    
    let myDest=myDbHandlers.getBackupDest();
    myDest=onlineDestFolders(myDest);    
    
    let destSizeArray=[];
    let destPathArray=[];
    for (key in myDest){

        let destSize=await getDiskSpace(myDest[key].folderPath);
        // destSize["folderPath"]=myDest[key].folderPath;
        // console.log(destSize)        
        destSizeArray.push(destSize);  
        destPathArray.push(myDest[key].folderPath);
        // console.log(destSizeArray);  
        
    }
    // console.log(destSizeArray)  
    destSizeObject={
        destSizeArray : destSizeArray,
        destPathArray : destPathArray
    }
    return destSizeObject;
}

const getDestSizeAlready=function(){
    let myDest=myDbHandlers.getBackupDest();
    myDest=onlineDestFolders(myDest); 

    let mySources=myDbHandlers.getBackupSources();
    mySources=onlineSourceFolders(mySources); 

    let destSizeArray=[];
    let destPathArray=[];
    let sourceFolderName;
    let destSize;
    for (key in myDest){
        // console.log(myDest[key].folderPath)
        let destSize

        //workingl
        holdDestSize=0;
        for (key2 in mySources){
            // console.log(mySources[key2])
            sourceFolderName=mySources[key2].folderPath.split('\\');
            sourceFolderName=sourceFolderName[sourceFolderName.length-1];     

            // console.log(path.join(myDest[key].folderPath,sourceFolderName))

            destSize=myFolderOpHandler.getFolderSummary(path.join(myDest[key].folderPath,sourceFolderName));
            destSize=destSize.sizeBytes;
            // console.log(destSize)
            destSize=Number(destSize);
            holdDestSize=holdDestSize+destSize;
            

        }
        destSize=holdDestSize;
        destSize["folderPath"]=myDest[key].folderPath;
        // console.log(destSize)        
        destSizeArray.push(destSize);   
        destPathArray.push(myDest[key].folderPath);
        // console.log(destSizeArray);  
        
    }
    // console.log(destSizeArray) 
    
    destSizeObj={
        destSizeArray:destSizeArray,
        destPathArray:destPathArray
    }
    return destSizeObj;
}



const sourcesSizeAccumlated=function(){
    mySources=myDbHandlers.getBackupSources()
    mySources=onlineSourceFolders(mySources)
    holdSize=0;
    for (key in mySources){
        hold=myFs.getFolderSummary(mySources[key].folderPath);
        
        holdSize=holdSize+hold.sizeBytes;
        // console.log(holdSize);
    }
    return holdSize;
}

const onlineSourceFolders=function(mySources){
    for (key in mySources){
        if(!fs.existsSync(mySources[key].folderPath)){
            delete mySources[key];
        }
    }
    return mySources;
}

const onlineDestFolders=function(myDest){
    for (key in myDest){
        if(!fs.existsSync(myDest[key].folderPath)){
            // toRenderer.sendMsgToRenderer(
            //     {
            //         msg         : "Offline",
            //         msgType     : "destRowMsg",
            //         msgLocation : myDest[key].folderPath
                
            //     }
            // )
            delete myDest[key]
        }
    }
    return myDest
}

exports.prebackupValidation = prebackupValidation;
exports.sourcesSizeAccumlated = sourcesSizeAccumlated;
