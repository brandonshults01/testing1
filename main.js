const {app,BrowserWindow,Menu,ipcMain, globalShortcut} = require("electron");
const http = require(`http`);
const path = require(`path`);
const electronLocalShortcut = require('electron-localshortcut');
fs = require(`fs`);
let apiLocationServer = 'apitestserver.xphasenetwork.net';
let locationWindow,successWindow,invalidLocation,sessionName,apiKey;
let loginAttempts = 0;
let localXphasePod = {
    private_ip:"0.0.0.0",
    vpn_cn:"xp000000",
}
const debugVeriables= { 
    skipCheckLocation:false,
    useDemoUser:false,
}
const template = [
    {
        label: "testItem",
    }
]
let strCustomMessage = "";
app.disableHardwareAcceleration();
// const mainMenu = Menu.buildFromTemplate(template);
// Menu.setApplicationMenu(mainMenu);

// ----------------- functions -----------------------------------------------------------------

function checkLocation(callback){
    http.get(`http://${apiLocationServer}:6098`,(resp)=> {
        let data='';
        // Chunk of data has been received.
        resp.on(`data`,(chunk)=> {
            data += chunk;
        });
        // The whole response has been received. Print out the results.
        resp.on(`end`, () => {
            console.log(`checkLocation data: ${data}`);
            if (JSON.parse(data).error == 0) {
                localXphasePod.private_ip = JSON.parse(data).private_ip;
                localXphasePod.vpn_cn = JSON.parse(data).vpn_cn;
                //app.exit();
                callback(null,"success");
                //createLoginWindow();
            } else {
                console.log('Invalid location create window')
                console.log(`checkLocation return 1`);
                callback(1,null);
                //createInvalidLocationWindow();
            }
        });
    }).on(`error`,(err) => {
        console.log(`Error (Trying to make connection): ${err.message}`);
        let cloudServerErrorWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname,"preLoadFunctions.js"),
            },
            show: false
        });
        cloudServerErrorWindow.loadFile(path.join(__dirname,'src/html/cloudServerError.html'));
        cloudServerErrorWindow.on('ready-to-show', () => {
        cloudServerErrorWindow.show();
        });
    });
}

function createLoginWindow(){
    locationWindow = new BrowserWindow({
        webPreferences: { 
            nodeIntegration: false, // is the default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(__dirname,"preLoadFunctions.js") // used to preload scripts 
        },
        setMenu: null,
        show: false
    });
    locationWindow.setMenuBarVisibility(false);
    locationWindow.loadFile(path.join(__dirname,'src/html/login.html'));
    locationWindow.on('ready-to-show', () => {
        locationWindow.show();
    }) 
  
}

function createSuccessWindow(){
    successWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname,"preLoadFunctions.js")
        },
        show: false
    });
    successWindow.setMenuBarVisibility(false);
    successWindow.loadFile(path.join(__dirname,'src/html/success.html'));
    successWindow.on('ready-to-show', () => {
        successWindow.show();
    });
}

function openClientMessage(msg){
    strCustomMessage = msg;
    clientMessageWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname,"preLoadFunctions.js")
        },
        show: false
    });
    clientMessageWindow.setMenuBarVisibility(false);
    clientMessageWindow.loadFile(path.join(__dirname,'src/html/clientMessage.html'));
    clientMessageWindow.on('ready-to-show', () => {
        clientMessageWindow.show();
    });
}

function createWakeupCallWindow(){
    wakeupCallWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname,"preLoadFunctions.js")
        },
        show: false
    });
    wakeupCallWindow.setMenuBarVisibility(false);
    electronLocalShortcut.register(wakeupCallWindow,'F12',() => {
        console.log(`Open Dev Tools`);
        wakeupCallWindow.webContents.openDevTools();
    })
    wakeupCallWindow.loadFile(path.join(__dirname,'src/html/wakeupcall.html'));
    wakeupCallWindow.on('ready-to-show', () => {
        wakeupCallWindow.show();
    });
}

