// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var app = angular.module('myApp', []);
app.controller('personCtrl', function($scope) {

    $scope.init= function () {
        //$scope.loadSources();
        $scope.checkSummaryVisibility();
        
    }

    angular.element(document).ready(function () {        
        $scope.loadSources(); 
    }); 

    $scope.loadSources=async function(){
        $scope.mySources=await window.FILE_IO.getSources();
        $scope.$apply();
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

    $scope.fullName = function() {
        return $scope.firstName + " " + $scope.lastName;
    };
   

    $scope.addSourceFolder = function(){
        if ($scope.currsource.folderPath==''){
            return;
        }

        $scope.mySources.push({
            folderName  :   $scope.currsource.folderName,
            fodlerPath  :   $scope.currsource.folderPath,
            toltalFiles :   $scope.currsource.toltalFiles,
            folderSize  :   $scope.currsource.folderSize,
            lastBackupDate : "n/a",  
            isBackingUp : 0             
        })
        $scope.resetDialog();        
        window.FILE_IO.saveJson(JSON.parse(angular.toJson($scope.mySources)));
        
    };

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
});


const btn = document.getElementById('myFolder')
document.getElementById('folderSummaryLoading').style.visibility="hidden"

// btn.addEventListener('click', )










