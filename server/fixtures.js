//bootstrap an empty db
Meteor.startup(function() {
  if (Services.find().count() === 0) {
    var admin_id = Accounts.createUser({
      email:'cinjon.resnick@gmail.com',
      password:'temppass',
      username:'Admin'
    });

    var highland_id = Accounts.createUser({
      email:'dhsieh@gmail.com',
      password:'temppass',
      username:'Highland'
    });

    var user_id = Accounts.createUser({
      email:'user@email.com',
      password:'temppass',
    });

    var mari_id = Accounts.createUser({
      email:'mcastaldi@ebclc.org',
      password:'temppass',
      username: 'EBCLC'
    });

    Roles.addUsersToRoles(admin_id, ['admin', 'editor']);
    Roles.addUsersToRoles(highland_id, ['editor']);
    Roles.addUsersToRoles(mari_id, ['editor']);

    var timestamp = (new Date()).getTime();

    var disability_id = Inputs.insert({type:["patient", "resource"], dom:"dropdown", name:"Disability", List:["Physical", "Mental", "None", "Chronic Illness", "Acute Illness"]})
    var legal_id = Inputs.insert({type:["patient", "resource"], dom:"dropdown", name:"Legal Status", list:["Citizen", "Permanent Resident", "Temporary Visa", "Undocumented"]})
    var insurance_id = Inputs.insert({type:["patient", "resource"], dom:"dropdown", name:"Insurance", list:["MediCal", "Medicare", "None", "HealthPAC", "HealthySF", "Private Insurance"]});
    var family_size_id = Inputs.insert({type:["patient"], dom:"number", name:"Family Size", placeholder:"4"});
    var gender_id = Inputs.insert({type:["patient"], dom:"dropdown", name:"Gender", list:["M", "F"]})
    var age_id = Inputs.insert({type:["patient"], dom:"number", name:"Age", placeholder:"25"});
    var address_id = Inputs.insert({type:["resource"], dom:"input", name:"Address", placeholder:"2921 Adeline Street"});
    var city_id = Inputs.insert({type:["resource"], dom:"input", name:"City", placeholder:"Berkeley"});
    var state_id = Inputs.insert({type:["resource"], dom:"dropdown", name:"State", list:["Fill me in"]});
    var zipcode_id = Inputs.insert({type:["resource", "patient"], dom:"number", name:"Zipcode", placeholder:"94703"});
    var home_id = Inputs.insert({type:["patient"], dom:"dropdown", name:"Housing", list:["Homeless", "At risk of homelessness", "Temporary Housing", "Permanent Housing"]});
    var hours_id = Inputs.insert({type:["resource"], dom:"hours", name:"Hours"}); //special one that requires certain input
    var cost_id = Inputs.insert({type:["resource"], dom:"input", name:"Cost", placeholder:"Fee based on a sliding scale up to $400"});
    var misc_id = Inputs.insert({type:["resource"], dom:"input", name:"Miscellaneous Information"});

    var service_drug_id = Services.insert({name:'Drug Treatment', count:0, resources:[], nameRoute:'Drug-Treatment', creation_time:timestamp, updated_time:timestamp});
    var service_housing_id = Services.insert({name:'Housing', count:0, resources:[], nameRoute:'Housing', creation_time:timestamp, updated_time:timestamp,
                                             patient_inputs:[disability_id, age_id, zipcode_id, gender_id, family_size_id, home_id],
                                             resource_inputs:[zipcode_id, address_id, city_id, cost_id, misc_id]});
    var oakehouse_id = Resources.insert({name:'Oakland Elizabeth House', street:'Colby St', streetNumber:'6423', email:'oakehouse@oakehouse.org',
                                         url:'http://www.oakehouse.org/', contactPerson:'Kimberly Martinez', phone:'(510) 658-1380',
                                         shortDescription:'Elizabeth House is a transitional program for women with children who have experienced homelessness, violence addiction, or poverty.',
                                         city:"Oakland", state:"CA", zipcode:"94618", creation_time:timestamp, updated_time:timestamp, services:[service_housing_id],
                                         patient_inputs:[age_id, gender_id, family_size_id, disability_id, home_id],
                                         resource_inputs:[cost_id, zipcode_id, misc_id],
                                         lat:37.85142099999999, lng:-122.25718});

    var service_mental_health_id = Services.insert({name:'Mental Health', count:0, resources:[], nameRoute:'Mental-Health', creation_time:timestamp, updated_time:timestamp});
    var service_food_id = Services.insert({name:'Food', count:0, resources:[], nameRoute:'Food', creation_time:timestamp, updated_time:timestamp});
    var service_employment = Services.insert({name:'Employment Help', count:0, resources:[], nameRoute:'Employment-Help', creation_time:timestamp, updated_time:timestamp});
    var service_emergency_shelter_id = Services.insert({name:'Emergency Shelter', count:0, resources:[], nameRoute:'Emergency-Shelter', creation_time:timestamp, updated_time:timestamp});
//     var service_free_dental = Services.insert({name:'Free Dental', count:0, resources:[], nameRoute:'Free-Dental', creation_time:timestamp, updated_time:timestamp});
    var service_medical_care = Services.insert({name:'Medical Care', count:0, resources:[], nameRoute:'Medical-Care', creation_time:timestamp, updated_time:timestamp});

    var epiphany_id = Resources.insert(
      {name:'Epiphany House', street:'Broderick St', streetNumber:'1615',
       email:'sisterestela@TheEpiphanyCenter.org', url:'http://www.msjse.org',
       contactPerson:'Sister Estela', phone:'(415) 409-6003',
       longDescription:"Epiphany House is a treatment center in San Francisco, California that focuses on substance abuse services by providing substance abuse treatment services. The programs offered are designed for residential beds for clients' children. .. ..",
       shortDescription:"Treatment Center in San Francisco",
       services:[service_drug_id], creation_time:timestamp, updated_time:timestamp,
       city:"San Francisco", state:"CA", zipcode:"94115", lat:37.78551, lng:-122.441978});

    var hpp_id = Resources.insert(
      {name:'Homeless Prenatal', street:'18th St', streetNumber:'2500',
       email:'ShonaBaum@homelessprenatal.org', url:'http://www.homelessprenatal.org',
       contactPerson:'Shona Baum', phone:'(415) 546-6756',
       longDescription:"Epiphany House is a treatment center in San Francisco, California that focuses on substance abuse services by providing substance abuse treatment services. The programs offered are designed for residential beds for clients' children. .. ..",
       shortDescription:"Treatment Center in San Francisco",
       services:[service_drug_id], creation_time:timestamp, updated_time:timestamp,
       city:"San Francisco", state:"CA", zipcode:"94110", lat:37.762197, lng:-122.40756199999998});

    var sffb_id = Resources.insert(
      {name:'San Francisco Food Bank', street:'Pennsylvania Ave', streetNumber:'900',
       phone:'(415) 282-1900', url:'http://www.sfmfoodbank.org/',
       shortDescription:'Food Bank in San Francisco and Marin',
       longDescription:"Our mission is to end hunger in San Francisco and Marin. It's a huge job that's only gotten harder as our community struggles with a prolonged period of economic distress and record numbers of people are pushed to the point of hunger.",
       services:[service_food_id], state:"CA", zipcode:"94107", creation_time:timestamp,
       updated_time:timestamp, city:"San Francisco", lat:37.7544611, lng:-122.39367900000002});

    Services.update({_id:service_drug_id}, {$push:{resources:{$each: [hpp_id, epiphany_id]}}});
    Services.update({_id:service_food_id}, {$push:{resources:sffb_id}});
    Services.update({_id:service_housing_id}, {$push:{resources:oakehouse_id}});
    Services.update({_id:service_drug_id}, {$set:{count:2}});
    Services.update({_id:service_food_id}, {$set:{count:1}});
    Services.update({_id:service_housing_id}, {$set:{count:1}});
  }
});