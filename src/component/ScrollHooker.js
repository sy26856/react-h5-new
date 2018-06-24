/**
	依赖zepto.js
	滚动加载组件	
*/
define("component/ScrollHooker", function(require, exports, module){

	var CouponHooker = function(t) {

		this.prevHeight = 0;
		//是否在激活状态
	    this.activation = 1;
	    //容器
	    this.container = t || document.body;

	    this.scrollElement = this.container == document.body ? window : this.container;
	    //预加载大小
	    this.bufferHeight = 360, 
	    this.init();
	};

	CouponHooker.prototype = {
	    init: function() {
	        var t = this;
	        //监听scroll事件
	        $(this.scrollElement).on("scroll", function() {
	            t.scroll()
	        });
	    },
	    scroll: function() {

	        var container = this.container;
	        var innerHeight = (container == document.body ? window.innerHeight : container.clientHeight);
	        var scrollHeight = container.scrollHeight;
	        var scrollTop = container.scrollTop;

	        //窗口高度发生变化，自动激活
	        if( scrollHeight != this.prevHeight ){
	        	this.start();
	        }

	        //触发onEnd事件
	        // console.log(1 == this.activation ,!this.isRecovery, scrollHeight - scrollTop - innerHeight - this.bufferHeight < 0);

	        if( 1 != this.activation || this.isRecovery){
	    		return ;
	    	}

	        if(scrollHeight - scrollTop - innerHeight - this.bufferHeight < 0){
	        	this.stop();
	        	this.prevHeight = scrollHeight;
	        	this.onEnd();
	        }

	    },
	    stop: function() {
	        this.activation = 0
	    },
	    start: function() {
	        this.activation = 1
	    },
	    recovery:function(){
	    	this.isRecovery = 1;
	    },
	    onEnd: function() {

	    }
	};

	module.exports = CouponHooker;
});
