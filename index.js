'use strict'

var Moo = require("mootools"),
	path = require('path'),
	fs = require('fs');
	
var Logger = require('node-express-logger');
		//Authorization = require('node-express-authorization');


var App = new Class({
  Implements: [Options, Events],
  
  ON_LOAD_APP: 'onLoadApp',
  ON_USE: 'onUse',
  ON_USE_APP: 'onUseApp',
  
  
  logger: null,
  //authorization:null,
  //authentication: null,
  _merged_apps: {},
  
  options: {
			
		id: '',
		path: '',
		
		
  },
  initialize: function(options){
		
		if(
			this.options
			&& this.options.path
			&& this.options.path.indexOf('/') == 0
		)
			delete options.path
			
		this.setOptions(options);//override default options
		
		/**
		 * logger
		 *  - start
		 * **/
		if(this.options.logs){
			//console.log('----instance----');
			//console.log(this.options.logs);
			
			if(typeof(this.options.logs) == 'class'){
				var tmp_class = this.options.logs;
				this.logger = new tmp_class(this, {});
				this.options.logs = {};
			}
			else if(typeof(this.options.logs) == 'function'){
				this.logger = this.options.logs;
				this.options.logs = {};
			}
			//else if(this.options.logs.instance){//winston
				//this.logger = this.options.logs;
				//this.options.logs = {};
			//}
			else{
				this.logger = new Logger(this, this.options.logs);
				//app.use(this.logger.access());
			}
			
			//app.use(this.logger.access());
			
			//console.log(this.logger.instance);
		}
		
		
		/**
		 * logger
		 *  - end
		 * **/
		
		
		
		
  },
  log: function(name, type, string){},
  profile: function(profile){},
	use: function(mount, app){
		
		this.fireEvent(this.ON_USE, [mount, app, this]);
		
		if(typeOf(app) == 'class' || typeOf(app) == 'object')
			this.fireEvent(this.ON_USE_APP, [mount, app, this]);
		
		
		//if(typeOf(app) == 'object'){
	
			//if(this.authorization && app.options.authorization && app.options.authorization.config){
				
				//var rbac = fs.readFileSync(app.options.authorization.config , 'ascii');
				//app.options.authorization.config = rbac;
				//this.authorization.processRules(
					//JSON.decode(
						//rbac
					//)
				//);
			//}
			

		//}
		//else{
			
		//}
		
		var to_append = this._merge(mount, app);
		
		var key = Object.keys(to_append)[0];
		if(this[key]){//an app has beend loaded on that key
			var tmp = this[key];
			if(typeOf(tmp) == 'object'){
				delete this[key];
				
				Object.append(to_append[key], tmp);
			}
			
			Object.append(this, to_append);
		}
		else{
			Object.append(this, to_append);
		}
		
  },
  _merge: function(mount, app){
		
		if(Object.getLength(mount) > 0){
			Object.each(mount, function(value, key){
				
				mount[key] = this._merge(value, app);
				
			}.bind(this));
			
			return mount;
		}
		else{
			return app;
		}
	}
  
  
	
});

module.exports = App

