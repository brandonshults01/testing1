const btnWakeupCalls = document.getElementById("btnWakeupCalls");
const btnExit = document.getElementById("btnExit");
btnWakeupCalls.addEventListener('click', openWakeupCalls);
btnExit.addEventListener('click', exitApplication);
window.api.send("toMain","checkForMessages");

function exitApplication(e){
    console.log(`exit success function`);
    myData={
        name: "Shutting down via Sucess Screen",
    }
    window.api.send("toMain","exitApplication",myData); 
}

function openWakeupCalls(e){
    myData={
        name:"Opening Wakup Calls Screen"
    }
    window.api.send("toMain","openWakupCalls",myData);
}
