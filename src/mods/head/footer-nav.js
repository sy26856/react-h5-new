//define(function (require, exports, module) {

define("mods/head/footer-nav", function (require, exports, module) {

  var PageModule = require("component/PageModule");

  var page = PageModule.render({
    init: function () {
      var unionId = this.query.unionId || 29;
      var corpId = this.query.corpId || 261;
      var showFooter = this.query.showFooter || '';
      var self = this;

      var hideIndexNav = (specialConfig.indexNav.hideUnionIds.indexOf(unionId) || specialConfig.indexNav.hideCorpIds.indexOf(corpId));

      if (!this.util.isInYuantuApp() && hideIndexNav < 0) {
        $(document.body).css("padding-bottom", "60px");
        $('#J_FooterNav').addClass("show");
        $('#J_FooterNav .item').click(function () {
          $(this).toggleClass("open");
          $('#J_FooterMask').toggleClass("hide");
        });

        $('#J_FooterMask').click(function () {
          $('#J_FooterNav .item').toggleClass("open");
          $('#J_FooterMask').toggleClass("hide");
        });


        $('#J_FooterNav a').each(function () {
          var href = $(this).attr("href")
          var urlobj = self.url.parse(href);
          urlobj.search += ("&unionId=" + unionId + "&showFooter=" + showFooter);
          $(this).attr("href", self.url.format(urlobj));
        })


      }

    }
  });

  page.init();

  module.exports = page;
});
