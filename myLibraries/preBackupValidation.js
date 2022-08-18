const fs = require("fs")
const myDbHandlers=require('./myDbHandlers')
const myFs=require('./myFolderOpHandler')
const toRenderer=require('./toRenderer')

const checkDiskSpace = require('check-disk-space').default

const prebackupValidation=async function(){
    let sourcesSize=sourcesSizeAccumlated();    
    let destSizeArray=await getDestSizeArray();

   


    for (key in destSizeArray){
        if (sourcesSize >= destSizeArray[key].size){
            destSizeArray["error"]="Disk Full";
            toRenderer.sendMsgToRenderer(
                {
                    msg         : "Disk Full",
                    msgType     : "destRowMsg",
                    msgLocation : destSizeArray[key].folderPath
                
                 }
            )
        }
        else{
            destSizeArray["error"]="Online";
            toRenderer.sendMsgToRenderer(
                {
                    msg         : "Online",
                    msgType     : "destRowMsg",
                    msgLocation : destSizeArray[key].folderPath
                
                 }
            )
        }
    }
    console.log(sourcesSize)
    console.log(destSizeArray)

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
    for (key in myDest){

        let destSize=await getDiskSpace(myDest[key].folderPath);
        destSize["folderPath"]=myDest[key].folderPath;
        // console.log(destSize)        
        destSizeArray.push(destSize);   
        // console.log(destSizeArray);  
        
    }
    // console.log(destSizeArray)  
    return destSizeArray;
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
