
/**
	slide
	
	element 容器
	itemWidth 单个slide的宽度
*/

define("mods/slide/slide",function(require, exports, module){

	var Hammer = require("libs/hammer");
	
	function Slide( opt ){
		// this.opt = opt;
		this.element = opt.element;
		this.items = opt.items;
		this.itemWidth = opt.itemWidth;
		this.itemCount = opt.itemCount;
		this.loop = true;
		this.currentIndex = 0;
		this.init();
	};


	Slide.prototype = {
		construcotr:Slide,
		init:function(){

			var self = this;
			var hammertime = new Hammer(this.element, { direction: Hammer.DIRECTION_HORIZONTAL });
			var startX = 0;

			var itemWidth = this.itemWidth;
			
			//阻止页面上下滚动
			// document.body.addEventListener("touchmove", function(e){
			// 	e.preventDefault();
			// });

			
			hammertime.on('panstart', function(ev) {
				ev.preventDefault()
				$(self.element).removeClass("animation");
			});

			hammertime.on('panmove', function(ev) {
			   ev.preventDefault();
			   self.transform( self.calculationTransfromX() + ev.deltaX * (1-Math.abs(ev.deltaX)/(itemWidth*3)) );
			});

			hammertime.on('panend', function(ev) {
			    // console.log(ev);
			    /**
					DIRECTION_NONE	1
					DIRECTION_LEFT	2 ++
					DIRECTION_RIGHT	4 --
					DIRECTION_UP	8
					DIRECTION_DOWN	16
					DIRECTION_HORIZONTAL	6
					DIRECTION_VERTICAL	24
					DIRECTION_ALL	30
			    */
			    $(self.element).addClass("animation");
			    var dir = ev.direction;
			    var deltaX = Math.abs( ev.deltaX );
			    var velocityX = Math.abs( ev.velocityX );

			   // console.log("next", deltaX, self.itemWidth/2 , velocityX, dir)

			    if( deltaX > self.itemWidth/3 || velocityX > 0.3){
			    	// console.log(ev.deltaX)
			    	if( ev.deltaX < 0){
			    		// console.log("next", ev.deltaX, ev.velocityX)
			    		self.switchToNext();
			    	}
			    	if( ev.deltaX > 0){
			    		// console.log("prev", ev.deltaX, ev.velocityX)
			    		self.switchToPrev();
			    	}
			    }else{
			    	self.switchToIndex( self.currentIndex )
			    }
			    
			    self.autoSwitch();
			});


			// hammertime.get('panmove').set({ direction: Hammer.DIRECTION_HORIZONTAL });

		},
		transform:function( deltaX ){
			// console.log( deltaX )
			//this.element.style.WebkitTransform = "translate3d("+ deltaX +"px,0,0)";
			this.element.style.WebkitTransform = "translate("+ deltaX +"px)";
			this.clearAutoSwitch();
		},
		switchToPrev:function(){
			var index = --this.currentIndex;
			index = index >= 0 ? index : 0;
			this.switchToIndex( index );
		},
		switchToNext:function(){
			var index = ++this.currentIndex;
			// console.log(index)
			index = index < this.itemCount ? index : this.itemCount;

			this.switchToIndex( index );
		},
		switchToIndex:function( index ){
			this.currentIndex = index != undefined ? index : this.currentIndex;
			this.transform( this.calculationTransfromX() );
			this.onChange( this.currentIndex );
		},
		calculationTransfromX:function( ){
			return -this.itemWidth * this.currentIndex;
		},
		clearAutoSwitch:function(){
			this.interval && clearInterval( this.interval )
		},	
		autoSwitch:function(){
			var self = this;
			this.clearAutoSwitch();
			this.interval = setInterval(function(){
				if( self.currentIndex < self.itemCount ){
					self.switchToNext();
				}else{
					self.switchToIndex(0);
				}
			}, 5000);
		},
		onChange:function(index){

		}
	}
	
	module.exports = Slide;
	
})
