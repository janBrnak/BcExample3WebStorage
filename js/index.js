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
        console.log("SUCCESS: On device read");
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

    // submit form
    $("#keyValueStorage").submit(function(event) {
        var value = $("#value").val();
        var options = new ContactFindOptions();
        var fields = ["displayName", "phoneNumbers"];

        if (!value || value.length < 3) {
            alert("Povinný počet znakov je 3 a viac!");
            return false;
        }

        options.filter = value;
        options.multiple = true;
        loader.show();

        navigator.contacts.find(fields, onSuccess, onError, options);
        console.log("SUCCESS: Submit form");
        return false;
    });

    console.log("SUCCESS: On load page");
};

// callback on success
function onSuccess(contacts) {
    var key = $("#value").val();
    var json = loadPhoneNubers(contacts);

    saveData(key, json);

    console.log("SUCCESS: Find contacts");
}

// callback on error
function onError(error) {
    console.log("ERROR: Find contacts");
}

// load phone nubers to table
function loadPhoneNubers(contacts) {
    var table = $("table#searchResult");
    var length = contacts.length;
    var html = "";
    var json = new Array();
    var i = 0;

    for (i = 0; i < length; i++) {
        if (contacts[i] && contacts[i].displayName) {
            var displayName = contacts[i].displayName;
            var phoneNumbers = numbersObjectToString(contacts[i].phoneNumbers);

            html += "<tr>";
            html += "   <td>" + displayName + "</td>";
            html += "   <td>" + phoneNumbers + "</td>";
            html += "</tr>";

            json.push({"displayName": displayName, "phoneNumbers": phoneNumbers});
        }
    }
    table.children("tbody").html(html);
    table.show();
    loader.hide();

    return json;
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
            if (sessionStorage[s] !== undefined) {
                // ak kluci nenachadza prefix, znamena to, ze nejde mo moje data zo storagu
                if (s.indexOf(prefix) === -1)
                    continue;

                var key = s.replace(prefix, "");;
                var object = JSON.parse(sessionStorage[s]);

                sHtml += "<tr>";
                sHtml += "  <td>" + key + "</td>";
                sHtml += "  <td width='20'></td>";
                sHtml += "  <td><a href='#' onclick='loadItemNumbers(\"" + key + "\", \"session\");' title='Zobraziť'>Zobraziť</a></td>";
                sHtml += "  <td><a href='#' onclick='removeFromStorage(\"" + key + "\", \"session\");' title='Zmazať'>Zmazať</a></td>";
                sHtml += "</tr>";
            }
        }

        sTable.children("tbody").html(sHtml);
        sTable.show();
        console.log("SUCCESS: Load data session storage");
    }
    else
        sTable.children("tbody").html(sHtml);

    // local
    var lLength = localStorage.length;
    var lTable = $("table#localStorage");
    var lHtml = "";
    var l = 0;

    if (lLength) {
        for (l in localStorage) {
            if (localStorage[l] !== undefined) {
                // ak kluci nenachadza prefix, znamena to, ze nejde mo moje data zo storagu
                if (l.indexOf(prefix) === -1)
                    continue;

                var key = l.replace(prefix, "");;
                var object = JSON.parse(localStorage[l]);

                lHtml += "<tr>";
                lHtml += "  <td>" + key + "</td>";
                lHtml += "  <td width='20'></td>";
                lHtml += "  <td><a href='#' onclick='loadItemNumbers(\"" + key + "\", \"local\");' title='Zobraziť'>Zobraziť</a></td>";
                lHtml += "  <td><a href='#' onclick='removeFromStorage(\"" + key + "\", \"local\");' title='Zmazať'>Zmazať</a></td>";
                lHtml += "</tr>";
            }
        }

        lTable.children("tbody").html(lHtml);
        lTable.show();
        console.log("SUCCESS: Load data local storage");
    }
    else
        lTable.children("tbody").html(lHtml);

    console.log(sessionStorage);
    console.log(localStorage);
}

// save data into local and session storage
function saveData(key, json) {
    json = JSON.stringify(json);

    // session
    if (sessionStorage[prefix + name] !== undefined)
        sessionStorage.removeItem(prefix + key);

    sessionStorage.setItem(prefix + key, json);

    // local
    if (localStorage[prefix + name] !== undefined)
        localStorage.removeItem(prefix + key);

    localStorage.setItem(prefix + key, json);

    loadData();
    console.log("SUCCESS: Save contacts");
}

// return string with phone phoneNumbers
function numbersObjectToString(numbers) {
    var length = numbers.length;
    var result = "";
    var i = 0;

    switch (typeof numbers) {
        // object
        case 'object':
            if (length) {
                result += numbers[i].value;

                for (i = 1; i < length; i++) {
                    result += ", " + numbers[i].value;
                }
            }
            break;
        // string
        case 'string':
            result = numbers;
            break;
    }

    return result;
}

// load contacts from storages
function loadItemNumbers(name, storage) {
    var contacts = [];

    switch (storage) {
        // session
        case 'session':
            if (sessionStorage[prefix + name] !== undefined) {
                contacts = JSON.parse(localStorage[prefix + name]);

                loadPhoneNubers(contacts);
            }

            break;
        // local
        case 'local':
            if (localStorage[prefix + name] !== undefined) {
                contacts = JSON.parse(localStorage[prefix + name]);

                loadPhoneNubers(contacts);
            }

            break;
    }

    console.log("SUCCESS: Load item numbers");
    return false;
}

// remove item from storage
function removeFromStorage(name, storage) {
    switch (storage) {
        // session
        case 'session':
            if (sessionStorage[prefix + name] !== undefined)
                sessionStorage.removeItem(prefix + name);

            break;
        // local
        case 'local':
            if (localStorage[prefix + name] !== undefined)
                localStorage.removeItem(prefix + name);

            break;
    }

    loadData();
    console.log("SUCCESS: Remove item");
    return false;
}

