const fs = require("fs")
const logFolder=".\\logs"




const generateLog=function(logData){
          //make log folder for backup session
          dirPath='logs\\backup-session-'+new Date().toISOString().replaceAll(":","x");
          fs.mkdirSync(dirPath);
          
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
        console.log(files)
    });


    // console.log(logFolder)
    // const files = fs.readdirSync(logFolder)
    // // console.log(files)
    // for (const file of files){
    //     console.log(file)
    // }
}

exports.purgeLog=purgeLog;
exports.generateLog=generateLog;








