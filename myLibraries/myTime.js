

var getCurrentTime=function (){
    var myDate = new Date();

    let daysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Aug', 'Oct', 'Nov', 'Dec'];


    let date = myDate.getDate();
    let month = monthsList[myDate.getMonth()];
    let year = myDate.getFullYear();
    let day = daysList[myDate.getDay()];

    let today = `${date} ${month} ${year}, ${day}`;

    let amOrPm;
    let twelveHours = function (){
        if(myDate.getHours() > 12)
        {
            amOrPm = 'PM';
            let twentyFourHourTime = myDate.getHours();
            let conversion = twentyFourHourTime - 12;
            return `${conversion}`

        }else {
            amOrPm = 'AM';
            return `${myDate.getHours()}`}
    };
    let hours = twelveHours();
    let minutes = myDate.getMinutes();

    let currentTime = `${hours}:${minutes} ${amOrPm}`;
    return today + ' ' + currentTime
}


exports.formattedTime = getCurrentTime;
