var theUrl = '';
var theName = '';

String.prototype.lPad = function (n,c) {
    var i; 
    var a = this.split(''); 
    for (i = 0; i < n - this.length; i++) {
        a.unshift (c);
    }; 
    return a.join('');
};

String.prototype.pebbleTrim = function (name) {

    if (this.length <= 11) {
        return this;
    }

    var words = this.split(' ');
    var returnValue = '';

    for (var i = 0; i < words.length; i++) {
        returnValue += words[i]
        if (returnValue.length >= 11) {
            return returnValue;
        } else if (returnValue.length + words[i+1].length >= 11) {
            return returnValue;
        }
        returnValue += ' ';
    }
    return returnValue;
}

function mapStatus(p) {
    if (p) {
        return 'door is open';    
    } else if (!p) {
        return 'door is closed';
    } else {
        return 'unknown';
    }
}

function getTimeString(unixtime) {
    var timeaction = new Date(unixtime * 1000);
    return  [timeaction.getDate().toString().lPad(2,'0'), '.', 
            (timeaction.getMonth() + 1).toString().lPad(2,'0'), '.', 
            (timeaction.getFullYear() - 2000).toString().lPad(2,'0'), ' ', 
            timeaction.getHours().toString().lPad(2,'0'), ':', 
            timeaction.getMinutes().toString().lPad(2,'0')].join('');
}

function getAPIData() {
    
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
        'timeaction':json['state']['lastchange'], 
        'status':json['state']['open']
    };
}

function sendData2Pebble() {
    var apiData = getAPIData();
    if (apiData['error'] === 0){
        Pebble.sendAppMessage({1:getTimeString(apiData['timeaction']), 
                               2:mapStatus(apiData['status']),
                               3:theUrl,
                               4:theName.pebbleTrim()});
    } else if (apiData['error'] === 1) {
        Pebble.sendAppMessage({1:'settings', 2:'open'});
    } else if (apiData['error'] === 2) {
        Pebble.sendAppMessage({1:'api', 2:'error'});
    }
}

Pebble.addEventListener("ready", function(e) {
        console.log("phone is ready!");
    });

Pebble.addEventListener("appmessage", function(e) {
        theUrl = e.payload[3]; 
        sendData2Pebble();
        console.log("received a " + e.type + " message");
        console.log("payload is: " + JSON.stringify(e.payload));
    });

Pebble.addEventListener("showConfiguration", function() {
        console.log("showing configuration");
        Pebble.openURL('https://rickmer.org/pebble');
    });

Pebble.addEventListener("webviewclosed", function(e) {
        console.log("configuration closed");
        var options = JSON.parse(decodeURIComponent(e.response));
        theUrl = options['3'];
        theName = options['4'];
        sendData2Pebble();
        console.log("Options = " + JSON.stringify(options));
});
