String.prototype.lPad = function (n,c) {
    var i; 
    var a = this.split(''); 
    for (i = 0; i < n - this.length; i++) {
        a.unshift (c);
    }; 
    return a.join('');
};

function mapStatus(p) {
    if (p == 1) {
        return 'door is open';    
    } else if (p  == 2) {
        return 'door is closed';
    } else {
        return 'unknown';
    }
}

function getTimeString(unixtime) {
    var timeaction = new Date(unixtime * 1000);
    return  [timeaction.getDate().toString().lPad(2,'0'), '.', 
            timeaction.getMonth().toString().lPad(2,'0'), '.', 
            (timeaction.getFullYear() - 2000).toString().lPad(2,'0'), ' ', 
            timeaction.getHours().toString().lPad(2,'0'), ':', 
            timeaction.getMinutes().toString().lPad(2,'0')].join('');
}

function getAPIData() {
    var theUrl = 'https://rickmer.org/pebble/example.json.php';
    var xmlHttp = new XMLHttpRequest();
    try {
        xmlHttp.open('GET', theUrl, false);
        xmlHttp.send(null);
    }
    catch(error) {
        return {'error':1};
    }
    try {
        var json = JSON.parse(xmlHttp.responseText);
    }
    catch(e) {
        return {'error':2};
    }
    return {
        'error':0,
        'timeaction':json['timeaction'], 
        'status':json['status']
    };
}

function sendData2Pebble() {
    var apiData = getAPIData();
    if (apiData['error'] === 0){
        Pebble.sendAppMessage({1:getTimeString(apiData['timeaction']), 2:mapStatus(apiData['status'])});
    } else if (apiData['error'] === 1) {
        Pebble.sendAppMessage({1:'http', 2:'error'});
    } else if (apiData['error'] === 2) {
        Pebble.sendAppMessage({1:'api', 2:'error'});
    }
}

Pebble.addEventListener("ready", function(e) {
        console.log("phone is ready!");
        sendData2Pebble();
    }
);

Pebble.addEventListener("appmessage", function(e) {
        sendData2Pebble();
        console.log("received a " + e.type + " message");
        console.log("payload is: " + JSON.stringify(e.payload));
    }
);
