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
        lastBackupDate : ""
    };

    $scope.currsource=$scope.sourceTemplate

    $scope.mySources=[        

    ]

    $scope.fullName = function() {
        return $scope.firstName + " " + $scope.lastName;
    };
   

    $scope.addSourceFolder = function(){
        $scope.mySources.push({
            folderName  :   $scope.currsource.folderName,
            fodlerPath  :   $scope.currsource.folderPath,
            toltalFiles :   $scope.currsource.toltalFiles,
            folderSize  :   $scope.currsource.folderSize,
            lastBackupDate : "",               
        })
    };

    $scope.resetDialog=() => {
        $scope.currsource.folderSize= "";
        $scope.currsource.toltalFiles= "";
        $scope.currsource.folderPath= "";
        $scope.currsource.folderName="";
    }


    $scope.closeDialog=() => {
        $scope.resetDialog();
    }

    $scope.openDialog=async () => {
        document.getElementById('folderSummaryLoading').style.visibility="visible";
        var folderSummaryElement = document.getElementById('folderSummaryDetails');
      
        $scope.resetDialog();
        
      
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
      
        document.getElementById('folderSummaryLoading').style.visibility="hidden";
        $scope.$apply();
        
      }
});


const btn = document.getElementById('myFolder')
document.getElementById('folderSummaryLoading').style.visibility="hidden"

// btn.addEventListener('click', )










