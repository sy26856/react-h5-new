
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



define("component/PageModule",function(require, exports, module){
	
  //lib.windvane 强依赖 
  var io = require("io");
  var url = require("libs/url");
  var util = require("libs/util");
  var juicer = require("libs/juicer");
  var cache = require("libs/cache");
  var windvane = require("libs/windvane");
  var vTemplate = require("libs/vTemplate");

  var config = window.config;

  function PageModule(){

  	//url上的全部参数
  	this.query = url.parse( window.location.href, true).query  || {};
    
    this.vTemplate = vTemplate;
    this.cache = cache;
  	this.io = io;
  	this.url = url;
  	this.juicer = juicer;
    this.util = util;
  	//全局配置文件
  	this.config = config;

  	//医院id 参数上的id -->  confir.corpId
    // console.log( this.query )
  	this.corpId = this.query.corpId || this.config.corpId;
    try{
      //通过id设置医院名称
      this.corpName = config.cropMap[this.corpId].corpName;
    }catch(e){}

    //处理 假值
    this.juicer.register("string", function(value){
      if( value == null || value === undefined ){
        return "";
      }
      return value;
    });

    //测试开启每个页面的时间监听，需要删除
    this.initPageEvent();

    //
    PageModule.checkVersion()
  }

  PageModule.isCheckVerson = false;
  //检查当前h5版本，如果小于线上配置的版本号则提示用户跳转到最新版本
  PageModule.checkVersion = function(){
    if(!this.isCheckVerson){
      this.isCheckVerson = true;
      var versionURL = "native-online-config.json";
      
      if(config.isUAT){
        versionURL = "native-uat-config.json"
      }
      io.get("//s.yuantutech.com/tms/fb/proxy-jsonp.php",
        {
          config:versionURL
        }, 
        function( data ){
        if(data && data.h5MinimumVersion){
          var h5MinimumVersion = data.h5MinimumVersion.split(".");
          if(util.h5Version.lt(h5MinimumVersion[0], h5MinimumVersion[1], h5MinimumVersion[2])){
            util.alert("为了获得更好的体验<br/>我们即将为你跳转到新版本");
            setTimeout(function(){
              
              var href = (window.location.pathname.replace(/\/yuantu\/h5\-cli\/[\d\.]+\//, "/"))+window.location.search;

              if(config.isUAT){
                window.location.href = "//s.yuantutech.com/tms/fb/weixin-nav-uat.php?url="+encodeURIComponent(href);
              }else if(config.isDaily){
                window.location.href = "//daily.yuantutech.com/tms/fb/weixin-nav-uat.php?url="+encodeURIComponent(href)
              }else{
                //线上
                window.location.href = "//s.yuantutech.com/tms/fb/weixin-nav.php?url="+encodeURIComponent(href)
              }
            }, 2000)
          }

        }
        

        var getPlatform = util.getPlatform();
        //判断客户端小于设定的版本 提示强制更新
        if(util.isInYuantuApp() && getPlatform == "ios" && data && data.iosMinimumVersion){
        // if(true){
          var version = data.iosMinimumVersion.split(".");
          if(util.version.lt(version[0], version[1], version[2])){
            goDownload();
            // $('<div class="version-low-mask"></div><div class="verson-low-tips"></div>').appendTo(document.body);
          }

          return
        }

        //判断客户端小于设定的版本 提示强制更新
        if(util.isInYuantuApp() && getPlatform == "android" && data && data.androidMinimumVersion){
          var version = data.androidMinimumVersion.split(".");
          if(util.version.lt(version[0], version[1], version[2])){
            goDownload()
            // $('<div class="version-low-mask"></div><div class="verson-low-tips"></div>').appendTo(document.body);
          }
          return 
        }


        function goDownload(){
          util.dialog("当前App版本较低，请先下载最新版本", function(okay){
            if(okay){
              if(getPlatform == "ios"){
                window.location.href = "https://appsto.re/cn/jTqh8.i";
              }else{
                window.location.href="http://nocache-s.yuantutech.com/tms/fb/app-download.html"+(util.isInYuantuApp() ? "?target=_blank":"");
              }
            }
          },{
            cancel:false,
            okText:"去下载"
          })
          
        }
      }, function(err){
      })
    }
  }
  // this.get(/url/, {id:})

  PageModule.prototype = {
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

      /**
        lib.windvane.fire({
          ret:"SUCCESS",
          type:"event",
          name:"onready"
        });

        lib.windvane.fire({
          ret:"SUCCESS",
          type:"event",
          name:"onactivation"
        });

        lib.windvane.fire({
          ret:"SUCCESS",
          type:"event",
          name:"onpause"
        });
      */
    },
    get:function(url, param){
    	var self = this;
    	console.log(url);
      // 让jsonp异步，把时间让渡给 页面渲染，可以让页面更快的onload
      setTimeout(function(){
        io.get(url, param, function(result){
          self.onComplate( result );
      	}, function(result){
          if( result && result.success != undefined ){
      		  self.onComplate( result );
          }else{
            console.log('!!!!!')
            self.onComplate( {success:false, msg:"网路错误，请稍后再试"} );
          }
      	});
      });

      return this;
    },
    getCache:function(url, param){
      
      var self = this;

      setTimeout(function(){
        io.getCache(url, param, function(result){
          self.onComplate( result );
        }, function(result){
          if( result && result.success != undefined ){
            self.onComplate( result );
          }else{
            console.log('!!!')
            self.onComplate( {success:false, msg:"网路错误，请稍后再试"} );
          }
        });
      });

      return this;
    },
    checkLogin:function(){
      if( !this.util.isLogin() ){
        this.util.goLogin(true);
        // this.showLoginMask();
        return false;
      }

      return true;
    },
    showLoginMask:function(){
      var mask = $('<div class="ui-mask-tip-box"><div class="text">请先登录<sub>点击任意位置跳转到登录界面</sub></div></div>');
      var self = this;
      mask.click(function(){
        if( !self.util.isLogin() ){
          self.util.goLogin(true);
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
      this.util.alert("操作成功");
    },
    onError:function(result){
      
      $('#J_Page').removeClass("wait");

      this.errorHandle( result );
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
    errorHandle:function(result){

      if( result && result.resultCode == "202" ){
        //未登录
        // !this.util.isInYuantuApp() && this.showLoginMask();
        // this.util.alert("请先登录");
        this.util.goLogin();
        // alert(1)
      }else{
        this.util.alert(result ? result.msg : "失败");
      }

    },
    renderTo:function(tmpl, data, id){

    	try{
    		$(id).html( juicer(tmpl, data) );
    	}catch(e){
    		console.log("模板渲染错误", e);
    		this.onError({
    			"success":"false",
    			"code":"00"
    		})	
    	}

    },
    //加载其他模块
    use:function( moduleNames ){
      setTimeout(function(){
        seajs.use(moduleNames);
      }, 1000);
    }
  }

  PageModule.render = function( proto ){
    var module = $.extend(new PageModule(), proto);
    module.supperClass = PageModule.prototype;
    return module;
  }


  PageModule.clearOtherNode = function(){
    var element = null;
    // console.log(document.body.lastElementChild)
    while( (element = document.body.lastElementChild) && element.id != "J_YuanTuLastScript" && element.innerHTML.indexOf("seajs.use") == -1){
      console.log("清除劫持 element  生效")
      document.body.removeChild(element);
    }
  }

  // PageModule.clearOtherNode();

  module.exports = PageModule;


});

