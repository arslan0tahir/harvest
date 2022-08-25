const notifier = require('node-notifier');
const path = require('path');
const myAutoBackup=require('./myAutoBackup')
// String

testNotification=function(title,message){
    

    // Object
    if(!title){
        title='Starting HARVEST';
    }
    if(!message){
        message='Backup is sheduled at '+myAutoBackup.getAutoBackupTime();
    }


    notifier.notify({
        title: title,
        message: message,
        icon: path.join(__dirname, 'icon.png'), // Absolute path (doesn't work on balloons)
        sound: true  // Only Notification Center or Windows Toasters
    });

   
}

// exports.showNotification=showNotification;
exports.testNotification=testNotification;
