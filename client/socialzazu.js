Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});

Session.set('services', null);
Session.set('resources', null);

Deps.autorun(function() {
    Meteor.subscribe('resourcesFromServices', Session.get('services'), function() {
        var resources = Resources.find({}).fetch();
//         _.each(Session.get('services'), function(service) {

//         Session.set('resources'
});

var servicesHandle = Meteor.subscribe('services', function() {
    var services = Services.find({}, {sort:{name:1}, limit:5}).fetch();
    Session.set('services', services);
});

var resourcesHandle = Meteor.subscribe('resourcesFromServices', function(service_id_array) {
    var resources = Resources.find({}).fetch();
    Session.set('resources', resources);
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

Template.mapIndex.rendered = function() {
    if (!Session.get('map')) {
        map.initializeMap();
    }

    Deps.autorun(function() {
        var resources = Resources.find().fetch();
        _.each(resources, function(resource) {
            if (typeof resource.lat !== 'undefined' &&
                typeof resource.lng !== 'undefined') {
                var objMarker = {id:resource._id, title:resource.name,
                                 lat:resource.lat, lng:resource.lng};
            }
            if (!map.markerExists('id', objMarker.id)) {
                map.addMarker(objMarker);
            }
        });
    });
}

Template.mapIndex.destroyed = function() {
    Session.set('map', false);
};

var colors = ["#74F0F2", "#B3F2C2", "#DCFA9B", "#FABDFC", "#BDC9FC"];

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

Template.services.events({
    'click .serviceBox': function(e, tmpl) {
        var box = $(e.target).closest('.serviceBox');
        if (box.hasClass('titleBox')) {
            if (box.hasClass('selected')) {
                removeAllSelected();
                //update maps to exclude everything
            } else {
                addAllSelected();
                //update maps to include everything
            }
        } else if (box.hasClass('selected')) {
            box.removeClass('selected');
            box.css('background-color', '#fff');
            //update maps to exclude this one
        } else {
            box.addClass('selected');
            box.css('background-color', box.attr('color'));
            //update maps to include this one
        }
    },
});