const {contextBridge,ipcRenderer, app} = require(`electron`);
const path = require(`path`);

contextBridge.exposeInMainWorld(
    "api", {
        send: (channel,func,data) => {
            let validChannels = ["toMain"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel,func,data);
            }
        }
    }
)

ipcRenderer.on('fromMain',(event,data) => {
    switch (data.targetFunction) {
        case 'alertbox':
            let receivedData = data.myArgs
            var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            console.log(`received data: ${JSON.stringify(receivedData)}`);
            try {
                JSON.parse(receivedData).hasOwnProperty('count')
                console.log(`No List`);
                let outputDisplay = document.getElementById('callList');
                outputDisplay.innerHTML = `<div class="alert alert-success" role="alert">Currenlty there are no wakup calls schedulted!</div>`;

            } catch(e) {
                console.log(receivedData);
                console.log(`Lenght of active calls: ${Object.keys(receivedData).length}`)
                console.log(`after parsing: ${JSON.stringify(receivedData[0].triggerTime)}`);
                let outputDisplay = document.getElementById('callList');
                outputDisplay.innerHTML = "";
                for (i=0; i<Object.keys(receivedData).length;i++){
                    let convertedDate = new Date(receivedData[i].triggerTime);
                    let triggerDateString = ``
                    console.log(`Length of minutes: ${convertedDate.getMinutes()}`)
                    if (convertedDate.getMinutes() <= 9){
                        console.log(`add a 0 to minutes`);
                        triggerDateString = `${days[convertedDate.getDay()]} at ${convertedDate.getHours()}:0${convertedDate.getMinutes()}`
                    } else {
                        triggerDateString = `${days[convertedDate.getDay()]} at ${convertedDate.getHours()}:${convertedDate.getMinutes()}`
                    }
                    outputDisplay.innerHTML += `<li class="list-group-item">${receivedData[i].extensionNumber} is set for ${triggerDateString} &nbsp<button type="button" class="btn btn-danger" id="${receivedData[i].callFileName}" onClick="deleteRecord(this.id)">Delete</button> </li>`;
                }
            }
            break;

        case 'message':
            let strMessage = data.myArgs
            dynamicTitle = document.title + "  -  version: " + data.appVersion
            document.title = dynamicTitle;
            try {
                let outputMessage = document.getElementById('customMessage')
                outputMessage.innerHTML = `<div class="text-danger"><h1>${strMessage}</h1></div>`;
            } catch (error) {
                console.log(error)
            }
            break;

        default:
            console.log(`No function found for ${data.targetFunction}`);
    }
})

console.log(`preload loaded`);