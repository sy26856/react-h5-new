define(function (require, exports, module) {

	var PageModule = require("component/PageModule");

	var list = corpLocations;

	var page = PageModule.render({

		init: function () {

			var lonLat = list[this.query.corpId] ? list[this.query.corpId].LonLat : []
			var self = this;

			if(!list[this.query.corpId]){
				$('#container').addClass('hide')
				$('#J_NoData').removeClass('hide')
				return
			}
			
			if(this.util.isInYuantuApp()){
				setTitle();
                if(this.util.getPlatform() == 'ios'){
                    if(this.util.version.gt(2,2,2)){
                        $('#J_MapBtn').removeClass('hide');
                    }
                }else if(this.util.getPlatform() == 'android'){
                    if(this.util.version.gt(2,1,16)){
                        $('#J_MapBtn').removeClass('hide');
                    }
                }
			}

            $('#J_MapBtn').click(function(){
                lib.windvane.call("jsbrige", 'skipNavigation', { Coordinate:lonLat})
            })

			var map = new AMap.Map("container", {
				resizeEnable: true,
				zoom: 15,
				center: lonLat
			});

			addMarker();
			
			if (this.util.IsPC()) {
				map.plugin(["AMap.ToolBar"], function () {
					map.addControl(new AMap.ToolBar());
				});
			}

			function addMarker() {

				var marker = new AMap.Marker({

					map: map,

					position: lonLat
				});
				var infoWindow = new AMap.InfoWindow({
					content: "<b style='font-size:14px'>" + list[self.query.corpId].name + "</b></br><span>电话：" + list[self.query.corpId].tel + "</span></br><span>地址：" + list[self.query.corpId].address + "</span>",
					offset: { x: 0, y: -30 }
				});

				makerAnimation(marker);

				setTimeout(function () {
					stopMove(marker, infoWindow);
				}, 1200);

				marker.on("touchstart", function (e) {
					infoWindow.open(map, marker.getPosition());
				});
			}

			function makerAnimation(mar) {
				mar.setAnimation('AMAP_ANIMATION_BOUNCE');
			}

			function stopMove(mar, infoWin) {
				mar.setAnimation('AMAP_ANIMATION_NONE');
				infoWin.open(map, mar.getPosition());
			}

			function setTitle() {
				lib.windvane.call("jsbrige", 'setTitle', { text: list[self.query.corpId].name });
			}

		}
	});


	//页面
	page.init();

	module.exports = page;

});