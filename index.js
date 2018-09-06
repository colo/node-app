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

/**
 * https://stackoverflow.com/questions/17575790/environment-detection-node-js-or-browser
 **/
//var isNode=new Function("try {return this===global;}catch(e){return false;}");
var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");


if(isBrowser() === false){
	App.implement({
		load: function(wrk_dir, options){
			options = options || {};
			
			var get_options = function(options){
				
				/**
				 * subapps will re-use main app logger
				 * */
				if(this.logger)	
					options.logs = this.logger;
				
				return options;
			
			}.bind(this);
			
			
			fs.readdirSync(wrk_dir).forEach(function(file) {

				var full_path = path.join(wrk_dir, file);
				
				
				if(! (file.charAt(0) == '.')){//ommit 'hiden' files
					//console.log('-------');
					
					//console.log('app load: '+ file);
					var app = null;
					var id = '';//app id
					var mount = {};
					let app_path = '/';
					
					if(fs.statSync(full_path).isDirectory() == true){//apps inside dir
						
						////console.log('dir app: '+full_path);
						
						var dir = file;//is dir
						
						
						fs.readdirSync(full_path).forEach(function(file) {//read each file in directory
							
							app_path = this.options.path;
							
							if(path.extname(file) == '.js' && ! (file.charAt(0) == '.')){
								
								////console.log('app load js: '+ file);
								app = require(path.join(full_path, file));
								
								mount[dir] = {};
								if(file == 'index.js'){
									app_path += dir;
								}
								else{
									mount[dir][path.basename(file, '.js')] = {};
									app_path += dir+'/'+path.basename(file, '.js');
								}
								
								if(typeOf(app) == 'class'){//mootools class
									
									this.fireEvent(this.ON_LOAD_APP, [app, this]);
									options.path = app_path;
									try{
										app = new app(get_options(options));
									}
									catch(e){
										//console.log(e);
									}
									
								}
								else{//nodejs module
									////console.log('express app...nothing to do');
								}
								
								this.use(mount, app);
							}

						}.bind(this));//end load single JS files

					}
					else if(path.extname( file ) == '.js'){// single js apps
						
						app = require(full_path);
						//id = path.basename(file, '.js');
						id = path.basename(wrk_dir);
						
						if(file == 'index.js'){
							
							mount[id] = {};
							app_path = id;
						
							//console.log(mount);
							//throw new Error();
						}
						else{
							let name = path.basename(file, '.js');
							mount[id] = {};
							mount[id][name] = {};
							//app_path = id;
							app_path = id+'/'+name;
							
							//console.log(mount);
							
						}
						
						if(typeOf(app) == 'class'){//mootools class
							
							this.fireEvent(this.ON_LOAD_APP, [app, this]);
							
							options.path = app_path;
							
							try{		
								app = new app(get_options(options));
							}
							catch(e){
								//console.log(e);
							}
						}
						else{//nodejs module
							////console.log('express app...nothing to do');
						}
						
						//console.log(mount);
						this.use(mount, app);
						
					}
					
					
				}
			}.bind(this))
			
			Object.append(this, this._merged_apps);
			
		}
	});
}

module.exports = App

