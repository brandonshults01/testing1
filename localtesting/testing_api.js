const express = require('express');
const app = express();

let serverResponse={results:'error'};

//return error message for root url
app.get("/", (req,res) => {
        let ip = req.ip.split(':');
        serverResponse={};
        conPool.getConnection(function(err,connection){
                if (err) {
                        console.log(`pool connection error: ${err}`);
                }

                if (connection) {
                        console.log(`Connected!!`);
                        console.log(`Responding to root route, public IP Address is: '${ip[3]}'`);
			serverResponse.error=0;
                        serverResponse.private_ip = tableRows[0].private_ip;
                        serverResponse.vpn_cn = tableRows[0].vpn_cn;
                }
        });
})

app.listen(6098, () => {
        console.log("Server is up and lisening on 6098...");
});

