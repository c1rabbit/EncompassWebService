/**
 * MersController
 *
 * @description :: Server-side logic for managing logs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  home:function(req, res){
    return res.view('mers/main');
  },
	generate: function(req, res){
    var mers = require('mers-min');

    var orgID = req.param('orgID');
    var loanNum = req.param('loan_num');
    var processor = req.param('processor');
    var b_name = req.param('b_name');


    try{
      var output = mers.generate(orgID, loanNum);
    } catch (err){
      return res.view('mers/main', {loan_num:loanNum, b_name, status:"error", message:"invalid input" + err});
    }

    //if (output == null) return res.view({err:"invalid input"});

    Mers.find({
      min_num: output.min
    }).exec(function(err, loans){
      if(err) {
        return res.serverError({err});
      }
      else if(loans.length > 0) {
        return res.view('mers/main', {loan_num:loanNum, b_name, status:"error", message:"MIN already exists"});
      }
      else {
        return res.view('mers/main', {output, processor, b_name});
      }
    })
	},
  validate: function(req, res){
    var min_num = req.param('min_num');
    var mers = require('mers-min');
    var valid;
    try{
      valid = mers.validate(min_num);
    }catch(err){
      return res.view('mers/validate', {status:"error", message: err, min_num})
    }

    if(valid){
      return res.view('mers/validate', {status:'success', message: "MIN is Valid", min_num})
    }else{
      return res.view('mers/validate', {status:'warning', message: "MIN is Invalid", min_num})
    }

  },
  list: function(req, res){
    var moment = require('moment');
    return res.view('mers/list', { moment});
    /*var moment = require('moment');
    //console.log(req.param('page'))
    var search = (typeof req.param('search') == 'undefined') ? '' : req.param('search') ;
    Mers.find({
      "or":[{
        id: {"contains": search},
        org_id: {"contains": search},
        loan_num: {"contains": search},
        min_num: {"contains": search},
        b_name: {"contains": search},
        processed_by: {"contains": search},
        createdAt: {"contains": search}
      }]
    }).paginate({
      limit:1
    }).exec(function(err, loans) {
      if (err) res.serverError({err});
      return res.view('mers/list', {loans, moment})
    });*/
  },
  search:function(req, res){
    var moment = require('moment');
    var start;
    var end;
    //console.log(req.param('range'));
    if(typeof req.param('range') == 'undefined') {
      start = '',
      end = ''
    }
    else if(req.param('range') != "Recent") {
      start = moment(moment().format(req.param('range')+"-01-01")).toISOString(),
      end = moment(moment().format(req.param('range')+"-12-31")).toISOString()
    }
    else if(req.param('range') == "Recent"){
      start = moment(moment().add(-30, 'days')).toISOString(),
      end = moment().toISOString()
    }
    else{
      start = null;
      end = null;
    }
    var search = (typeof req.param('search') == 'undefined') ? '' : req.param('search') ;
    Mers.find({
      "or":[{
        id: {"contains": search},
        org_id: {"contains": search},
        loan_num: {"contains": search},
        min_num: {"contains": search},
        b_name: {"contains": search},
        processed_by: {"contains": search},
        createdAt: {
          '>=': start,
          '<=':  end,
        }
      }]
    }).exec(function(err, loans) {
      if (err) res.json(err);
      return res.json(loans)
    });
  },
  fullSearch:function(req, res){
    var moment = require('moment');

    if(typeof req.param('search') == 'undefined' || req.param('search') == '') {
      return res.json({});
    }
    var search =  req.param('search');
    Mers.find({
      limit: 500,
      "or":[
        {id: {"contains": search}},
        {org_id: {"contains": search}},
        {loan_num: {"contains": search}},
        {min_num: {"contains": search}},
        {b_name: {"contains": search}},
        {processed_by: {"contains": search}},
      ]
    }).exec(function(err, loans) {
      if (err) res.json(err);
      return res.json(loans)
    });
  },
  save: function(req, res){
    Mers.create({
      min_num : req.param('min_num'),
      org_id: req.param('org_id'),
      loan_num: req.param('loan_num'),
      b_name: req.param('b_name'),
      processed_by: req.param('processor')
    }).exec(function(err, loan){
      if (err) {
        console.log(err)
        res.view('mers/main', {
          message: err,
          status:"error",
          loan_num: req.param('loan_num'),
          b_name:req.param('b_name')
        })
      }
      else {return res.view('mers/success', {loan});}
    });
  }

};
