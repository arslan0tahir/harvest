// Modules to control application life and create native browser window
const {app, Tray, Menu, BrowserWindow, dialog, ipcMain } = require('electron')
const fs = require('fs');
const myFs=require('./myLibraries/myFolderDetails')
const path = require('path')
const util = require('util');

var iconpath = path.join(__dirname, 'icon.png')



function createWindow () {
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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

  // mainWindow.on('show', function () {
  //     appIcon.setHighlightMode('always')
  // })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}








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
      console.log(folderSummary)
      
      return {
        folderPath    : filePaths[0],
        folderSummary : folderSummary
      }
    }
  })


  ipcMain.handle('save-backup-sources',function(e,mySources){

    
    let data = JSON.stringify(mySources, null, 2);
    fs.writeFile('db/backupSources.json', data, (err) => {
      if (err) throw err;
      console.log('Sources updated');
    });
  
    console.log(mySources)
 
  })

  ipcMain.handle('get-backup-sources',function(e,arg){

      var mySources = fs.readFileSync('db/backupSources.json');
      
      mySources = JSON.parse(mySources);
      console.log(mySources)
      return mySources;
  })

  
  createWindow();
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })



})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
