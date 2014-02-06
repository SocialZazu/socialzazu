Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});

Session.set('services', null);
Session.set('resources', null);
Session.set('displayResource', null);

Deps.autorun(function() {
    Meteor.subscribe('resourcesFromServices', Session.get('services'), function() {
        var resources = Resources.find({}).fetch();
        Session.set('resources', resources);
    });

    Meteor.subscribe('services', function() {
        var services = Services.find({}, {sort:{name:1}, limit:10}).fetch();
        Session.set('services', services);
    });
});

Router.map(function() {
    this.route('index', { //Shows map of where you are + commonly-searched resources around you
        path:'/',
        layoutTemplate:'base',
    });
    this.route('resource', {  //Information about particular resource
        path:'/resource/:_id',
        layoutTemplate:'base'
    });
    this.route('service', {   //Service of Resources, e.g. Treatment Center
        path:'/service/:nameRoute',
        layoutTemplate:'base'
    });
    this.route('input', { //Backend input for Highland Workers
        path:'/input',
        layoutTemplate:'base'
    });
});

Template.base.rendered = function() {
    $('#signup-link').hide();
};

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
    }

    Deps.autorun(function() {
        var resources = Resources.find().fetch();
        _.each(resources, function(resource) {
            addMarker(resource);
        });
        if (map.markers.length > 0) {
            map.calcBounds();
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
    $('#searchServicesField').outerWidth($('#titleBox').width());
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
    $('#searchResources').outerWidth($('#displayIndex').width());
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

Meteor.startup = function() {
    $(window).resize(function(evt) {
        //do something with positioning
    });
}