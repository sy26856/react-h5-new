
//define(function (require, exports, module) {

define(function(require, exports, module){

	var PageModule = require("component/PageModule");

	var page = PageModule.render({
		init:function(){
			this.get("/user-web/restapi/ytUsers/viewMyHealthyData", {
				currentPage:1,
				pageSize:100
			})
		},
		onSuccess:function( result ){

			$("#J_Page").removeClass("wait");

			var self = this;

            var tmpl = '{@each list as item}'+
            '<div class="item">'+
                '<span class="time">${time(item.gmtCreate)}</span>'+
                '<a href="health-record-detail.html?id=${item.id}&target=_blank" class="ui-border-tb ui-arrowlink">'+
                    '<h1>${item.healthReportName}</h1> '+
                    '<h3>${item.hospitalName}</h3>   '+
                    '<p>就诊人: ${item.patientUserName}</p>'+
                '</a>'+
            '</div>'+
            '{@/each}';

            if(result.data && result.data.length){
            	this.juicer.register("time", function(time){
			        try{
			          return self.util.dateFormat(time, "yyyy-MM-dd");
			        }catch(e){
			          return "";
			        }

			     });
            	this.renderTo(tmpl, {list: result.data }, "#J_List");
            }
		}
	});

	page.init();

	module.exports = page;
});