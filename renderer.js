// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var app = angular.module('myApp', []);
var myModal = new bootstrap.Modal(document.getElementById('dataReportModal'), { keyboard: false});
app.controller('personCtrl', function($scope) {

    $scope.backupReport={
        sourcesStatus : {},
        destStatus    : {},
        errors        : [],
        copied        : []
    }
    $scope.destDiskSizeNew={}
    $scope.carousal=1;
    $scope.carousalCardCount=1;
    $scope.carousalCardTotalCount=3;
    $scope.showCarouselSkip=0;
    $scope.destDiskSizeAlready={};
    $scope.backupReportSourcesStatus={}
    $scope.backupShedule=""  //e.g. 8:55
    $scope.firstName = "John";
    $scope.lastName = "Doe";
    $scope.windowError="Test Eror"
    $scope.sourceTemplate={
        folderName  : "",
        folderPath  : "",
        toltalFiles : "",
        folderSize  : "",
        lastBackupDate : "n/a"
    };

    $scope.formatSizeReport=function(){
        if(!$scope.destDiskSizeNew.destPathArray){
            return ({
                diskName        : '',
                freeSpace       : '',
                usedSpace       : '',
                requiredSpace   : '',
                destPath        : ''  
            });
        }
        let hold=[];
        let holdDestPath=$scope.destDiskSizeNew.destPathArray;
        let holdDestSize=$scope.destDiskSizeNew.destSizeArray;
        let holdDestSizeAlready=$scope.destDiskSizeAlready.destSizeArray;
        let holdFormatted
        for(key in holdDestPath){
            holdFormatted={
                diskName        : holdDestSize[key].diskPath,
                freeSpace       : (holdDestSize[key].free/(1024*1024*1024)).toFixed(2) + " GB",
                usedSpace       : (holdDestSize[key].size/(1024*1024*1024)).toFixed(2) + " GB",
                requiredSpace   : (($scope.sourcesSizeAccumulated-holdDestSizeAlready[key])/(1024*1024*1024)).toFixed(2) + " GB",
                destPath        : holdDestPath[key]  
            }
            if (holdFormatted.requiredSpace>holdFormatted.freeSpace){
                holdFormatted.diskName=`ERROR DISK FULL`
            }
            hold.push(holdFormatted)
        }
        return hold;
    }
    $scope.formattedSizeReport=$scope.formatSizeReport();
    $scope.mySources=[
    ]

    $scope.myDest=[
    ]

    $scope.myDestDefaults=[
        {
            folderAlias : "Zdrive",
            folderPath  : "Z:\\HARVEST-Backup",
            status      : "Online"        
        }
    ]

    $scope.currDest={
        folderAlias  : "",
        folderPath  : "",  
        status      : "Online"       
    };

    $scope.sourceTemplate={
        folderName  : "",
        folderPath  : "",
        toltalFiles : "",
        folderSize  : "",
        lastBackupDate : "n/a"
    };

    $scope.myActiveSummary={
        folderPath  :   "",
        toltalFiles :   "",
        folderSize  :   "",
        lastBackupDate : "",  
    }    

    $scope.containString=function(msg){
        if (msg.includes('!!ERROR')){
            return "error"
        }
        if (msg.includes('SYNCED')){
            return "synced"
        }

    }

    $scope.init= function () {
        //$scope.loadSources();
        $scope.myDest=$scope.myDestDefaults;
        $scope.checkSummaryVisibility();       
    }

    angular.element(document).ready(function () {        
        $scope.loadSources(); 
        $scope.loadDest(); 

        window.electronAPI.onMsgFromMain((_event, msg) => { 
            //console.log(msg)
            // console.log(msg.msgType)
            if (msg.msgType== "sourceRowMsg"){
                for (let key in $scope.mySources){
                    if($scope.mySources[key].folderPath==msg.msgLocation){
                        $scope.mySources[key].isBackingUp=0;
                        $scope.mySources[key].lastBackupDate="Source Offline"
                    }
                }

            }
            if (msg.msgType== "destRowMsg"){
                for (let key in $scope.myDest){
                    if($scope.myDest[key].folderPath==msg.msgLocation){                       
                        $scope.myDest[key].status=msg.msg
                    }
                }

            }
            if (msg.msgType== "console"){
                console.log(msg.msg)
            }
            if (msg.msgType=="backupShedule"){
                $scope.backupShedule=msg.msg
            }

            if (msg.msgType=="dataReport"){
                myModal.hide()
                $scope.backupReportSourcesStatus=msg.msg.sourcesStatus;
                $scope.backupReportDestinationStatus=msg.msg.destStatus;
                $scope.backupReportCopied=msg.msg.copied;
                
                $scope.destDiskSizeNew=msg.msg.dataReport.destSizeNew;
                $scope.destDiskSizeAlready=msg.msg.dataReport.destSizeAlreadyObj;
                $scope.sourcesSizeAccumulated=msg.msg.dataReport.sourcesSizeAccumulated;

                $scope.formattedSizeReport=$scope.formatSizeReport();
                myModal.show();

            }


            



            $scope.$apply();

        })

        //show percetages and status of write stream
        window.electronAPI.onWriteStreamStatus((_event, status) => {            

            let activeSource=$scope.mySources[Number(status.currSource.currCount)-1]            
            if(activeSource.folderPath==status.currSource.sourcePath){      

                activeSource.isBackingUp=1;
                //preparing $scope to be updated by angular
                activeSource.StatusSummary={
                    currDestCount:              status.currDest.currCount,
                    currSourceFileCount:        status.currSourceFile.currCount,
                    currSourceFileTotalCount:   status.currSourceFile.totalCount,
                    currFileProgress:           status.currFileProgress.percentage.toFixed(1)
                }

                // activeSource.StatusSummary="D:"+status.currDest.currCount+" F:"+status.currSourceFile.currCount+" of "+status.currSourceFile.totalCount+" P:"+ status.currFileProgress.percentage.toFixed(1)//summary

                if (status.currFileProgress.percentage==100 && status.currSourceFile.currCount==status.currSourceFile.totalCount && status.currDest.currCount==status.currDest.totalCount){
                    activeSource.isBackingUp=0;
                    if(activeSource.lastBackupDate){
                        activeSource.lastBackupDate=status.currTime;
                    }
                    activeSource.StatusSummary=""
                }
            }
            else{
                console.log("Mismached Sources")
            }

            
            console.log(status)
            $scope.$apply();
        })
    }); 

    $scope.loadSources=async function(){
        $scope.mySources=await window.FILE_IO.getSources();
        if ($scope.mySources.length>0){
            $scope.carousal=0;
        }
        $scope.$apply();
    }

    $scope.loadDest=async function(){
        $scope.myDest=await window.FILE_IO.getDest();
        $scope.$apply();
    }

    $scope.resetDefaultDest=async function(){
        $scope.myDest=[
            {
                folderAlias  : "Zdrive",
                folderPath  : "Z:\\HARVEST-Backup",        
            }
        ]    
        window.FILE_IO.saveDest(JSON.parse(angular.toJson($scope.myDest)));
    }

    $scope.resetDestDialog=async function(){
        $scope.currDest={
            folderAlias  : "",
                folderPath  : "",        
            }        
    }



    $scope.checkSummaryVisibility=function(){
        
        $scope.currsource=$scope.sourceTemplate

        if ($scope.currsource.folderPath!=""){
            $scope.cssSummary={
                display : "block"
            }
        }
        else{
            $scope.cssSummary={
                display : "none"
            }
        }
    }




    $scope.fullName = function() {
        return $scope.firstName + " " + $scope.lastName;
        
    };
   
    $scope.myLoadSummary= function(d,$index){
        $scope.myActiveSummary.folderPath       = d.folderPath;
        $scope.myActiveSummary.toltalFiles      = d.toltalFiles;
        $scope.myActiveSummary.folderSize       = d.folderSize;
        $scope.myActiveSummary.lastBackupDate   = d.lastBackupDate;             
    }
    $scope.myUnLoadSummary= function(){
        $scope.myActiveSummary.folderPath       = "";
        $scope.myActiveSummary.toltalFiles      = "";
        $scope.myActiveSummary.folderSize       = "";
        $scope.myActiveSummary.lastBackupDate   = "";             
    }

    $scope.addSourceFolder = function(){
        if ($scope.currsource.folderPath==''){
            return;
        }


        let currSourceFolderPath=$scope.currsource.folderPath;
        for(var key in $scope.mySources){
            if ( $scope.currsource.folderPath==$scope.mySources[key].folderPath){
                alert("Error: Source Folder Already Exist")
                return;
            }

            let arrSourceFolderPath=$scope.mySources[key].folderPath

            splitCurrSourceFolderPath=currSourceFolderPath.split('\\')
            splitArrSourceFolderPath=arrSourceFolderPath.split('\\')
            if ( splitCurrSourceFolderPath[splitCurrSourceFolderPath.length-1]== splitArrSourceFolderPath[splitArrSourceFolderPath.lenght-1]){
                alert(`Error: Same Source Foldername not allowed
                ${currSourceFolderPath}
                ${arrSourceFolderPath}
                `)
                return;
            }
        }

        $scope.mySources.push({
            folderName  :   $scope.currsource.folderName,
            folderPath  :   $scope.currsource.folderPath,
            toltalFiles :   $scope.currsource.toltalFiles,
            folderSize  :   $scope.currsource.folderSize,
            lastBackupDate : "n/a",  
            isBackingUp : 0             
        })
        $scope.resetDialog();        
        window.FILE_IO.saveJson(JSON.parse(angular.toJson($scope.mySources)));
        
    };
    $scope.addDestinationFolder=function(){
        if ($scope.currDest.folderPath==''){
            return;
        }

        let currDestFolderPath=$scope.currDest.folderPath;

        for(var key in $scope.myDest){
            if ( $scope.currDest.folderPath==$scope.myDest[key].folderPath){
                alert("Error: Destination Folder Already Exist")
                return;
            }

            let arrDestFolderPath=$scope.myDest[key].folderPath
            if ( currDestFolderPath.split('\\')[currDestFolderPath.lenght-1]== arrDestFolderPath.split('\\')[arrDestFolderPath.lenght-1]){
                alert(`Error: Same Destination Foldername not allowed
                ${currDestFolderPath}
                ${arrDestFolderPath}
                `)
                return;
            }
        }


        $scope.myDest.push($scope.currDest)
                
        window.FILE_IO.saveDest(JSON.parse(angular.toJson($scope.myDest)));     
        $scope.resetDestDialog();   
    };

    $scope.removeSourceFolder = function(x,$index){
        $scope.mySources.splice($index,1)
        window.FILE_IO.saveJson(JSON.parse(angular.toJson($scope.mySources)));        
    }
    $scope.removeDestFolder = function(x,$index){
        $scope.myDest.splice($index,1)
        window.FILE_IO.saveDest(JSON.parse(angular.toJson($scope.myDest)));        
    }

    $scope.resetDialog=() => {
        $scope.currsource.folderSize= "";
        $scope.currsource.toltalFiles= "";
        $scope.currsource.folderPath= "";
        $scope.currsource.folderName="";
    }


    $scope.closeModal=() => {
        $scope.resetDialog();
    }

    $scope.openModal=() => {      
        alert   (`       Kindly ensure that your Destinations Folders
        contains sufficient space to store the backup files.
        Defualt Destination folder (Harvest-Backup) is in Z drive
        with maximum capacity of 10 GB `)
        $scope.checkSummaryVisibility();
                
        
    }

    $scope.openDialogDest=async () => {
        

        const folderDetails = await window.FOLDER_SELECTION.openDialogDest();        
      
        if (folderDetails.folderPath!=""){            
            //update folder summary
            
            $scope.currDest.folderPath=folderDetails.folderPath;
            

        }
        $scope.$apply();        
    }

    $scope.openDialog=async () => {
        document.getElementById('folderSummaryLoading').style.visibility="visible";
        document.getElementById('noFolderSelected').style.visibility="hidden";        
      
        $scope.resetDialog();
        $scope.checkSummaryVisibility();
        // $scope.$apply(); 

        const folderDetails = await window.FOLDER_SELECTION.openDialog();
      
        var mySourceContainer = document.querySelector('#mySource1');
        var mySourceContainerToolTip = mySourceContainer.querySelector('.myTooltiptext');
        
      
        if (folderDetails.folderPath!=""){
            //update tool tip
            mySourceContainerToolTip.innerHTML=folderDetails.folderPath;

            //update folder summary
            $scope.currsource.folderSize= folderDetails.folderSummary.size
            $scope.currsource.toltalFiles=folderDetails.folderSummary.totalFiles
            $scope.currsource.folderPath=folderDetails.folderPath;
            $scope.currsource.folderName=""
        }
        // folderSummaryElement.innerHTML=JSON.stringify(folderDetails.folderSummary);
        $scope.checkSummaryVisibility();
        document.getElementById('folderSummaryLoading').style.visibility="hidden";
        document.getElementById('noFolderSelected').style.visibility="visible";
        $scope.$apply();        
    }

    $scope.getBackupSlot=function (min, max) { 
        var min=8;
        var max=16;   
        var Hrs=Math.floor(
          Math.random() * (max - min) + min
        )

        var min=1;
        var max=60;   
        var Min=Math.floor(
          Math.random() * (max - min) + min
        )        
        var myToday= new Date();
    }

    $scope.startBackup=async () => {
        
        console.log("RENDERER In start Backup")
        await window.BACKUP.startBackup(); 
        $scope.loadSources()
        
        
    }

    $scope.displayCarousal=async () => {
        if ($scope.mySources.lenght==0){
            $scope.carousal= 1;
        }
        else{
            $scope.carousal= 0;
        }       
    }
    $scope.hideCarousal=async () => {
        $scope.carousal= 0;
    }

    $scope.carouselNext=function(){       
        $scope.carousalCardCount=$scope.carousalCardCount+1;
        if ($scope.carousalCardCount == $scope.carousalCardTotalCount){
            $scope.showCarouselSkip=1
        }

        
    }

});


const btn = document.getElementById('myFolder')
document.getElementById('folderSummaryLoading').style.visibility="hidden"





// btn.addEventListener('click', )










