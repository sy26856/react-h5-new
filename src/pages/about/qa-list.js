define(function (require, exports, module) {

    var PageModule = require("component/PageModule");

    var page = PageModule.render({

        init: function () {

            this.get("/user-web/restapi/common/corpNews/newsInfo", {
                corpId: this.query.corpId,
                unionId: this.query.unionId,
                type: 8,
                channel: "APP"
            });

        },
        onSuccess: function (result) {
            $('#J_Page').removeClass("wait");
            var html = '<ul class="ui-list ui-list-text ui-list-link ui-border-tb ui-container">'+
                '{@each data.introsNews as item}'+
                '<li class="ui-border-t">'+
                '<a href="../news-detail.html?id=${item.id}&target=_blank"  >'+
                '<h3 class="ui-nowrap">${item.title}</h3>'+
                '</a>'+
                '</li>'+
                '{@/each}'+
                '</ul>';

            this.renderTo( html, result, $('#J_Content') );
        }
    });

    page.init();

    module.exports = page;

});



