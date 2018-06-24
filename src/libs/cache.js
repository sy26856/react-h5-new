/**
	lib.cache.js
	资源缓存
*/
define("libs/cache",function(require, exports, module){

	var IS_LOCAL_STORGEl  = window.localStorage;
	/**
		cache.set(key, value, expire);
		cache.get(key)
	*/
	var cache = module.exports = {
		cacheMap:{

		},
		set:function(key, value, expire){
			
			if( IS_LOCAL_STORGEl ){
				return window.localStorage.setItem(key, value);
			}  

			return null;
		},
		get:function( key ){
			if( IS_LOCAL_STORGEl ){
				return window.localStorage.getItem( key );
			}
			return null;
		},
		remove:function(key){
			if( IS_LOCAL_STORGEl ){
				return window.localStorage.removeItem( key );
			}
			return null;
		},
		getCordId:function(){
			this.get("corpId");
		},
		getCacheModule:function( name, keepTime ){
			name = name || "yuantu-cache";
			// 不要缓存
			// if( !this.cacheMap[ name ] ){
			// 	this.cacheMap[name] = new CacheModule( name );
			// }
	
			return new CacheModule( name, keepTime );
			
		},
		removeCacheModule:function(name){
			name = name || "yuantu-cache";
			this.cacheMap[ name ] = null;
			this.remove( name );
		}
	};

	/**
		构造一个多页面传值的module

		var abcCache = new cache.CacheModule("abc");
	
		abcCache.set("key", "value", "name");

		abcCache.get("key") // {value:"value", name:"name"}
		
		var t = Date.now();
		md5("abdslfjalkdjfla");
		console.log(Date.now() - t)
	*/
	function CacheModule( name, keepTime){

		this.name = name;
		//10分钟内使用缓存
		this.cacheTime = keepTime || 1000*60*100000;
		this.module = {};
		this.init();
	}

	CacheModule.prototype = {

		init:function(){
			try{
				//console.log(JSON.stringify(cache.get(this.name)))
				this.module = JSON.parse(cache.get(this.name)) || {};
				//删除已经过期的缓存
				for(var key in this.module){
					// console.log(Date.now() - this.module[key].time > this.cacheTime )
					if(this.module[key].time && (Date.now() - this.module[key].time > this.cacheTime)){
						console.log("删除", key)
						delete this.module[key]
					}
				}
			}catch(e){
				this.module = {};
			}
		},
		refresh:function(){
			try{
				this.module = JSON.parse(cache.get(this.name)) || this.module;
			}catch(e){

			}
		},
		set:function( key, value, name ){

			var json = null
			
			// try{
				
			// 	json = cache.get(this.name);
			// 	if( json ){
			// 		json = JSON.parse(json);
			// 	}

			// }catch(e){}

			this.module[key] = {
				value:value,
				name:name,
				time:Date.now()
			};
			
			this.save();
		},
		get:function(key){
			return this.module[key] || {};
		},
		remove:function(key){
			if(this.module[key]){
				delete this.module[key];
				this.save();
			}
		},
		save:function(){
			//异步保存数据
			var name = this.name;
			var module = this.module;
			// setTimeout(function(){
				cache.set(name, JSON.stringify( module ) );
			// },0);
		},
		clear:function(){
			
			this.module = {};
			this.save();
		}
	}

	window.cache = cache;

});