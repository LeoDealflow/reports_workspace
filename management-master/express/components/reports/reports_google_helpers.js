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

exports.activityobj = function(array) {
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
        var latest = sorted[i].date;
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
                if (latest < sorted[i].date)
                    latest = sorted[i].date;
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


exports.activity = function(sorted) {
    var html = '';
    var i, j;
    html += '<table class="display" id="tablePeople" cellspacing="0" width="100%"><thead><tr><th>Latest Visit</th><th>Number of Events</th><th>Activity</th><th>First Name</th><th>Last Name</th><th>Title</th><th>Company</th><th>Phone</th><th>Email</th><th>Accredited?</th></tr></thead><tbody>';
    for (i = 0; i < sorted.length; i += 1) {
        html += '<p style="font-size:16px;"></p>';
        html += '<tr><td>' + sorted[i].latest + '</td><td>' + sorted[i].activity.length + '</td><td style="text-align:center"><a data-toggle="modal" data-target="#modal' + i + '" href="#modal' + i + '"><span style="color:#000;">View</span></a></td><td>' + ((sorted[i].activity[0].first !== null) ? toTitleCase(sorted[i].activity[0].first) : '') + '</td><td>' + ((sorted[i].activity[0].last !== null) ? toTitleCase(sorted[i].activity[0].last) : '') + '</td><td>' + ((sorted[i].activity[0].title !== null) ? sorted[i].activity[0].title.toLowerCase() : '') + '</td><td>' + ((sorted[i].activity[0].company !== null) ? toTitleCase(sorted[i].activity[0].company) : '') + '</td><td>' + sorted[i].activity[0].phone + '</td><td>' + sorted[i].activity[0].email.toLowerCase() + '</td><td>' + sorted[i].activity[0].accredited + '</td></tr>';
    }
    html += '</tbody></table><br /><br /><br />'
    for (i = 0; i < sorted.length; i += 1) {
        var activity = sorted[i].activity.slice();
        for (j = 0; j < activity.length; j += 1) {
            var idstart = '';
            var idend = '';
            if (activity[j].gaevent.substr(0, 5) === 'deal-') {
                idstart = '<a href="http://dealflow.com/deals/?deal=' + activity[j].gaevent.substr(5) + '" target="_blank">';
                idend = '</a>'
            } else if (activity[j].gaevent.substr(0, 17) === 'search-view-deal-') {
                idstart = '<a href="http://dealflow.com/deals/?deal=' + activity[j].gaevent.substr(17) + '" target="_blank">';
                idend = '</a>'
            } else if (activity[j].gaevent.substr(0, 20) === 'search-untrack-deal-') {
                idstart = '<a href="http://dealflow.com/deals/?deal=' + activity[j].gaevent.substr(20) + '" target="_blank">';
                idend = '</a>'
            } else if (activity[j].gaevent.substr(0, 18) === 'search-track-deal-') {
                idstart = '<a href="http://dealflow.com/deals/?deal=' + activity[j].gaevent.substr(18) + '" target="_blank">';
                idend = '</a>'
            } else {
                idstart = '';
                idend = '';
            }
            if (j == 0) {
                html += '<div class="modal fade" id="modal' + i + '" tabindex="-1" role="dialog" aria-labelledby="modalLabel' + i + '" aria-hidden="true"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="modalLabel' + i + '" >' + activity[j].email.toLowerCase() + '</h4></div><div class="modal-body">';
                html += '<div class="table-responsive"><table class="display" id="tableActivity' + i + '" cellspacing="0" width="100%"><thead><tr><th>Date</th><th>Event</th><th>Referred By</th><th>Country</th><th>City</th></tr></thead><tbody>';
            }

            html += '<tr><td>' + activity[j].date + '</td><td>' + idstart + activity[j].gaevent + idend + '</td><td>' + activity[j].referred + '</td><td>' + activity[j].country + '</td><td>' + activity[j].city + '</td></tr>';

            if (j + 1 == activity.length) {
                html += '</tbody></table></div><br /><br /><br /></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>'
            }
        }
    }
    return html;
}

exports.activityobjga = function(array) {
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
        var latest = sorted[i].ga_created_at;
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
                if (latest < sorted[i].ga_created_at)
                    latest = sorted[i].ga_created_at;
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

exports.activityga = function(sorted) {
    var html = '';
    var i, j;
    html += '<table class="display" id="tablePeople" cellspacing="0" width="100%"><thead><tr><th>Latest Visit</th><th>Number of Events</th><th>Activity</th><th>First Name</th><th>Last Name</th><th>Title</th><th>Company</th><th>Phone</th><th>Email</th><th>Accredited?</th></tr></thead><tbody>';
    for (i = 0; i < sorted.length; i += 1) {
        html += '<p style="font-size:16px;"></p>';
        html += '<tr><td width="220">' + sorted[i].latest.substr(0, 16).replace('T', ' ') + '</td><td>' + sorted[i].activity.length + '</td><td style="text-align:center"><a data-toggle="modal" data-target="#modal' + i + '" href="#modal' + i + '"><span style="color:#000;">View</span></a></td><td>' + ((sorted[i].activity[0].first !== null) ? toTitleCase(sorted[i].activity[0].first) : '') + '</td><td>' + ((sorted[i].activity[0].last !== null) ? toTitleCase(sorted[i].activity[0].last) : '') + '</td><td>' + ((sorted[i].activity[0].title !== null) ? sorted[i].activity[0].title.toLowerCase() : '') + '</td><td>' + ((sorted[i].activity[0].company !== null) ? toTitleCase(sorted[i].activity[0].company) : '') + '</td><td>' + sorted[i].activity[0].phone + '</td><td>' + sorted[i].activity[0].email.toLowerCase() + '</td><td>' + sorted[i].activity[0].accredited + '</td></tr>';
    }
    html += '</tbody></table><br /><br /><br />'
    for (i = 0; i < sorted.length; i += 1) {
        var activity = sorted[i].activity.slice();
        for (j = 0; j < activity.length; j += 1) {
            var idstart = '';
            var idend = '';
            if (activity[j].category.substr(0, 5) === 'deal-') {
                idstart = '<a href="http://dealflow.com/deals/?deal=' + activity[j].category.substr(5) + '" target="_blank">';
                idend = '</a>'
            } else if (activity[j].category.substr(0, 17) === 'search-view-deal-') {
                idstart = '<a href="http://dealflow.com/deals/?deal=' + activity[j].category.substr(17) + '" target="_blank">';
                idend = '</a>'
            } else if (activity[j].category.substr(0, 20) === 'search-untrack-deal-') {
                idstart = '<a href="http://dealflow.com/deals/?deal=' + activity[j].category.substr(20) + '" target="_blank">';
                idend = '</a>'
            } else if (activity[j].category.substr(0, 18) === 'search-track-deal-') {
                idstart = '<a href="http://dealflow.com/deals/?deal=' + activity[j].category.substr(18) + '" target="_blank">';
                idend = '</a>'
            } else {
                idstart = '';
                idend = '';
            }
            if (j == 0) {
                html += '<div class="modal fade" id="modal' + i + '" tabindex="-1" role="dialog" aria-labelledby="modalLabel' + i + '" aria-hidden="true"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="modalLabel' + i + '" >' + activity[j].email.toLowerCase() + '</h4></div><div class="modal-body">';
                html += '<div class="table-responsive"><table class="display" id="tableActivity' + i + '" cellspacing="0" width="100%"><thead><tr><th>Date</th><th>Event</th><th>Country</th><th>Region</th><th>City</th></tr></thead><tbody>';
            }

            html += '<tr><td>' + activity[j].ga_created_at.substr(0, 16).replace('T', ' ') + '</td><td>' + idstart + activity[j].category + idend + '</td><td>' + activity[j].country + '</td><td>' + activity[j].region + '</td><td>' + activity[j].city + '</td></tr>';

            if (j + 1 == activity.length) {
                html += '</tbody></table></div><br /><br /><br /></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>'
            }
        }
    }
    return html;
}

exports.tableActivityInit = function(array) {
    var html = '';

    for (i = 0; i < array.length; i += 1) {
        html += '$("#tableActivity' + i + '").dataTable( { "order": [[0, "desc"]]} ); ';
    }
    html += '$("#tablePeople").dataTable( { "order": [[0, "desc"]]} ); ';

    return html;
}

