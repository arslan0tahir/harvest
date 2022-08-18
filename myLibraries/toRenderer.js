const myWindow=require('./electronWindow')


/* {
    msg       : "your message"
    msgType : console,alert,lastBackupDate, container  , sourceRowMsg, destRowMsg
    msgLocation: path if rowMsg

 }
*/

const sendMsgToRenderer=(data)=> {
    // console.log(data.msgType)
    let mainWindow=myWindow.getWindow();
    mainWindow.webContents.send('write-msg-to-renderer', data);
}

exports.sendMsgToRenderer = sendMsgToRenderer;
