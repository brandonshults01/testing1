const btnExit = document.getElementById("btnExit");
const btnAdd = document.querySelector('#tbButton')
const btnRefresh = document.querySelector('#refreshTrigger');

btnAdd.addEventListener('click',addWakeupCall);
btnExit.addEventListener('click', exitApplication);
btnRefresh.addEventListener('click', fetchList);

window.api.send("toMain","checkForMessages");

function addWakeupCall(e){
    const strDate = document.getElementById('tbDate').value;
    const strTime = document.getElementById('tbTime').value;
    const strExtension = document.getElementById('tbExtension').value;
    // var timeInMillis = new Date.parse(strDate);
    var dateString = strDate.split('/');
    var timeString = strTime.split(':');
    const submitDateString = dateString[2] + dateString[0] + dateString[1] + timeString[0] + timeString[1]
    const objArguments = {
        "triggerTime":submitDateString,
        "extensionNumber":strExtension,
    }
    console.log(`function argument: ${JSON.stringify(objArguments)}`);
    window.api.send("toMain","addWakeupCall",objArguments);
    setTimeout(fetchList,1000);

}

function exitApplication(e){
    console.log(`exit success function`);
    myData={
        name: "Shutting down via Sucess Screen",
    }
    window.api.send("toMain","exitApplication",myData); 
}
function fetchList(e){
    console.log(`Client side fetchlist function triggered`);
    window.api.send("toMain","fetchWakeupCallList");
}

function deleteRecord(clicked_id){
    if (window.confirm(`Are you sure you want to delete this record? ${clicked_id}`)) {
        window.api.send("toMain","deleteWakeupCall",clicked_id);
        setTimeout(fetchList,1000);
    }
}

setInterval(fetchList,20000);