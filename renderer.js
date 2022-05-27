// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var app = angular.module('myApp', []);
app.controller('personCtrl', function($scope) {


    $scope.firstName = "John";
    $scope.lastName = "Doe";

    $scope.sourceTemplate={
        folderName  : "",
        folderPath  : "",
        toltalFiles : "",
        folderSize  : "",
        lastBackupDate : "n/a"
    };

    

    $scope.mySources=[
    ]

    $scope.myDest=[
    ]

    $scope.myDestDefaults=[
        {
            folderAlias  : "Zdrive",
            folderPath  : "\\127.0.0.1\share",        
        }
    ]

    $scope.currDest={
        folderAlias  : "",
        folderPath  : "",        
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

    $scope.init= function () {
        //$scope.loadSources();
        $scope.myDest=$scope.myDestDefaults;
        $scope.checkSummaryVisibility();
        
    }

    angular.element(document).ready(function () {        
        $scope.loadSources(); 
        $scope.loadDest(); 

        window.electronAPI.onStartStream((_event, value) => {
            console.log("Stream Recieved")
        })
    }); 

    $scope.loadSources=async function(){
        $scope.mySources=await window.FILE_IO.getSources();
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
                folderPath  : "\\127.0.0.1\share",        
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
        await window.BACKUP.startBackup({
            sources     : $scope.mySources,
            destinations : $scope.myDest
        }); 
        
        
    }

});


const btn = document.getElementById('myFolder')
document.getElementById('folderSummaryLoading').style.visibility="hidden"





// btn.addEventListener('click', )










