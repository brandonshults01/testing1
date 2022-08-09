let ipaddress;

var username = document.forms["frmlogin"]["userName"];
var password = document.forms["frmlogin"]["passwd"];

const btnLogin = document.getElementById("btnLogin");

btnLogin.addEventListener('click', submitForm);

window.api.send("toMain","checkForMessages");

username.focus();

function submitForm(e) {
    validate();
    e.preventDefault();
    myData={
        userName: document.querySelector('#userName').value,
        passwd: document.querySelector('#passwd').value,
    }
    window.api.send("toMain","validatePassword",myData);
    console.log(`name: ${myData.name} password: ${myData.password}`);
}

// This code is remove the error message of user name
document.getElementById("name").addEventListener('keypress', (event) => {
    document.getElementById('name-error').innerHTML = '';
}, false)

// This code is remove the error message of password
document.getElementById("passwd").addEventListener('keypress', (event) => {
    document.getElementById('password-error').innerHTML = '';
}, false)

// Below code will add a click listener on button which will be triggered when any user clicks on login button
function validate(){
    let error = 0;
    
    if(username.value == ''){
        document.getElementById('name-error').innerHTML = "Please enter user name."
        username.focus();
        error++;
    }

    if(password.value == ''){
        document.getElementById('password-error').innerHTML = "Please enter password."
        password.focus();
        error++;
    }

    if(error > 0){
        return false;
    }
    else{
        return true;
    }
}