function createInvalidLocationWindow(){
    invalidLocation = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname,"preLoadFunctions.js"),
        },
        show: false,
    });
    invalidLocation.setMenuBarVisibility(false);
    invalidLocation.loadFile(path.join(__dirname,'src/html/invalidLocation.html'));
    invalidLocation.on('ready-to-show', () => {
        invalidLocation.show();
    });
}

function checkAccountStatus(cb){
    http.get(`http://${localXphasePod.private_ip}:6098/accountStatus`,(resp)=> {
        let data='';
        // Chunk of data has been received.
        resp.on(`data`,(chunk)=> {
            data += chunk;
        });
        // The whole response has been received. Print out the results.
        resp.on(`end`, () => {
            console.log(`checkAccountStatus: ${data}`)
            cb(null,data)
        });
    }).on(`error`,(err)=>{
        cb(err,null);
    })
}

function validatePassword(passedData,cb){
    console.log(`data sent to server: ${JSON.stringify(passedData)}`)
    const options = {
        hostname: localXphasePod.private_ip,
        port: 6098,
        path: "/userVerify",
        method: "POST",
        headers: {
            host: localXphasePod.private_ip+ ":6098",
            "Accept": "application/json",
            "Content-Type": "application/json;charset=UTF-8",
            "content-length": JSON.stringify(passedData).length
        },
    };
    
    const req = http.request(options,(resp)=>{
        let data = "";

        resp.on('data', (d) => {
            data += d;
        });

        resp.on('end',()=>{
            if (resp.statusCode !== 200) {
                let callbackError = {
                    code: resp.statusCode,
                    message: JSON.parse(data).msg 
                }
                cb(callbackError,null);
            } else {
                try {
                    console.log(`end event triggered from server: ${JSON.stringify(data)} `);
                    cb(null,data);
                } catch (e) {
                    console.log(`JSON could not be resolved for sessionName ${JSON.stringify(data)}`)
                    let callbackError = {
                        code: e.code,
                        message: e.msg
                    }
                    cb(callbackError,null);
                }
            }

        })
    })
    
    req.on('error',(err)=>{
        console.log(`Error::: ${err.message}`);
    })
    req.write(JSON.stringify(passedData));
    req.end(console.log(`End of api response: ${sessionName}`));
}

// ----------------------------------- end of functions ---------------------------------------------
// start when application ready

console.log(`Application Name: ${app.getName()}`);
console.log(`Application Verions: ${app.getVersion()}`);
app.whenReady().then(() => {
    // check for valid location (aka same network as the XPhase Communicator)
    if (debugVeriables.skipCheckLocation == true){
        console.log(`Debug is set to true`);
        createLoginWindow()
    } 
    checkLocation( (err,data) => {
        if (err) {
            console.log(`checklocation encountered an error`);
            createInvalidLocationWindow()
        } 
        if (data == "success") {
            checkAccountStatus( (err,statusData)=> {
                if (err) {
                    console.log(`Connection Error: ${err}`)
                    openClientMessage('Could not connect to local XPhase Device')
                } else {
                    if (JSON.parse(statusData).status[0] != 0) {
                        console.log(`Account Problem: ${JSON.parse(statusData).status[1]}`)
                        openClientMessage(`There seems to be a problem with your account, please contact the office`)
                    } else {
                        createLoginWindow()
                    }
                }
                
            })
        }
    })
})

