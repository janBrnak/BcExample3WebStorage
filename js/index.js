const DEVICE_TYPE = 'mobile';  // browser or mobile

var loader = null
var navig = null;
var sessionStorage = null;
var localStorage = null;
var prefix = "searchResult: ";

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        switch (DEVICE_TYPE) {
            case 'mobile':
                document.addEventListener('deviceready', this.onDeviceReady, false);
                break;
            case 'browser':
                this.onDeviceReady();
                break;
            default:
                this.onDeviceReady();
                break;
        }
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        onLoad();
        console.log("SUCCESS: Load device");
    }
};

function resetForm() {
    $("#value").val("");
    resetTable("table#searchResult");
    console.log("SUCCESS: Reset form");
}

function resetStorage() {
    sessionStorage.clear();
    localStorage.clear();

    resetTable("table.listItems");

    alert("Storage bol zmazany");
    console.log("SUCCESS: Clear storages");
}

function resetTable(element) {
    var table = $(element);

    table.hide();
    table.children("tbody").html("&nbsp;");
}

// on load
function onLoad() {
    loader = $(".loader");
    sessionStorage = window.sessionStorage;;
    localStorage = window.localStorage;

    loadData();

    // slide formular
    $("span.toogleForm").click(function() {
        $("#keyValueStorage").slideToggle("slow");
    });

    // submit form
    $("#keyValueStorage").submit(function(event) {
        var value = $("#value").val();
        var options = new ContactFindOptions();
        var fields = ["displayName", "phoneNumbers"];

        options.filter = value;
        options.multiple = true;
        loader.show();

        navigator.contacts.find(fields, onSuccess, onError, options);
        console.log("SUCCESS: Submit form");
        return false;
    });

    // remove session item
    $("a#sessionRemoveItem").click(function() {
        var key = $("#sessionStorage").data("key");
        removeItem(key, "session");
    });

    // remove locale item
    $("a#localeRemoveItem").click(function() {
        var key = $("#sessionStorage").data("key");
        removeItem(key, "locale");
    });
};

// callback on success
function onSuccess(contacts) {
    var table = $("table#searchResult");
    var key = $("#value").val();
    var length = contacts.length;
    var html = "";
    var json = {};
    var i = 0;

    for (i = 0; i < length; i++) {
        if (contacts[i] && contacts[i].displayName) {
            var displayName = contacts[i].displayName;
            var phoneNumbers = numbersObjectToString(contacts[i].phoneNumbers);

            html += "<tr>";
            html += "   <td>" + displayName + "</td>";
            html += "   <td>" + phoneNumbers + "</td>";
            html += "</tr>";

            json[i] = {"displayName": displayName, "phoneNumbers": phoneNumbers};
        }
    }
    table.children("tbody").html(html);
    table.show();
    loader.hide();

    saveData(key, json);
    console.log("SUCCESS: find contacts");
}

// callback on error
function onError(error) {
    console.log("ERROR: find contacts");
}

// load data from local and session storage
function loadData() {
    // session
    var sLength = sessionStorage.length;
    var sTable = $("table#sessionStorage");
    var sHtml = "";
    var s = 0;

    if (sLength) {
        for (s in sessionStorage) {
            if (localStorage[s] !== undefined) {
                var key = "";
                var object = JSON.parse(sessionStorage[s]);

                // ak kluci nenachadza prefix, znamena to, ze nejde mo moje data zo storagu
                if (s.indexOf(prefix) === -1)
                    continue;

                key = s.replace(prefix, "");

                sHtml += "<tr>";
                sHtml += "   <td>" + key + "</td>";
                //sHtml += "   <td></td>";
                //sHtml += "   <td><a href='JavaScript:void(0);' id='sessionRemoveItem'  data-key='" + key + "' title='Zmazat'>Zmazat</a></td>";
                sHtml += "</tr>";
            }
        }

        sTable.children("tbody").html(sHtml);
        sTable.show();
    }

    // local
    var lLength = localStorage.length;
    var lTable = $("table#localStorage");
    var lHtml = "";
    var l = 0;

    if (lLength) {
        for (l in localStorage) {
            if (localStorage[l] !== undefined) {
                var key = "";
                var object = JSON.parse(localStorage[l]);

                // ak kluci nenachadza prefix, znamena to, ze nejde mo moje data zo storagu
                if (l.indexOf(prefix) === -1)
                    continue;

                key = l.replace(prefix, "");

                lHtml += "<tr>";
                lHtml += "   <td>" + key + "</td>";
                //lHtml += "   <td></td>";
                //lHtml += "   <td><a href='JavaScript:void(0);' id='localeRemoveItem' data-key='" + key + "' title='Zmazat'>Zmazat</a></td>";
                lHtml += "</tr>";
            }
        }

        lTable.children("tbody").html(lHtml);
        lTable.show();
        console.log("SUCCESS: Load data");
    }
}

// save data into local and session storage
function saveData(key, json) {
    json = JSON.stringify(json);

    // session
    sessionStorage.removeItem(prefix + key);
    sessionStorage.setItem(prefix + key, json);
    // local
    localStorage.removeItem(prefix + key);
    localStorage.setItem(prefix + key, json);

    loadData();
    console.log("SUCCESS: Save contacts");
}

// return string with phone phoneNumbers
function numbersObjectToString(object) {
    var length = object.length;
    var result = "";
    var i = 0;

    if (length) {
        result += object[i].value;

        for (i = 1; i < length; i++) {
            result += ", " + object[i].value;
        }
    }

    return result;
}

function removeItem(id, type) {
    // alert(id);
    // alert(type);
}

