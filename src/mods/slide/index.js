
/**
	slide
	
	element 容器
	itemWidth 单个slide的宽度
*/

define("mods/slide/index",function(require, exports, module){
	var Slide = require("mods/slide/slide");

	module.exports = {
		init:function( list ){
			
			var slides = "";
			var points = "";
			
			for(var i=0; i<list.length; i++){

				var href = '';
				
				if( list[i].href ){
					href = 'href="'+list[i].href+'"&target=_blank';
				}else{
					href = 'href="news-detail.html?target=_blank&id='+list[i].id+'"';
				} 

				slides += '<div class="slider-slides" data-index="'+i+'" style="margin-left:'+(100*i)+'%">'+
					'<a '+href+'><img src="'+list[i].img+'"></a>'+
				'</div>';
				points += '<span class="slider-pager-page J_Point"><i class="icon ion-record"></i></span>';
			}

			$('#J_Slide').html( slides );
			$('#J_SlidePaper').html( points );

			this.initSlide(i);


		},
		initSlide:function(count){

			var slide = new Slide({
				element:$('#J_Slide')[0],
				itemWidth:$(window).width(),
				itemCount:count-1,
				items:$('#J_Slide .slider-slides')
			});

			var point = $('#J_SlidePaper .J_Point')
			slide.onChange = function( index ){
				// console.log( index )
				point.removeClass("active")
				point.eq(index).addClass("active")
			}
			slide.switchToIndex(0);	
			slide.autoSwitch();
		}
	}
	
});