
define(function(require, exports, module){

	var PageModule = require("component/PageModule");
	var slide = require("mods/slide/index");
	
	var page = PageModule.render({
		init:function(){
			//this.onSuccess();
			this.unionId = this.query.unionId || 29;
			
			this.getCache("/user-web/restapi/common/corp/unionHome", {
				unionId:this.unionId
			});
			
		},
		
		onSuccess:function( result ){

			$('#J_Page').removeClass("wait");
			
			var banners = result.data.banners.filter((item)=>{
				return !!item.img
			})
			
			banners = banners.map((item)=>{
				item.img = item.img.replace("http://", '//')
				return item
			});

			slide.init( banners );
			
			this.render( result.data.corpList );
		},
		render:function( corpList ){

			var self = this;
			var tmpl = '{@each list as item}'+
			'<a data-name="${item.name}" class="drop-item {@if item.online == 1}ui-form-item-link{@/if} ui-border-tb {@if item.online == 0}mask{@/if} " {@if item.online == 1} href="index.html?corpId=${item.corpId}&unionId='+this.unionId+'&target=_blank" {@/if}>'+
				'{@if item.online == 0}<div class="off-line-tag">未开通</div>{@/if}'+
				'<div {@if item.online == 0} class="item-box" {@/if}>'+
				'<div class="logo" style="background-image:url(${item.logo.replace("http://", "//")})"></div>'+
				'<div class="info">'+
					'<h1>${item.name}</h1>'+
					'<div class="honor">'+
						'{@each item.tags as it}'+
						'<span class="honor-tag">${it}</span>'+
						'{@/each}'+
					'</div>'+
					'<div class="address">${item.address}</div>'+
				'</div>'+
				'</div>'+
			'</a>'+
			'{@/each}';
			
			this.renderTo( tmpl, {list:corpList}, "#J_List");

			$('#J_List .mask').click(function(){
				self.util.alert($(this).data("name")+" 即将上线");
			});

		}
	});

	page.init();

	module.exports = page;
});