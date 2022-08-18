// Modules to control application life and create native browser window
const {app, Tray, Menu, BrowserWindow, dialog, ipcMain ,Notification } = require('electron')
const fs = require('fs')
const myFs=require('./myLibraries/myFolderOpHandler')
const path = require('path')
const util = require('util')
const myTime=require('./myLibraries/myTime')
const myLogger=require('./myLibraries/myLogger')
const myDbHandlers=require('./myLibraries/myDbHandlers')
const myUiHandlers=require('./myLibraries/myUiHandlers')
const myWindow=require('./myLibraries/electronWindow')
const myAutoBackup=require('./myLibraries/myAutoBackup')
const configuration=require('./myLibraries/configuration')
const myInitialize=require('./myLibraries/myInitialize')


 

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
const NOTIFICATION_TITLE = 'Basic Notification'
const NOTIFICATION_BODY = 'Notification from the Main process'

function showNotification () {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}


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
    ipcMain.handle('save-backup-sources',myDbHandlers.saveBackupSources)
    ipcMain.handle('save-backup-dest',myDbHandlers.saveBackupDest)

    //read backup sources from a text file
    ipcMain.handle('get-backup-sources',myDbHandlers.getBackupSources)
    ipcMain.handle('get-backup-dest',myDbHandlers.getBackupDest)
    ipcMain.handle('start-backup',myUiHandlers.startBackupHandler)      

    myWindow.createWindow();
    mainWindow=myWindow.getWindow();

    mainWindow.webContents.on('did-finish-load',()=>{
      myInitialize.initialize();
      console.log("initialized")
    });

function WindowsReady() {
    console.log('Ready');

}
    // myInitialize.initialize(); //msg to renderer didnt work so initialization is shifted in autobackup
    myAutoBackup.startAutoBackup();
    myFs.checkOnlineFolders();
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

  })
  
}









// function createWindow () {
  
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height:800,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js')
//     },
//     icon: iconpath,
//   })

//   // and load the index.html of the app.
//   mainWindow.loadFile('index.html')
  

//   // Creating System Tray
//   var trayIcon = new Tray(iconpath)
//   var contextMenu = Menu.buildFromTemplate([
//       {
//           label: 'Show App', click: function () {
//               mainWindow.show()
//           }
//       },
//       {
//           label: 'Quit', click: function () {
//               app.isQuiting = true
//               app.quit()
//           }
//       }
//   ])
//   trayIcon.setContextMenu(contextMenu)


//   // dialog box to get folder name  


//   // onMinimize hide to system tray
//   mainWindow.on('minimize',function(event){
//     event.preventDefault();
//     mainWindow.hide();
//   });

//   // onClose hide to system tray
//   mainWindow.on('close', function (event) {
//       if(!app.isQuiting){
//           event.preventDefault();
//           mainWindow.hide();
//       }
//       return false;
//   });



// }










// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
