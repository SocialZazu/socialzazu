Accounts.ui.config({
    passwordSignupFields: 'EMAIL_ONLY'
});

Session.set('services', null);
Session.set('resources', null);
Session.set('displayResource', null);
Session.set('mapResources', []);
Session.set('searchServicesDatums', []);
Session.set('flagsFromUser', []);
Session.set('bounded', false);

Deps.autorun(function() {
    Meteor.subscribe('resourcesFromServices', Session.get('services'), function() {
        var resources = Resources.find({}).fetch();
        Session.set('resources', resources);
    });

    Meteor.subscribe('resourcesFromMap', Session.get('mapResources'));

    Meteor.subscribe('services', function() {
        //change this later to be the preferred ones on the front page, not the most count
        var services = Services.find({}, {sort:{count:0}, limit:10}).fetch();
        Session.set('services', services);

        var searchServicesDatums = [];
        _.each(Services.find({}).fetch(), function(service) {
            searchServicesDatums.push({value:service.name, nameRoute:service.nameRoute, count:service.count});
        });
        Session.set('searchServicesDatums', searchServicesDatums);
    });

    Meteor.subscribe('flagsFromUser', Meteor.userId(), function() {
        if (!Meteor.userId()) {
            Session.set('flagsFromUser', []);
        } else {
            var flag_resource_ids = [];
            Flags.find().forEach(function(flag) {
                    flag_resource_ids.push(flag.resource_id);
            });
            Session.set('flagsFromUser', flag_resource_ids);
        }
    });
});

hasEditorPermission = function(user) {
    if (!user || !user.profile) {
        return false;
    }

    role = user.profile.role
    if (role == "admin" || role == "approved") {
        return true;
    } else {
        return false;
    }
};

Router.map(function() {
    this.route('index', { //Shows map of where you are + commonly-searched resources around you
        path:'/',
    });
    this.route('resource', {  //Information about particular resource
        path:'/resource/:_id',
    });
    this.route('service', {   //Service of Resources, e.g. Treatment Center
        path:'/service/:nameRoute',
    });
    this.route('editor', { //Backend input for Highland Workers
        path:'/editor',
        waitOn: function() {
            return Meteor.subscribe('services');
        },
        before: function() {
            if (!hasEditorPermission(Meteor.user())) {
                this.stop();
            } else {
                Session.set('services', Services.find({}).fetch());
            }
        },
    });
});

Router.configure({
    notFoundTemplate:'notFound',
    layoutTemplate:'base'
})

Template.base.rendered = function() {
    $('input').height(25);
}

Template.base.hasEditorPermission = function() {
    return hasEditorPermission(Meteor.user());
}

initializeMapSearch = function() {
    var input = document.getElementById('searchMapField');
    var autocomplete = new google.maps.places.Autocomplete(input, {types:['geocode']});
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        if (place.geometry) {
            map.panTo(place.geometry.location);
            map.setZoom(14);
        } else {
            input.placeholder = 'Change Location';
        }
    });
};

Template.mapIndex.rendered = function() {
    if (!Session.get('map')) {
        map.initializeMap();
        google.maps.event.addListener(map.map, 'bounds_changed', function() {
            Session.set('mapResources', map.markersInBounds());
        });
    }

    Deps.autorun(function() {
        var resources = Resources.find().fetch();
        _.each(resources, function(resource) {
            addMarker(resource);
        });
        if (!Session.get('bounded') && map.markers.length > 0) {
            map.calcBounds();
            Session.set('bounded', true);
        }
    });

    var h = $('#servicesIndex').height()
    $('#map').css("height", h);
}

Template.searchMap.rendered = function() {
    initializeMapSearch();
    $('#searchMapField').outerWidth($('#map').width());
}

Template.searchServices.rendered = function() {
    $('#searchServicesField').outerWidth($('#servicesIndex').width());
    $('#searchServicesField').typeahead({
        local:Session.get('searchServicesDatums'),
    }).on('typeahead:selected', function(event, datum) {
        Router.go('/service/' + datum.nameRoute);
    });
}

addMarker = function(resource) {
    if (typeof resource.lat !== 'undefined' &&
        typeof resource.lng !== 'undefined') {
        if (map.markerExists(resource._id)) {
            map.addExistingMarker(resource);
        } else {
            map.addNewMarker({id:resource._id, title:resource.name,
                              lat:resource.lat, lng:resource.lng});
        }
    }
};

