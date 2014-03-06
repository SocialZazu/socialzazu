Deps.autorun(function() {
  Meteor.subscribe('counties', function() {
    if (!Session.get('county')) {
      //change later to pan to the county where the person is
      Session.set('county', Counties.findOne({name:"Alameda"}));
    }
  });
});

Template.base.helpers({
  has_editor_permission: function() {
    return Roles.userIsInRole(Meteor.userId(), ['editor', 'admin']);
  },
  has_county_select: function() {
    return Session.get('has_county_select');
  }
});

Template.base.created = function() {
  $('input').height(25);
}

Template.select_county.helpers({
  current_county_name: function() {
    var county = Session.get('county');
    if (county) {
      return county.name;
    }
  },
  other_counties: function() {
    var county = Session.get('county');
    if (county) {
      return Counties.find({_id:{$ne:county._id}},
                           {$sort:{name:1}});
    }
  }
});

Template.select_county.events({
  'change select': function(e, tmpl) {
    var val = $(e.target).val();
    if (!(val == "current")) {
      var county = Counties.findOne({_id:val});
      Session.set('county', county);
      if (Session.get('map')) {
        var coords = county.spatial_location;
        var location = new google.maps.LatLng(coords.lat, coords.lng);
        map.panTo(location);
      }
    }
  }
});