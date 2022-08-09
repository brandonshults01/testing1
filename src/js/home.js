const electron = require('electron');
const axios = require('axios');
const ipc = electron.ipcRenderer;

const btnYes = document.getElementById('btnYes');
const btnNo = document.getElementById('btnNo');

btnYes.addEventListener('click',(event) => {
    
    axios.get('http://apitestserver.xphasenetwork.net:6098').then(function (response) {
        console.log("IP=======>",response.data.results)
        // redirect to location page
        ipc.send('load-login-page');
    }).catch(function (error) {
        document.getElementById('alert-msg').style.display = 'block';
    })
},false);

btnNo.addEventListener('click',(event) => {
    document.getElementById('alert-msg').style.display = 'block';
},false);