// listen for messages
ipcMain.on("toMain", (event,func,args) => {
    switch (func) {
        case 'validatePassword':
            if (debugVeriables.useDemoUser == true) {
                createSuccessWindow();
                locationWindow.close();
            } else {
                validatePassword(args, (err,data) => {
                    if (err) {
                        console.log(`Error: ${JSON.stringify(err)}`);
                        loginAttempts = loginAttempts +1;
                        console.log(`Login attempts: ${loginAttempts}`);
                        if (loginAttempts == 5){
                            app.exit();
                        } else {
                            let returnData = {
                                targetFunction:"alertbox",
                                myArgs:`Please check your voicemail password then attempt to sign in again\nLogin Attempt ${loginAttempts} of 5`,
                            }
                            event.sender.send('fromMain',returnData);
                        }
                    } else {
                        console.log(`starting callback function for validatePassword: ${data}`);
                        let accessLevel = JSON.parse(data).accessLevel;
                        console.log(`accessLevel=${accessLevel}`);
                        if (accessLevel < 0) {
                            console.log(`Access is NOT Authorized`)
                            loginAttempts = loginAttempts +1;
                            console.log(`Login attempts: ${loginAttempts}`);
                            if (loginAttempts == 5){
                                app.exit();
                            }
                        } else {
                            sessionName = data.sessionName;
                            apiKey = data.apiKey;
                            createSuccessWindow();
                            locationWindow.close();
                        }
                        
                    }
                });
            }
            break;

        case 'addWakeupCall':
            console.log(`Add wakeup call: ${JSON.stringify(args)}`);
            const awkPayload = JSON.stringify(args);
            let addRequestOptions = {
                hostname:localXphasePod.private_ip,
                port:6098,
                path:`/addWakeupCall`,
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    'content-Lenghth':Buffer.byteLength(awkPayload),
                }
            }
            var req = http.request(addRequestOptions,function(res){
                console.log(`Status: ${res.statusCode}`);
                console.log(`Headers: ${JSON.stringify(res.headers)}`);
                res.setEncoding('utf-8');
                res.on('data',function(body){
                    console.log(body);
                })
            })
            req.on('error',function(e){
                console.log(`Error: ${e.message}`);
            })
            req.write(JSON.stringify(args));
            req.end();
            break;

        case 'openWakupCalls':
            console.log('Open Wakeup Calls Screen')
            createWakeupCallWindow();
            successWindow.close();
            break;

        case 'fetchWakeupCallList':
            console.log('fetching wakeup call list');
            console.log(localXphasePod);
            http.get(`http://${localXphasePod.private_ip}:6098/listWakeupCalls`,(resp)=>{
                let data = "";
                resp.on(`data`,(chunk)=> {
                    data += chunk;
                });
                resp.on(`end`, ()=>{
                    const webResults = JSON.parse(data);
                    if (JSON.parse(data).error == 0) {
                        console.log(`Http Error`);
                    } else if (Object.keys(webResults).length == 0 ) {
                        console.log(`webResults: ${webResults}`);
                        myObjectRecordCount = Object.keys(webResults).length;
                        console.log(`count: ${myObjectRecordCount}`);
                        let returnData = {
                            targetFunction:"alertbox",
                            myArgs:`{"count":0}`,
                        }
                        event.sender.send('fromMain',returnData);
                    } else {
                        console.log(`webResults: ${webResults}`);
                        let returnData = {
                            targetFunction:"alertbox",
                            myArgs:webResults,
                        }
                        event.sender.send('fromMain',returnData);
                    }
                })
            })
            break;

        case 'deleteWakeupCall':
            console.log(`Sending api to delete wakeup call ${args}`);
            console.log(`command send to delete api: http://${localXphasePod.private_ip}:6098/deleteWakeupCall/${args}`);
            let payload = JSON.stringify(args);
            console.log(`Content-Legth: ${Buffer.byteLength(payload)}`);
            let deleteRequestOptions = {
                hostname:localXphasePod.private_ip,
                port:6098,
                path:`/deleteWakeupCall/${args}`,
                method:'DELETE',
                headers:{
                    'Content-Type':'application/json',
                    'content-Lenghth':Buffer.byteLength(payload),
                }
            }
            console.log(`delete request options: ${JSON.stringify(deleteRequestOptions)}`);

            deleteCB = function (delResp) {
                delResp.on(`data`,function (chunck) {
                    console.log(`receiving data from delete api`);
                })
            }

            http.request(deleteRequestOptions,deleteCB).end();

            break;

        case 'checkForMessages':
            let returnData = {
                targetFunction:"message",
                appVersion: app.getVersion(),
                myArgs: strCustomMessage,
            }
            event.sender.send('fromMain',returnData);
            break;
        
            case 'exitApplication':
            app.exit();

        default:
            console.log(`Function call through pipe: ${func}`);
    }
})
