/** Helpers for views/reports/gaform.html **/


function clearform() {
    $("#to").val('');
    $("#from").val('');
    $("#userto").val('');
    $("#userfrom").val('');
    $("#activeto").val('');
    $("#activefrom").val('');
    $("#emailto").val('');
    $("#emailfrom").val('');
    $("#sglocalto").val('');
    $("#sglocalfrom").val('');
    $("#sggato").val('');
    $("#sggafrom").val('');
    $("#archiveto").val('');
    $("#archivefrom").val('');
    $("#usernamecheck").prop("checked", false);
    $("#username").val('');
    $("#actioncheck").prop("checked", false);
    $("#action").val('');
    $("#categoryacheck").prop("checked", false);
    $("#categorya").val('');
    $("#categorybcheck").prop("checked", false);
    $("#categoryb").val('');
}

function setform(to, from, username, action, categorya, categoryb) {
    clearform();
    if (to) {
        $("#to").val(to);
    }
    if (from) {
        $("#from").val(from);
    }
    if (username) {
        $("#usernamecheck").prop("checked", true);
        $("#username").val(username);
    }
    if (action) {
        $("#actioncheck").prop("checked", true);
        $("#action").val(action);
    }
    if (categorya) {
        $("#categoryacheck").prop("checked", true);
        $("#categorya").val(categorya);
    }
    if (categoryb) {
        $("#categorybcheck").prop("checked", true);
        $("#categoryb").val(categoryb);
    }
}

function setformuser(to, from, username) {
    clearform();
    if (to) {
        $("#userto").val(to);
    }
    if (from) {
        $("#userfrom").val(from);
    }
    if (username) {
        $("#userusername").val(username);
    }
}

function setformlive(to, from) {
    clearform();
    if (to) {
        $("#liveto").val(to);
    }
    if (from) {
        $("#livefrom").val(from);
    }
}

function setformactive(to, from) {
    clearform();
    if (to) {
        $("#activeto").val(to);
    }
    if (from) {
        $("#activefrom").val(from);
    }
}

function setformemail(to, from) {
    clearform();
    if (to) {
        $("#emailto").val(to);
    }
    if (from) {
        $("#emailfrom").val(from);
    }
}

function setsglocalemail(to, from) {
    clearform();
    if (to) {
        $("#sglocalto").val(to);
    }
    if (from) {
        $("#sglocalfrom").val(from);
    }
}

function setsggaemail(to, from) {
    clearform();
    if (to) {
        $("#sggato").val(to);
    }
    if (from) {
        $("#sggafrom").val(from);
    }
}

function setformarchive(to, from) {
    clearform();
    if (to) {
        $("#archiveto").val(to);
    }
    if (from) {
        $("#archivefrom").val(from);
    }
}

function today() {
    var now = new Date();
    var month = (Number(now.getMonth()) + 1).toString();
    var day = (Number(now.getDate())).toString();

    if (Number(now.getDate()) < 10) {
        day = ['0', day].join('');
    }
    if ((Number(now.getMonth()) + 1) < 10) {
        month = ['0', month].join('');
    }
    return now.getFullYear() + '-' + month + '-' + day;
}

function yesterday() {
    var now = new Date();
    var timestamp = now.getTime();
    var back = 1000 * 60 * 60 * 24;
    timestamp = timestamp - back;
    now = new Date(timestamp);

    var month = (Number(now.getMonth()) + 1).toString();
    var day = (Number(now.getDate())).toString();
    if (Number(now.getDate()) < 10) {
        day = ['0', day].join('');
    }
    if ((Number(now.getMonth()) + 1) < 10) {
        month = ['0', month].join('');
    }
    return now.getFullYear() + '-' + month + '-' + day;
}

function twodays() {
    var now = new Date();
    var timestamp = now.getTime();
    var back = 1000 * 60 * 60 * 24 * 2;
    timestamp = timestamp - back;
    now = new Date(timestamp);

    var month = (Number(now.getMonth()) + 1).toString();
    var day = (Number(now.getDate())).toString();
    if (Number(now.getDate()) < 10) {
        day = ['0', day].join('');
    }
    if ((Number(now.getMonth()) + 1) < 10) {
        month = ['0', month].join('');
    }
    return now.getFullYear() + '-' + month + '-' + day;
}

function manydays() {
    var now = new Date();
    var timestamp = now.getTime();
    var back = 1000 * 60 * 60 * 24 * 90;
    timestamp = timestamp - back;
    now = new Date(timestamp);

    var month = (Number(now.getMonth()) + 1).toString();
    var day = (Number(now.getDate())).toString();
    if (Number(now.getDate()) < 10) {
        day = ['0', day].join('');
    }
    if ((Number(now.getMonth()) + 1) < 10) {
        month = ['0', month].join('');
    }
    return now.getFullYear() + '-' + month + '-' + day;
}

function sevendays() {
    var now = new Date();
    var timestamp = now.getTime();
    var back = 1000 * 60 * 60 * 24 * 7;
    timestamp = timestamp - back;
    now = new Date(timestamp);

    var month = (Number(now.getMonth()) + 1).toString();
    var day = (Number(now.getDate())).toString();
    if (Number(now.getDate()) < 10) {
        day = ['0', day].join('');
    }
    if ((Number(now.getMonth()) + 1) < 10) {
        month = ['0', month].join('');
    }
    return now.getFullYear() + '-' + month + '-' + day;
}

function wednesday(offset) {
    var ret = new Date();
    var adjustment = 3 - ret.getDay();
    ret.setDate(ret.getDate() + adjustment + offset);
    var month = (Number(ret.getMonth()) + 1).toString();
    var day = (Number(ret.getDate())).toString();

    if (Number(ret.getDate()) < 10) {
        day = ['0', day].join('');
    }
    if ((Number(ret.getMonth()) + 1) < 10) {
        month = ['0', month].join('');
    }
    return ret.getFullYear() + '-' + month + '-' + day;
}

function checkfield(field) {
    if (field === 1) {
        if ($("#username").val() === '')
            ($("#usernamecheck").prop("checked", false));
        else
            ($("#usernamecheck").prop("checked", true));
    } else if (field === 2) {
        if ($("#categorya").val() === '')
            ($("#categoryacheck").prop("checked", false));
        else
            ($("#categoryacheck").prop("checked", true));
    } else if (field === 3) {
        if ($("#action").val() === '')
            ($("#actioncheck").prop("checked", false));
        else
            ($("#actioncheck").prop("checked", true));
    } else if (field === 4) {
        if ($("#categoryb").val() === '')
            ($("#categorybcheck").prop("checked", false));
        else
            ($("#categorybcheck").prop("checked", true));
    }
}