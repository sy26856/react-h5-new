
/**

	var page = PageModule.rendere({
		init:function(){

		},
    onComplate:function(){

    },
		onSuccess:function(){

		},
		onError:function(){

		},
		renderTo:fucntion(){

		}
	});

	page.init();

*/



define("component/VModule",function(require, exports, module){

  //lib.windvane 强依赖
  var io = require("io");
  var url = require("libs/url");
  var util = require("libs/util");
  var cache = require("libs/cache");
  var windvane = require("libs/windvane");
  var vTemplate = require("libs/vTemplate");

  var config = window.config;

  function VModule(){
  	//url上的全部参数
  	this.query = url.parse( window.location.href, true).query  || {};

		this.refs = {};
    this.vTemplate = vTemplate;
    this.cache = cache;
  	this.io = io;
  	this.url = url;
    this.util = util;
  	//全局配置文件
  	this.config = config;

  	//医院id 参数上的id -->  confir.corpId
    // console.log( this.query )
  	this.corpId = this.query.corpId || this.config.corpId;

    //测试开启每个页面的时间监听，需要删除
    this.initPageEvent();

  }

  VModule.prototype = {
    initModule:function(state, id){

      var self = this;
      var module = vTemplate(function(data){
        return self.toRender(data);
      }, state || {loading:true});
      this.state = module.data;
			this.wrap = $(id);
      this.wrap.html( module.dom );
      this.module = module;
      return module;
    },
    setState:function( state,  callback){
      this.module && this.module.setData(state, (a)=>{
				//设置 refs
				Array.prototype.slice.call(this.wrap[0].querySelectorAll("[ref]"), 0).map((element)=>{
					let ref = element.getAttribute("ref");
					if(ref != undefined && this.refs[ref] != element){
						// console.log("setting")
						this.refs[ref] = element
					}else{
						// console.log("跳过")
					};
				});
				callback && callback();
				//
				// //处理事件 目前不行
				// this.componentDidMount();
			});
      this.state = this.module.data;
    },
    getState:function(){
      return this.module ? this.module.data : {};
    },
		//组件渲染完成页面每次更新完成以后
		// componentDidMount(){
		// },
    //native会通过jsbrige把页面的生命周期状态传递给h5
    initPageEvent:function(){

      var self = this;

      // console.log(windvane.eventListener)
      windvane.on( windvane.READY, function( result ){

          self.onPageReady(result);
      });

      windvane.on( windvane.ACTIVEATION, function(result){
          self.onActivation(result);
      });

      windvane.on( windvane.PAUSE, function(result){

          self.onPause(result);
      });

    },
    get:function(url, param){
    	var self = this;
      // 让jsonp异步，把时间让渡给 页面渲染，可以让页面更快的onload
      setTimeout(function(){
        io.get(url, param, function(result){
          self.onComplate( result );
      	}, function(result){
          if( result && result.success != undefined ){
      		  self.onComplate( result );
          }else{
            console.log('????')
            self.onComplate( {success:false, msg:"网路错误，请稍后再试"} );
          }
      	});
      });

      return this;
    },
    getCache2:function(url, param){
      this.getCache(url, param, true);
    },
    getCache:function(url, param, isMultipleCallback){

      var self = this;

      setTimeout(function(){
        io.getCache(url, param, function(result){
          self.onComplate( result );
        }, function(result){
          if( result && result.success != undefined ){
            self.onComplate( result );
          }else{
            self.onComplate( {success:false, msg:"网路错误，请稍后再试"} );
          }
        },isMultipleCallback);
      });

      return this;
    },
    checkLogin:function(){
      if( !this.util.isLogin() ){
        this.util.goLogin();
        this.showLoginMask();
        return false;
      }

      return true;
    },
    showLoginMask:function(){
      var mask = $('<div class="ui-mask-tip-box"><div class="text">请先登录<sub>点击任意位置跳转到登录界面</sub></div></div>');
      var self = this;
      mask.click(function(){
        if( !self.util.isLogin() ){
          self.util.goLogin();
        }else{
          window.location.reload();
        }
      });
      mask.appendTo(document.body);
    },
    onComplate:function( result ){
        this.util.waitHide();
        if( result.success ){
          this.onSuccess( result );
        }else{
          this.onError( result );
        }

    },
    onSuccess:function(){
      result.loading = false;
      this.setState(result)
    },
    onError:function(result){
      result.loading = false;
      this.errorHandle(result);
      this.setState(result);
    },
    //页面装备完成
    onPageReady:function(event){
        console.log(windvane.READY);
    },
    //页面被激活
    onActivation:function(event){
        console.log(windvane.ACTIVEATION);
    },
    //页面被转移到后台
    onPause:function(event){
        console.log(windvane.PAUSE);
    },
    //通用错误处理
    errorHandle:function(result){

      if( result && result.resultCode == "202" ){
        this.util.goLogin();
      }

    },
    renderError:function(state){
      return `<div class="ui-tips center">${state.msg || "网络错误，请稍后再试"}</div>`;
    },
    renderLoading:function(){
      return `<div class="page wait"></div>`;
    },
    //绑定事件到dom上
    bind(fn){
      var self = this;
      var id = "random_fn_"+parseInt(Math.random()*100000);
      var arg = Array.prototype.slice.call(arguments, 1);
      window[id] = function(e){
        arg.push(e)
        fn.apply(self, arg);
      }
      return id+"(this)";
    },
    toRender(state){
      if(state.loading){
        return this.renderLoading(state)
      }else if(!state.success){
        return this.renderError(state);
      }else{
        return this.render(state)
      }
    }

  }

  VModule.render = function( proto ){
    var module = $.extend(new VModule(), proto);
    return module;
  }


  // PageModule.clearOtherNode();

  module.exports = VModule;


});
