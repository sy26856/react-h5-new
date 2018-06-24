/**
	lib.io.js
	所有 异步  ajax 请求集散地	
*/

define("libs/io",function(require, exports, module){
	
	var cache = require("libs/cache");
	var md5 = require("libs/md5");

	// var maxExpire = 1000*60*10;

	//缓存异步接口 10 分钟缓存
	var AsynDataCache = cache.getCacheModule("AsynDataCache", 1000*60*10);
	var config = window.config;
	
	module.exports = {

		get:function(path, param, callback, errorCallback, option){

			//如果没有domain就添加
			path = path.indexOf("//") == -1 ? config.domainName + path : path;

			option = $.extend({
				dataType:"jsonp",
				type:"GET"
			}, option || {});


			//console.log( isSameDomain )
			param  = param || {};
			if( !param.ver ){
				param.ver = "1.0";
			}	

			//删除明显多余的参数传递
			
			if( param ){
				for(var key in param){
					if( param[key] === undefined || param[key] === null || param[key] === "undefined" ){
						delete param[key];
					}
				}
			}

			//不要缓存	
			param.t = parseInt(Math.random()*100000);
			// console.log( param )
			$.ajax({
				url:path,
				//对请求进行简单的加密
				data:param,//this.md5Param(param),
				type:option.type,
				dataType:option.dataType,
				timeout:config.daily?60000:60000, //修改到60秒
				// withCredentials:true,
				success:callback,
				error:function(result, status, c){
					console.log(result, status, c)
					result = result.msg || {msg:"网络错误，请稍后再试！"};
					errorCallback(result);
				}
			});

		},
		
		//从缓存中拿数据，也会把数据缓存起来
		getCache:function(path, param, callback, errorCallback, isMultipleCallback){

			var cacheKey = this.generateCacheKey( path, param );
			var cacheData = null;

			//如果有缓存就直接返回缓存
			if( (cacheData = AsynDataCache.get( cacheKey )) && cacheData.value ){
				console.log("来自缓存")
				callback(cacheData.value);
				//支持二次回调的不要把callback 制空
				if(!isMultipleCallback){
					callback = null;
					errorCallback = null;
				}
			}

			this.get(path, param, function( result ){

				callback && callback( result );

				//对data未空的数据不做缓存
				if( result.data && (result.data.length || Object.keys(result.data).length) ){	
					AsynDataCache.set(cacheKey, result, Date.now() );
				}else{
					AsynDataCache.remove(cacheKey);
				}


			}, function(result){
				try{
					AsynDataCache.remove(cacheKey);
				}catch(e){}
				errorCallback && errorCallback(result)
			});
		},
		//加密参数
		md5Param:function( param ){

			var paramList = [];
			//固定加密参数
			param["__sign__"] = "39a7daceb6a952257bc874f30553f8eb";

			for(var key in param){
				paramList.push(key+"="+param[key]);
			}

			param.md5 = md5( paramList.sort().join("") );

			delete param["__sign__"];

			return param;
		},
		//文具请求 api 和 请求参数 制作唯一的缓存 key
		generateCacheKey:function(api, param){

			var key = md5( api +  JSON.stringify(param || {}) );
			return key;

		}

	}


});

