//script page
const btnExit = document.getElementById("btnExit");

btnExit.addEventListener('click', exitFunction);

function exitFunction(e) {
    myData={
        name: "Not on the same network as the XPhase Communcator",
    }
    window.api.send("toMain","exitApplication",myData);
    console.log(`name: ${myData.name} password: ${myData.password}`);
}

window.api.send("toMain","checkForMessages");
