'use strict'

var Moo = require("mootools"),
	path = require('path'),
	fs = require('fs');

module.exports = function(App){
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
	
	return App
}
