var send_json = function(data, url, method, on_success, on_failure) {
    jQuery.ajax(url, {
        contentType: 'application/json; charset=utf-8',
        method: method,
        dataType: 'json',
        data: JSON.stringify(data),
        success: on_success,
        error: on_failure
    });
}

var getCoordinates = function(callback) {
    navigator.geolocation.getCurrentPosition(callback);
}

var setUpdateDateTime = function(update) {
    localStorage.setItem("update_datetime", update ? "true" : "false");
}

var sendCoordinates = function(position) {
    send_json({
        "update_datetime": true,
        "timestamp": position.timestamp / 1000.,
        "coords": {
            "accuracy": position.coords.accuracy,
            "altitude": position.coords.altitude,
            "altitudeAccuracy": position.coords.altitudeAccuracy,
            "latitude": position.coords.latitude,
            "longitude": position.coords.longitude,
        }
    }, '/coordinates', 'PUT');
}


var newPortURL = function(port) {
     return "http://" + window.location.hostname + ":" + port;
}

var openINDIControlPanel = function() {
    window.open(newPortURL(8624),'_blank');
}

var openShellinabox = function() {
    window.open(newPortURL(4200),'_blank');
}

var shutdown = function() {
    jQuery.ajax('/shutdown', {
        method: 'POST',
        success: function() { $('#shutdown-alert').show() }
    });
}

var fetchTemp = function() {
    jQuery.ajax('/temp_humidity', {
        method: 'GET',
        success: function(e) {
            $('#temp_humidity').show();
            $('#temperature_value').text(e.temperature.toFixed(2));
            $('#humidity_value').text(e.humidity.toFixed(2));
            if(e.saving) {
                $('#save_temp_humidity_btn').hide();
                $('#stop_save_temp_humidity_btn').show();
            } else {
                $('#save_temp_humidity_btn').show();
                $('#stop_save_temp_humidity_btn').hide();
            }
        },
        error: function(e) {
            if(e.status == 404) {
                window.clearInterval(tempTimer);
            }
        }
    });
}

var appendEvent = function(event) {
    if(lastEventIndex < event.index)
        lastEventIndex = event.index
        html_event_id = 'event_id_' + event.index
    event_html = '<tr id="' + html_event_id + '"><td><small>' +
    event.index + 
    '</small></td><td><small>' +
    new Date(event.time * 1000).toLocaleString() +
    '</small></td><td><small>' +
    event.type +
    '</small></td><td><small>' +
    event.text +
    '</small></td></tr>';
    if( $('#' + html_event_id).length > 0) {
      $('#' + html_event_id).replaceWith(event_html);
    } else {
      $('#events_placeholder').after(event_html);
    }
}

appendEvents = function(events) {
    events.sort(function(a, b) { return a.index - b.index });
    events.forEach(appendEvent);
}

fetchEvents = function() {
    jQuery.ajax('/events?start=' + (lastEventIndex+1), {
        method: 'GET',
        success: appendEvents
    });
}

saveTempHumidity = function() {
    $('#save_temp_humidity_btn').hide();
    jQuery.ajax('/save_temp_humidity', {
        method: 'PUT',
    });
}

stopSaveTempHumidity = function() {
    $('#stop_save_temp_humidity_btn').hide();
    jQuery.ajax('/save_temp_humidity', {
        method: 'DELETE',
    });
}


var eventsTimer = window.setInterval(fetchEvents, 1000);
var tempTimer = window.setInterval(fetchTemp, 2000);
var lastEventIndex = -1;
