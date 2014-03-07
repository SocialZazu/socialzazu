var make_inputs = function() {
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
}

make_users = function() {
  if (Meteor.users.findOne({username:'Admin'})) {
    return;
  }
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
}

//bootstrap an empty db
Meteor.startup(function() {
  if (Services.find().count() === 0) {
    make_users();

    var timestamp = (new Date()).getTime();

    //make parents
    var s_housing_id = make_parent_service('Housing', timestamp);
//                                              patient_inputs:[disability_id, age_id, zipcode_id, gender_id, family_size_id, home_id],
//                                              resource_inputs:[zipcode_id, address_id, city_id, cost_id, misc_id]});
    var s_food_id = make_parent_service('Food Providers', timestamp);
    var s_trans_id = make_parent_service('Transportation', timestamp);
    var s_finaid_id = make_parent_service('Financial Assistance', timestamp);
    var s_medical_id = make_parent_service('Medical Care', timestamp, init_priority=3);
    var s_health_insurance_id = make_parent_service('Health Insurance', timestamp);
    var s_employment_id = make_parent_service('Employment', timestamp);
    var s_pediatrics_id = make_parent_service('Pediatric Care', timestamp);
    var s_suppgroups_id = make_parent_service('Support Groups', timestamp);
    var s_legalaid_id = make_parent_service('Legal Aid', timestamp, init_priority=5);
    var s_tax_id = make_parent_service('Tax Help', timestamp);
    var s_materialgoods_id = make_parent_service('Material Goods', timestamp);

    /*make children*/

    //housing
    var c_shelter_id = make_child_service('Shelters', timestamp, s_housing_id, init_priority=6);
    var c_permhouse_id = make_child_service('Permanent Housing', timestamp, s_housing_id);
    var c_transhouse_id = make_child_service('Transitional Housing', timestamp, s_housing_id);

    //food
    var c_wic_id = make_child_service('WIC', timestamp, s_food_id);
    var c_pantry_id = make_child_service('Food Pantry', timestamp, s_food_id, init_priority=1);
    var c_hotmeals_id = make_child_service('Hot Meals', timestamp, s_food_id, init_priority=2);
    var c_homedeliv_id = make_child_service('Home Meal Delivery', timestamp, s_food_id);
    var c_grocery_id = make_child_service('Grocery Stores', timestamp, s_food_id);
    var c_resta_id = make_child_service('Restaurants', timestamp, s_food_id);

    //trans

    //finaid
    var c_cash_id = make_child_service('Cash Aid', timestamp, s_finaid_id);
    var c_stamps_id = make_child_service('Food Stamps', timestamp, s_finaid_id);
    var c_utilities_id = make_child_service('Utilities', timestamp, s_finaid_id);
    var c_emercash_id = make_child_service('Emergency Cash Help', timestamp, s_finaid_id);
    var c_emerrent_id = make_child_service('Emergency Rent Help', timestamp, s_finaid_id);
    var c_secdepo_id = make_child_service('Security Deposit Help', timestamp, s_finaid_id);

    //medical
    var c_pcp_id = make_child_service('PCP', timestamp, s_medical_id);
    var c_specialty_id = make_child_service('Specialty Care', timestamp, s_medical_id);
    var c_dental_id = make_child_service('Dental', timestamp, s_medical_id);
    var c_mental_id = make_child_service('Mental Health', timestamp, s_medical_id);
    var c_opt_id = make_child_service('Optometry', timestamp, s_medical_id);
    var c_substance_id = make_child_service('Treatment Center', timestamp, s_medical_id, init_priority=4);
    var c_rehab_id = make_child_service('Rehab', timestamp, s_medical_id);
    var c_hiv_id = make_child_service('HIV', timestamp, s_medical_id);

    //health insur
    var c_aca_id = make_child_service('Affordable Care Assistance', timestamp, s_health_insurance_id);
    var c_hia_id = make_child_service('Health Insurance Application', timestamp, s_health_insurance_id);
    var c_mmhapp_id = make_child_service('Medicare Medicaid HealthPAC', timestamp, s_health_insurance_id);

    //employment
    var c_jobtrain_id = make_child_service('Job Training', timestamp, s_employment_id);
    var c_jobfind_id = make_child_service('Employment Search', timestamp, s_employment_id);
    var c_jobproblem_id = make_child_service('Employment Problems', timestamp, s_employment_id);

    //tax
    var c_nonprof_id = make_child_service('Nonprofit Agencies', timestamp, s_tax_id);
    var c_events_id = make_child_service('Events', timestamp, s_tax_id);

    //materialgoods

    //support groups
    var c_hiv_id = make_child_service('HIV', timestamp, s_suppgroups_id);
    var c_vets_id = make_child_service('Veterans', timestamp, s_suppgroups_id);
    var c_color_id = make_child_service('Men of Color', timestamp, s_suppgroups_id);
    var c_family_id = make_child_service('Family Support', timestamp, s_suppgroups_id);
    var c_domv_id = make_child_service('Domestic Violence', timestamp, s_suppgroups_id);
    var c_sexa_id = make_child_service('Sexual Assault', timestamp, s_suppgroups_id);
    var c_shelter_id = make_child_service('Shelters', timestamp, s_suppgroups_id);

    //pediatrics
    var c_childcare_id = make_child_service('Child Care', timestamp, s_pediatrics_id);
    var c_teens_id = make_child_service('Teens', timestamp, s_pediatrics_id);
    var c_fosters_id = make_child_service('Foster Youth', timestamp, s_pediatrics_id);
    var c_parenting_id = make_child_service('Teen Parenting', timestamp, s_pediatrics_id);
    var c_pregnant_id = make_child_service('Pregnant Women', timestamp, s_pediatrics_id);
    var c_specialneeds_id = make_child_service('Special Needs Children', timestamp, s_pediatrics_id);
    var c_five_id = make_child_service('First Five Years', timestamp, s_pediatrics_id);
    var c_familycouns_id = make_child_service('Family Counseling', timestamp, s_pediatrics_id);

    //legalaid
    var c_conslaw_id = make_child_service('Consumer Law', timestamp, s_legalaid_id);
    var c_houseleg_id = make_child_service('Housing Legal Help', timestamp, s_legalaid_id);
    var c_crimlaw_id = make_child_service('Criminal Law', timestamp, s_legalaid_id);
    var c_domv_id = make_child_service('Domestic Violence', timestamp, s_legalaid_id);
    var c_emplaw_id = make_child_service('Employment Law', timestamp, s_legalaid_id);
    var c_estalaw_id = make_child_service('Estate Law', timestamp, s_legalaid_id);
    var c_famlaw_id = make_child_service('Family Law', timestamp, s_legalaid_id);
    var c_civlaw_id = make_child_service('Civil Law', timestamp, s_legalaid_id);
    var c_persinj_id = make_child_service('Personal Injury', timestamp, s_legalaid_id);
    var c_medcov_id = make_child_service('Medical Coverage', timestamp, s_legalaid_id);
    var c_immig_id = make_child_service('Immigration', timestamp, s_legalaid_id);
    var c_publicben_id = make_child_service('Public Benefits', timestamp, s_legalaid_id);
    var c_civilrights_id = make_child_service('Civil Rights', timestamp, s_legalaid_id);
    var c_disability_id = make_child_service('Disability Services', timestamp, s_legalaid_id);
    var c_seniors_id = make_child_service('Senior Services', timestamp, s_legalaid_id);


    var sf_id = Counties.insert(
      {name:'San Francisco', spatial_location: {lat:37.78551, lng:-122.441978}});
    var alameda_id = Counties.insert(
      {name:'Alameda', spatial_location:{lat:37.85142099999999, lng:-122.25718}});
    var marin_id = Counties.insert(
      {name:'Marin', spatial_location:{lat:38.0681137, lng:-122.7332743}});

    var _name = 'Epiphany House'
    var epiphany_id = make_resource(
      _name, timestamp,
      make_location(
        timestamp,
        contacts=[make_contact('Sister Estela', 'Executive Director')],
        "Epiphany House is a treatment center in San Francisco, California that focuses on substance abuse services by providing substance abuse treatment services. The programs offered are designed for residential beds for clients' children.",
        "Treatment Center in San Francisco",
        [make_address(
          street="1615 Broderick St",
          city="San Francisco",
          state="CA",
          zipcode="94115",
          type="physical",
          lat=37.78551,
          lng=-122.441978
        ),
         make_address(
           street="100 Masonic Avenue",
           city="San Francisco",
           state="CA",
           zipcode="94118",
           type="physical",
           lat=37.780685,
           lng=-122.446879
         )
        ],
        "Sister Estela",
        {
        },
        transportation=null,
        accessibility=[],
        languages=[],
        phones=[
          make_phone('(415) 409-6003', null, 'voice')
        ],
        internet_resource=make_internet(
          'http://www.msjse.org',
          'sisterestela@TheEpiphanyCenter.org'
        ),
        services=make_services(null, null, null, null)
      ),
      [sf_id],
      [c_substance_id]
    );

    _name = 'Homeless Prenatal';
    var hpp_id = Resources.insert(
      {name:_name, updated_time:timestamp, name_route:make_name_route(_name),
       locations: {
         contacts: [make_contact('Shona Baum', 'Director of Programs')],
         description:"HPP offers services focused on housing, prenatal and parenting support, child development, family finances and stability, access to technology, domestic violence and substance abuse, family unification, and emergency support of basic needs.",
         short_desc:"The Homeless Prenatal Program (HPP) is an award-winning San Francisco Family Resource Center.",
         address: [
           {
             street:"2500 18th St",
             city:"San Francisco",
             state:"CA",
             zipcode:"94110",
             type:"physical",
             spatial_location: {
               lat:37.762197,
               lng:-122.40756199999998
             },
           }
         ],
         service_poc: [
           'Shona Baum',
         ],
         hours:{
           m_f:{open_time:900, close_time:1700, day:'Mon-Fri'},
           sat:{open_time:1100, close_time:1700, day:'Sat'},
           sun:{closed:true, day:'Sun'}
         },
         transportation:null,
         accessibility: [],
         languages: [],
         phones: [
           make_phone('(415) 546-6756', null, "voice")
         ],
         internet_resource:make_internet('http://www.homelessprenatal.org',
                                         'ShonaBaum@homelessprenatal.org'),
         services: {
           audience:null,
           eligibility:null,
           fees:null,
           how_to_apply:null,
         },
       },
       service_areas: [
         sf_id
       ],
       sub_service_ids: [
         c_substance_id
       ]
      }
    );

    _name = 'San Francisco Marin Food Bank';
    var sffb_id = Resources.insert(
      {name:_name, updated_time:timestamp, name_route:make_name_route(_name),
       locations: {
         contacts: [make_contact('Sean Brooks', 'Director of Programs')],
         description:"Our mission is to end hunger in San Francisco and Marin. It's a huge job that's only gotten harder as our community struggles with a prolonged period of economic distress and record numbers of people are pushed to the point of hunger.",
         short_desc:'Food Bank in San Francisco and Marin',
         address: [
           {
             street:"900 Pennsylvania Ave",
             city:"San Francisco",
             state:"CA",
             zipcode:"94107",
             type:"physical",
             spatial_location: {
               lat:37.7544611,
               lng:-122.39367900000002
             },
           },
           {
             street:"75 Digital Drive",
             city:"Novato",
             state:"CA",
             zipcode:"94949",
             type:"physical",
             spatial_location: {
               lat:38.0719482,
               lng:-122.5305377
             }
           }
         ],
         service_poc: [
           'Sean Brooks',
         ],
         hours:{},
         transportation:null,
         accessibility: [],
         languages: [],
         phones: [
           make_phone('(415)-282-1900', null, "voice"),
           make_phone('(415)-883-1302', null, "voice")
         ],
         internet_resource:make_internet('http://www.sfmfoodbank.org/',
                                         'lliang@sfmfoodbank.org'),
         services: {
           audience:null,
           eligibility:null,
           fees:null,
           how_to_apply:null,
         },
       },
       service_areas: [
         sf_id, marin_id
       ],
       sub_service_ids: [
         c_pantry_id, c_stamps_id, c_homedeliv_id
       ]
      }
    );

    _name = 'Oakland Elizabeth House';
    var oakehouse_id = Resources.insert(
      {name:_name, updated_time:timestamp, name_route:make_name_route(_name),
       locations: {
         contacts: [make_contact('Kimberly Martinez', 'Programs Staff Support')],
         description:"Elizabeth House is a transitional program for women with children who have experienced homelessness, violence addiction, or poverty.",
         short_desc:null,
         address: [
           {
             street:"6423 Colby St",
             city:"Oakland",
             state:"CA",
             zipcode:"94618",
             type:"physical",
             spatial_location: {
               lat:37.85142099999999,
               lng:-122.25718
             },
           }
         ],
         service_poc: [
           'Kimberly Martinez',
         ],
         hours:{},
         transportation:null,
         accessibility: [],
         languages: [],
         phones: [
           make_phone('(510) 658-1380', null, "voice")
         ],
         internet_resource:make_internet(
           'http://www.oakehouse.org/',
           'oakehouse@oakehouse.org'
         ),
         services: {
           audience:null,
           eligibility:null,
           fees:null,
           how_to_apply:null
         },
       },
       service_areas: [
         alameda_id
       ],
       sub_service_ids: [
         c_transhouse_id, c_domv_id, c_family_id
       ]
      }
    );

    Services.update({_id:c_substance_id}, {
      $push:{resources:{$each: [hpp_id, epiphany_id]}},
      $set:{count:2}
    });

    Services.update({_id:c_pantry_id}, {$push:{resources:sffb_id},
                                        $set:{count:1}});
    Services.update({_id:c_stamps_id}, {$push:{resources:sffb_id},
                                        $set:{count:1}});
    Services.update({_id:c_homedeliv_id}, {$push:{resources:sffb_id},
                                           $set:{count:1}});

    Services.update({_id:c_transhouse_id}, {$push:{resources:oakehouse_id},
                                            $set:{count:1}});
    Services.update({_id:c_domv_id}, {$push:{resources:oakehouse_id},
                                      $set:{count:1}});
    Services.update({_id:c_family_id}, {$push:{resources:oakehouse_id},
                                        $set:{count:1}});
  }
});