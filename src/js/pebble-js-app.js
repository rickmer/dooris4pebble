function getCurrentTime() {
        var now = new Date();
        return now.getDate() + '.' + now.getMonth() + '.' + (now.getFullYear() - 2000) + ' ' + now.getHours() + ':' + now.getMinutes();
    }

Pebble.addEventListener("ready", function(e) {
        console.log("phone is ready!");
        Pebble.sendAppMessage({1:getCurrentTime(), 2:"door is open"});
    }
);

Pebble.addEventListener("appmessage", function(e) {
        Pebble.sendAppMessage({1:getCurrentTime(), 2:"door is open"});
        console.log("received a " + e.type + " message");
        console.log("payload is: " + JSON.stringify(e.payload));
    }
);