Template.mapIndex.destroyed = function() {
    Session.set('map', false);
};

var colors = ["#74F0F2", "#B3F2C2", "#DCFA9B", "#FABDFC", "#F5A2AD",
              "#BDC9FC", "#A2B2F5", "#F5E1A2", "#AEF5A2", "#42F55D"];

Template.services.rendered = function() {
    addAllSelected();
    geocodeCheck(Session.get('resources'));
}

var geocodeCheck = function(resources) {
    _.each(resources, function(resource) {
        if (!resource.lat) {
            map.assignGeocode(resource);
        }
    });
}

Template.services.services = function() {
    var services = [];
    var i = 0;
    _.each(Session.get('services'), function(service) {
        service.color = colors[i];
        services.push(service);
        i++;
    });
    return services;
};

var removeAllSelected = function() {
    $('.selected').not('.titleBox').css('background-color', "#fff");
    $('.selected').removeClass('selected');
}

var addAllSelected = function() {
    $('.serviceBox').addClass('selected');
    _.each($('.serviceBox').not('.titleBox'), function(box) {
        box.style.backgroundColor = box.getAttribute('color');
    });
}

removeMarker = function(resource) {
    map.removeMarker(resource);
    var index = Session.get('mapResources').indexOf(resource._id);
    if (index > -1) {
        var mapResources = Session.get('mapResources');
        mapResources.splice(index, 1);
        Session.set('mapResources', mapResources);
    }
};

addExistingMarker = function(resource) {
    map.addExistingMarker(resource);
};

Template.services.events({
    'click .serviceBox': function(e, tmpl) {
        var box = $(e.target).closest('.serviceBox');
        if (box.hasClass('titleBox')) {
            if (box.hasClass('selected')) {
                removeAllSelected();
                _.each(Session.get('resources'), function(resource) {
                    removeMarker(resource);
                });
            } else {
                addAllSelected();
                _.each(Session.get('resources'), function(resource) {
                    addExistingMarker(resource);
                });
            }
        } else if (box.hasClass('selected')) {
            box.removeClass('selected');
            adjustMapDisplay(box, removeMarker);
            box.css('background-color', '#fff');
        } else {
            box.addClass('selected');
            adjustMapDisplay(box, addExistingMarker);
            box.css('background-color', box.attr('color'));
        }
    }
});

adjustMapDisplay = function(box, f) {
    var color = box.attr('color');
    var colorIndex = colors.indexOf(color);
    var services = Session.get('services');
    if (colorIndex != -1 && colorIndex < services.length) {
        var service = Session.get('services')[colorIndex];
        _.each(Session.get('resources'), function(resource) {
            if (resource.services.indexOf(service._id) != -1) {
                f(resource);
            }
        });
    }
};

Template.searchResources.rendered = function() {
    $('#searchResourcesField').outerWidth($('#displayIndex').width());
};

Template.displayIndex.resource = function() {
    return Session.get('displayResource');
};

Template.displayIndex.services = function() {
    resource = Session.get('displayResource');
    if (resource) {
        return Services.find({_id:{$in:resource.services}});
    }
};

Template.displayIndex.flagOn = function() {
    flagsFromUser = Session.get('flagsFromUser');
    if (flagsFromUser.indexOf(Session.get('displayResource')._id) > -1) {
        return 'red';
    } else {
        return '';
    }
}

Template.displayIndex.events({
    'click .flag': function(e, tmpl) {
        flag = $(tmpl.find('.glyphicon-flag'));
        if (!flag.hasClass('red')) {
            Meteor.call("flagResource", $('.flag')[0].id, Meteor.userId());
            if (!Meteor.userId()) { //should auto add if there is a userId
                flag.addClass('red');
            }
        }
    }
});

Template.user_loggedout.events({
    "click #login": function(e, tmpl) {
        Meteor.loginWithPassword()
    }
})

Template.user_loggedin.events({
    "click #logout": function(e, tmpl) {
        Meteor.logout(function(err) {
            if (err) {
                console.log(err);
            }
        });
    }
});

Template.showMapResources.hasMapResources = function() {
    console.log('has map res');
    console.log(Session.get('mapResources'));
    return Session.get('mapResources').length > 0;
}

Template.showMapResources.mapResources = function() {
    var ids = Session.get('mapResources');
    return Resources.find({_id:{$in:ids}});
}

Meteor.startup = function() {
    $(window).resize(function(evt) {
        //do something with positioning
    });
}