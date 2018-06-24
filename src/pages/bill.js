
//define(function (require, exports, module) {

define(function(require, exports, module){

	var PageModule = require("component/PageModule");
	var ScrollHooker = require("component/ScrollHooker");

	var page = PageModule.render({
		init:function(){

			var self = this;
			var currentPage = 1;
			//下拉分页
			this.scrollHooker = new ScrollHooker();
			this.scrollHooker.onEnd = function(){
        		$('#J_PullLoading').removeClass("hidden");
        		setTimeout(function(){
					self.renderPageList( currentPage++ );
				}, 500)
			};

			self.renderPageList( currentPage++ );
		},
		//渲染一个页面
		renderPageList:function(currentPage){
			// console.log( "currentPage", currentPage )
			this.get("/user-web/restapi/pay/query/billlist", {
				corpId:this.query.corpId,
				unionId:this.query.unionId,
				currentPage:currentPage,
				pageSize:30
			});
		},
		onComplate:function(result){
			//$('#J_PullLoading').addClass("hide");
			//调用父元素的onComplate帮助识别返回
			this.supperClass.onComplate.call(this, result );
		},
		onSuccess:function( result ){

			$('#J_Page').removeClass("wait");
			

			if(!result.data || !result.data.data || !result.data.data.length){
				return ;
			}

			var self  = this;

			var tmpl ='<ul class="ui-list ui-list-text ui-list-link ui-border-tb">'+
			'{@each list as item}'+
			    '<li class="ui-border-t">'+
			    	'<a href="bill-detail.html?id=${item.id}&corpId=${item.corpId}&target=_blank">'+
			        '<h4 class="ui-nowrap">'+
			        	'${day(item.gmtModify)}'+
			        	'<div class="time">${time(item.gmtModify)}</div>'+
			        '</h4>'+
			        '<div class="${payType(item.feeChannel)}"></div>'+
			        '<div class="ui-txt-info">'+
			        	'<span class="y">￥</span>${(item.billFee/100).toFixed(2)}'+
			        	'<div class="status">${statusMsg(item.status)}</div>'+
			        	'<div class="info">${item.subject} ${string(item.patientName)} - ${string(item.corpName)}</div>'+
			        '</div>'+
			        '</a>'+
			    '</li>'+
			'{@/each}'+
			'</ul>';

			
			
	    	//订单状态
			this.juicer.register("statusMsg", function(status){
		        //不需要把所有状态都显示出来
		        return {
		        	"100":"待处理",
					"101":"支付中..."
				}[status] || "";

		    });
		    
	    	//计算周几
			this.juicer.register("day", function(date){
		          
	          var time = new Date( date );
	          var dayArr = ["周日","周一","周二","周三","周四","周五","周六","昨天","今天"];
	          var day = self.isToday(time) ? 8 : self.isYesterday(time) ? 7 : time.getDay();

	          return dayArr[day];

		    });
			//计算时间
		    this.juicer.register("time", function(date){
		        try{
		          var time = new Date( date );
		          return self.util.dateFormat(time, (self.isToday(time) || self.isYesterday(time)) ? "hh:mm" : "MM-dd");
		        }catch(e){
		          return date;
		        }
		    });

		    //计算支付方式
		    this.juicer.register("payType", function(feeChannel){
		        return {"1":"icon-zhi", "2":"icon-wx", "3":"icon-card"}[feeChannel] || "icon-zhi";
		    });

		    var html = this.juicer(tmpl, {list:result.data.data})
		    
		    if( html ){
		    	result.data.currentPage == 1 ? $('#J_List').html( html ) : $('#J_List').append( html );
			}

			//停止下拉滚动
			if( result.data.currentPage >= (result.data.totalItem / result.data.pageSize) ){
				this.scrollHooker.recovery();
				$('#J_PullLoading').addClass("hide");
			}
		
		},
		//是否今天
		isToday:function(time){
			//当前时间
			var yy = new Date().getFullYear();
			var mm = new Date().getMonth()+1;
			var dd = new Date().getDate();
			return yy == time.getFullYear() && mm == time.getMonth()+1 && dd == time.getDate();
		},
		//是否昨天
		isYesterday:function(time){

			var yy = new Date().getFullYear();
			var mm = new Date().getMonth()+1;
			var dd = new Date().getDate();

			return yy == time.getFullYear() && mm == time.getMonth()+1 && dd-1 == time.getDate();
		}
	});

	page.init();

	module.exports = page;
});