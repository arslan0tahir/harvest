const {app, Tray, Menu, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')



let mainWindow

var iconpath = path.join(__dirname, 'icon.png')


const createWindow=function () {
    
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 800,
      height:850,
      webPreferences: {
        preload: path.join(__dirname, '..', 'preload.js')
      },
      icon: iconpath,
    //   resizable: false
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
  
  
  
  }

const getWindow=function(){
    return mainWindow
}


exports.createWindow=createWindow;
exports.getWindow=getWindow;