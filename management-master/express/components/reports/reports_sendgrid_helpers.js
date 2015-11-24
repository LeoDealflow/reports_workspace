/** Google Helper Functions **/

var convertemail = function(email) {
    if (email.indexOf('|') !== -1) {
        email = email.substring(2, email.length);
    }
    var repar = new RegExp('^.*?\([^\d]*(\d+)[^\d]*\).*$');
    if (email.indexOf('(') !== -1) {
        var n = email.indexOf('(');
        email = email.substring(0, n - 1);
    }
    return email.toLowerCase();
}

var convertviewed = function(field) {
    if (field.indexOf('/') === 0) {
        field = field.substring(1, field.length);
    }
    return field;
}

var getcontext = function(email) {
    if (email.indexOf('=:Marcom') !== -1) {
        return 'marcom';
    } else {
        return 'application';
    }
}

var convertdeal = function(field) {
    if (field.indexOf('deal-') === 0) {
        field = field.substring(5, field.length);
    }
    return field;
}

var toTitleCase = function(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

exports.convertemail = function(email) {
    if (email.indexOf('|') !== -1) {
        email = email.substring(2, email.length);
    }
    var repar = new RegExp('^.*?\([^\d]*(\d+)[^\d]*\).*$');
    if (email.indexOf('(') !== -1) {
        var n = email.indexOf('(');
        email = email.substring(0, n - 1);
    }
    return email.toLowerCase();
}
exports.convertviewed = function(field) {
    if (field.indexOf('/') === 0) {
        field = field.substring(1, field.length);
    }
    return field;
}

exports.activityobjsg = function(array) {
    var activityobj = new Array();
    var html = '';
    var sorted = array.sort(function(a, b) {
        var x, y;
        x = a.email;
        y = b.email;
        if (x > y) {
            return 1;
        }
        if (x < y) {
            return -1;
        }
        return 0;
    });
    var i;
    var j = 0;
    for (i = 0; i < sorted.length; i += 1) {
        var latest = sorted[i].sendgrid_created_at;
        var userobj = new Array();
        userobj[j] = {};
        userobj[j].email = sorted[i].email;
        if (i < sorted.length - 1) {
            var k = 0;
            userobj[j].activity = new Array();
            userobj[j].activity[k] = sorted[i];
            while (sorted[i].email === sorted[i + 1].email) {
                k += 1;
                userobj[j].activity[k] = sorted[i];
                i += 1;
                if (latest < sorted[i].sendgrid_created_at)
                    latest = sorted[i].sendgrid_created_at;
                if (i === sorted.length - 1) {
                    break;
                }
            }
            userobj[j].latest = latest;
            activityobj.push(userobj[j]);
            j += 1;
        }
    }
    var activity = activityobj.sort(function(a, b) {
        var x, y;
        x = a.latest;
        y = b.latest;
        if (x < y) {
            return 1;
        }
        if (x > y) {
            return -1;
        }
        return 0;
    });
    return activity;
}

exports.activitysg = function(sorted) {
    var html = '';
    var i, j;
    html += '<table class="display" id="tablePeople" cellspacing="0" width="100%"><thead><tr><th>Latest Visit</th><th>Action</th><th>First Name</th><th>Last Name</th><th>Title</th><th>Company</th><th>Phone</th><th>Email</th><th>Accredited?</th></tr></thead><tbody>';
    for (i = 0; i < sorted.length; i += 1) {
        var utc = new Date(sorted[i].latest);
        utc = utc.toISOString();
        sorted[i].latest = utc.substr(0, 16).replace('T', ' ');
        html += '<p style="font-size:16px;"></p>';
        html += '<tr><td width="220">' + sorted[i].latest + '</td><td>' + sorted[i].activity[0].event + '</td><td>' + ((sorted[i].activity[0].first !== null) ? toTitleCase(sorted[i].activity[0].first) : '') + '</td><td>' + ((sorted[i].activity[0].last !== null) ? toTitleCase(sorted[i].activity[0].last) : '') + '</td><td>' + ((sorted[i].activity[0].title !== null) ? sorted[i].activity[0].title.toLowerCase() : '') + '</td><td>' + ((sorted[i].activity[0].company !== null) ? toTitleCase(sorted[i].activity[0].company) : '') + '</td><td>' + sorted[i].activity[0].phone + '</td><td>' + sorted[i].activity[0].email.toLowerCase() + '</td><td>' + sorted[i].activity[0].accredited + '</td></tr>';
    }
    html += '</tbody></table><br /><br /><br />'
    return html;
}

exports.tableActivityInit = function(array) {
    var html = '';
    html += '$("#tablePeople").dataTable( { "order": [[0, "desc"]]} ); ';

    return html;
}

