// Modules to control application life and create native browser window
const {app, Tray, Menu, BrowserWindow, dialog, ipcMain } = require('electron')
const fs = require('fs');
const myFs=require('./myLibraries/myFolderDetails')
const path = require('path')
const util = require('util');




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
        console.log('Sources updated');
      });
    
      
  
    })

    ipcMain.handle('save-backup-dest',function(e,myDest){
      
      let data = JSON.stringify(myDest, null, 2);
      console.log("myDest"+data);
      fs.writeFile('db/backupDest.json', data, (err) => {
        if (err) throw err;
        console.log('Dest  updated');
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
        
        console.log(mySources);
        return mySources;
    })

    ipcMain.handle('get-backup-dest',function(e,arg){

      var myDest = fs.readFileSync('db/backupDest.json');    
      myDest = JSON.parse(myDest);
      return myDest;

    })
    
    
    ipcMain.handle('start-backup',function(e,myData){
      const mySources=myData.sources;
      const myDestinations=myData.destinations
      
      for (const key in mySources) {
        if (mySources.hasOwnProperty(key)) {   
          
          mySources[key]["files"]=myFs.getAllFiles(mySources[key].folderPath);          

          mySources[key]["folderName"]=mySources[key]["folderPath"].split("\\").pop();
          console.log("### Folders Identified For Backup", mySources[key]["folderName"]) 

         
          
          //check if folder exist in destination

          //traverse source paths
          //check if file already exist in dest
          
          //check dates

          //if same do nothing
          //if different copy the file
        }
      }

      var sourcesLogPath='logs\\back-source-files-'+( Math.random() *1000000 ) +'.txt';
      console.log("#########",sourcesLogPath)
      try {
        fs.writeFileSync(sourcesLogPath, JSON.stringify(mySources, null, 2));
        // file written successfully
      } catch (err) {
        console.error(err);
      }

      

      console.log("Backup Started",mySources,myDestinations)
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
