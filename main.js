// Modules to control application life and create native browser window
const {app, Tray, Menu, BrowserWindow, dialog, ipcMain } = require('electron')
const fs = require('fs');
const myFs=require('./myLibraries/myFolderDetails')
const path = require('path')
const util = require('util');
var progress = require('progress-stream');




//This section will ensure that only single instance of this app will run.
let mainWindow = null    
const gotTheLock = app.requestSingleInstanceLock();    
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
    
  // Create myWindow, load the rest of the app, etc...
  
  // This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {

    //recieving event folder selection event.
    ipcMain.handle('open-folder-selection-dialog', async function () {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory']
      })
      if (canceled) {
        return {
          folderPath    : "",
          folderSummary : {}
        }
      } else {
        var folderSummary=myFs.getFolderSummary(filePaths[0])
        
        
        return {
          folderPath    : filePaths[0],
          folderSummary : folderSummary
        }
      }
    })

    ipcMain.handle('open-dest-folder-selection-dialog', async function () {
      const {canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory']
      })
      if (canceled) {
        return {
          folderPath    : "",
          folderSummary : {}
        }
      } else {
        return {
          folderPath    : filePaths[0],
          folderSummary : {}
        }
      }
    })

    //save backup sources to a text file
    ipcMain.handle('save-backup-sources',function(e,mySources){

      
      let data = JSON.stringify(mySources, null, 2);
      fs.writeFile('db/backupSources.json', data, (err) => {
        if (err) throw err;
        
      });
    
      
  
    })

    ipcMain.handle('save-backup-dest',function(e,myDest){
      
      let data = JSON.stringify(myDest, null, 2);
      fs.writeFile('db/backupDest.json', data, (err) => {
        if (err) throw err;        
      });
      
  
    })


    //read backup sources from a text file
    ipcMain.handle('get-backup-sources',function(e,arg){

        var mySources = fs.readFileSync('db/backupSources.json');
        if (mySources!=""){
          mySources = JSON.parse(mySources);
        }
        else{
          mySources=[];
        }        

        return mySources;
    })

    ipcMain.handle('get-backup-dest',function(e,arg){

      var myDest = fs.readFileSync('db/backupDest.json');    
      myDest = JSON.parse(myDest);
      return myDest;

    })
    
    
    ipcMain.handle('start-backup',async function(e,myData){
      const mySources=myData.sources;
      const myDestinations=myData.destinations
      

      //make log folder for backup session
      dirPath='logs\\backup-session-'+new Date().toISOString().replaceAll(":","x");
      fs.mkdirSync(dirPath);
      
      

      // Preparing and appending additional sources data in mySources array 
      for (const key in mySources) {
        if (mySources.hasOwnProperty(key)) {   
          
          
          //Append folder name and file paths in each item of "mySources" array (json objects)
          mySources[key]["files"]=myFs.getAllFiles(mySources[key].folderPath);   
          mySources[key]["folderName"]=mySources[key]["folderPath"].split("\\").pop();

         
        }
      }



      //loging sources information
      try {
        fs.writeFileSync(dirPath+"\\sources.txt", JSON.stringify(mySources, null, 2));
        // file written successfully
      } catch (err) {        
        console.error(err);
      }

      //loging destination information
      try {
        fs.writeFileSync(dirPath+"\\destinations.txt", JSON.stringify(myDestinations, null, 2));
        // file written successfully
      } catch (err) {
        console.error(err);
      }

      //log sources and destinations



      //Initializing Replication of source data to destination folders.
      //loop myDestinations 
     
      for (const key in myDestinations) {
        
        var currDestPath=myDestinations[key]
        //loop sources
        for (const key in mySources) {

          var sourceFilePaths=mySources[key].files;
          var sourceFolderPath=mySources[key].folderPath;
          
          //loop all sources files        
          console.log("test...............")
          for (const key in sourceFilePaths){
            
            var currSourceFilePath=sourceFilePaths[key];
            var relativeSourceFilePath=currSourceFilePath.split(sourceFolderPath)[1];
            var calculatedDestinationFilePath=currDestPath.folderPath+relativeSourceFilePath

            //reading stats of source and destination files
            let sourceStats
            let destStats
            try {
              sourceStats = fs.statSync(currSourceFilePath);             
            } catch (err) {
              sourceStats={};
              console.error(err);
            }

            try {
              destStats = fs.statSync(calculatedDestinationFilePath);
            } catch (err) {
              destStats={};
              console.error(err);
            }

            //check if file in source fiolder is an old one or new one
            if(sourceStats.mtime!=destStats.mtime || sourceStats.size!=destStats.size ){
              await myFs.myCopyFile(currSourceFilePath,calculatedDestinationFilePath);
            }
            else{

            }

            


          }            

        }
                //if file does not exist in detination
                  //copy files in destination one by one
                //if file  with same mData and size exist
                  //do nothing

      
      //purging
        // loop all destinations one by one
          //loop all destination files
            //check if file exists in sources 
              //retian that file in destination
            //if file does not exist in sources
              //delete file in destination.
      
      
      }

      return

    })    



    

    

    
    createWindow();
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

  })
  
}







var iconpath = path.join(__dirname, 'icon.png')
function createWindow () {
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height:800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    icon: iconpath,
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  

  // Creating System Tray
  var trayIcon = new Tray(iconpath)
  var contextMenu = Menu.buildFromTemplate([
      {
          label: 'Show App', click: function () {
              mainWindow.show()
          }
      },
      {
          label: 'Quit', click: function () {
              app.isQuiting = true
              app.quit()
          }
      }
  ])
  trayIcon.setContextMenu(contextMenu)


  // dialog box to get folder name  


  // onMinimize hide to system tray
  mainWindow.on('minimize',function(event){
    event.preventDefault();
    mainWindow.hide();
  });

  // onClose hide to system tray
  mainWindow.on('close', function (event) {
      if(!app.isQuiting){
          event.preventDefault();
          mainWindow.hide();
      }
      return false;
  });


  function intervalFunc() {
    mainWindow.webContents.send('test-stream', 1)
    // console.log('Streaming now!');
  }
  
  setInterval(intervalFunc, 2000);

  // mainWindow.on('show', function () {
  //     appIcon.setHighlightMode('always')
  // })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}










// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
