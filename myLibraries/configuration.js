
let lock=0;

getBackupLock=function () {
    return lock;
}

setBackupLock=function(){
    lock=1;
    return lock;
}

resetBackupLock=function(){
    lock=0;
    return lock;
}


exports.getBackupLock=getBackupLock;
exports.setBackupLock=setBackupLock;
exports.resetBackupLock=resetBackupLock;

