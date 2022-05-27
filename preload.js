// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const {ipcRenderer, contextBridge} = require('electron');



window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }


  contextBridge.exposeInMainWorld('FOLDER_SELECTION',{
    openDialog:     () => ipcRenderer.invoke('open-folder-selection-dialog'),
    openDialogDest: () => ipcRenderer.invoke('open-dest-folder-selection-dialog')
  })

  contextBridge.exposeInMainWorld('FILE_IO',{
    saveJson: (mySources) => ipcRenderer.invoke('save-backup-sources',mySources),
    saveDest: (myDest) => ipcRenderer.invoke('save-backup-dest',myDest),
    getSources: () => ipcRenderer.invoke('get-backup-sources'),
    getDest: () => ipcRenderer.invoke('get-backup-dest')
  })

  contextBridge.exposeInMainWorld('BACKUP',{

    startBackup: (myData) => ipcRenderer.invoke('start-backup',myData)

  })

  contextBridge.exposeInMainWorld('electronAPI', {
    onStartStream: (callback) => ipcRenderer.on('test-stream', callback)
  })

});


