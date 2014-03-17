Deps.autorun(function() {
  Meteor.subscribe(
    'resources_from_services',
    map_arr_to_object_arr(Session.get('match_services'), '_id'),
    Session.get('county')
  )
});

Template.match.created = function() {
  Session.set('match_choices', {});
  Session.set('match_services', []);
}

Template.match.helpers({
  category_specific_inputs: function() {
    return {
      values: null,
      services: get_service_names_with_parent_inputs(Session.get('match_services'))
    }
  },
});

Template.match_input.events({
  'change select': function(e, tmpl) {
    var val = $(e.target).val();
    var field = this.field;
    if (!(val == 'instr')) {
      session_var_push_obj('match_choices', field, val);
    }
  },
  'click .remove_dropdown': function(e, tmpl) {
    var a = $(e.target).closest('a');
    var id = a.attr('id');
    var field = a.attr('field');
    session_var_splice_obj('match_choices', field, id);
  }
})

Template.match_input.helpers({
  is_type: function(type) {
    return this.type == type;
  },
  list: function() {
    return Session.get('match_choices')[this.field];
  },
  other_list: function() {
    var choices = Session.get('match_choices');
    if (!(this.field in choices)) {
      return this.list;
    }
    var field_choices = choices[this.field];
    return array_diff(this.list, field_choices);
  }
})

Template.match_inputs.helpers({
  inputs: function() {
    return category_specific_inputs(this.services, this.values);
  }
})

Template.match_results.helpers({
  results: function() {
    var query_match_choices = {'sub_service_ids':{'$in':Session.get('match_services')}};
    var match_choices = Session.get('match_choices');
    for (var key in match_choices) {
      var values = match_choices[key];
      if (typeof values == "boolean" || typeof values == "string") {
        query_match_choices['category_specific_inputs.' + key] = values;
      } else {
        query_match_choices['category_specific_inputs.' + key] = {'$all':values}
      }
    }
    return Resources.find(query_match_choices)
// query_match_choices});
  }
});

Template.match_service.events({
  'click .remove_service': function(e, tmpl) {
    var id = $(e.target).attr('id');
    session_var_splice('match_services', id);
  },
  'change select': function(e, tmpl) {
    var id = $(e.target).val();
    session_var_push('match_services', id);
  }
});

Template.match_service.helpers({
  list: function() {
    return Services.find({parents:{$exists:true, $ne:null}, _id:{$in:Session.get('match_services')}}, {sort:{name:1}, _id:true, name:true}).map(function(service) {
      return {id:service._id, value:service.name, remove_key:'remove_service_from_matches'};
    });
  },
  other_list: function() {
    return Services.find({parents:{$exists:true, $ne:null}, _id:{$not:{$in:Session.get('match_services')}}}, {sort:{name:1}, _id:true, name:true});
  }
});
