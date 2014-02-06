//bootstrap an empty db
Meteor.startup(function() {
    if (Services.find().count() === 0) {
        var timestamp = (new Date()).getTime();
        var service_drug_id = Services.insert({name:'Drug Treatment', count:0, resources:[], nameRoute:'Drug-Treatment', creation_time:timestamp, updated_time:timestamp});
        var service_housing_id = Services.insert({name:'Housing', count:0, resources:[], nameRoute:'Housing', creation_time:timestamp, updated_time:timestamp});
        var service_mental_health_id = Services.insert({name:'Mental Health', count:0, resources:[], nameRoute:'Mental-Health', creation_time:timestamp, updated_time:timestamp});
        var service_food_id = Services.insert({name:'Food', count:0, resources:[], nameRoute:'Food', creation_time:timestamp, updated_time:timestamp});
        var service_employment = Services.insert({name:'Employment Help', count:0, resources:[], nameRoute:'Employment-Help', creation_time:timestamp, updated_time:timestamp});
        var service_emergency_shelter_id = Services.insert({name:'Emergency Shelter', count:0, resources:[], nameRoute:'Emergency-Shelter', creation_time:timestamp, updated_time:timestamp});
        var service_free_dental = Services.insert({name:'Free Dental', count:0, resources:[], nameRoute:'Free-Dental', creation_time:timestamp, updated_time:timestamp});

        var epiphany_id = Resources.insert(
            {name:'Epiphany House', street:'Broderick St', streetNumber:'1615',
             email:'sisterestela@TheEpiphanyCenter.org', url:'http://www.msjse.org',
             contactPerson:'Sister Estela', phone:'(415) 409-6003',
             longDescription:"Epiphany House is a treatment center in San Francisco, California that focuses on substance abuse services by providing substance abuse treatment services. The programs offered are designed for residential beds for clients' children. .. ..",
             shortDescription:"Treatment Center in San Francisco",
             services:[service_drug_id], creation_time:timestamp, updated_time:timestamp,
             city:"San Francisco", state:"CA", zipcode:"94115"});

        var hpp_id = Resources.insert(
            {name:'Homeless Prenatal', street:'18th St', streetNumber:'2500',
             email:'ShonaBaum@homelessprenatal.org', url:'http://www.homelessprenatal.org',
             contactPerson:'Shona Baum', phone:'(415) 546-6756',
             longDescription:"Epiphany House is a treatment center in San Francisco, California that focuses on substance abuse services by providing substance abuse treatment services. The programs offered are designed for residential beds for clients' children. .. ..",
             shortDescription:"Treatment Center in San Francisco",
             services:[service_drug_id], creation_time:timestamp, updated_time:timestamp,
             city:"San Francisco", state:"CA", zipcode:"94110"});

        var sffb_id = Resources.insert(
            {name:'San Francisco Food Bank', street:'Pennsylvania Ave', streetNumber:'900',
             phone:'(415) 282-1900', url:'http://www.sfmfoodbank.org/',
             shortDescription:'Food Bank in San Francisco and Marin',
             longDescription:"Our mission is to end hunger in San Francisco and Marin. It's a huge job that's only gotten harder as our community struggles with a prolonged period of economic distress and record numbers of people are pushed to the point of hunger.",
             services:[service_food_id], state:"CA", zipcode:"94107", creation_time:timestamp,
             updated_time:timestamp, city:"San Francisco"});

        Services.update({_id:service_drug_id}, {$push:{resources:{$each: [hpp_id, epiphany_id]}}});
        Services.update({_id:service_food_id}, {$push:{resources:sffb_id}});
        Services.update({_id:service_drug_id}, {$set:{count:2}});
        Services.update({_id:service_food_id}, {$set:{count:1}});
    }
});