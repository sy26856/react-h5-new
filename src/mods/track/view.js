/**
 数据可视化

 */
define("mods/track/spm-view", function (require, exports, module) {


  var PageModule = require("component/PageModule");

  var component = PageModule.render({
    init: function (data) {

      var spmMap = {};

      for (var i = 0; i < data.links.length; i++) {
        spmMap[data.links[i].spmd] = data.links[i];
      }

      $('a[data-spm-id]').each(function (index, item) {

        var $element = null;
        var spmd = $(item).data("spm-id")
        $element = $(item).find(".spm-view")
        if ($element.length == 0) {
          $(item).css({
            position: "relative"
          });
          $element = $('<div class="spm-view">0</div>')
          $(item).prepend($element);
        }

        if (spmMap[spmd] && spmMap[spmd].pv) {
          $element.text(spmMap[spmd].pv + "," + spmMap[spmd].uv)
        } else {
          $element.text(0);
        }
      })

    }

  });

  module.exports = component;
});


define("mods/track/view", function (require, exports, module) {


  var PageModule = require("component/PageModule");
  var MulitpeTab = require("mods/muliteTab/index");
  var SPMView = require("mods/track/spm-view");

  var component = PageModule.render({
    init: function () {

      var self = this;
      var a = document.createElement("LINK")
      a.type = "text/css";
      a.rel = "stylesheet";
      a.href = "http://uat.yuantutech.com/yuantu/h5-cli/1.1.63/mods/muliteTab/index.css"
      document.body.appendChild(a);
      // this.renderTab();
      a.onload = function () {
        self.renderTab();
      }

      var tab = null;
      setTimeout(function () {
        //直接调用 tablist li 的宽度获取错误
        tab = new MulitpeTab($('#J_Tabs2'), {
          gap: 20
        });

        tab.go(19)
        tab.addEventListener("onChange", function (a, b, c) {
          self.renderSPMData($(c).data("date"))
        })
      }, 100)
    },
    renderTab: function () {

      var lis = "";

      function getDate(dayOffset) {
        var d = new Date();
        d.setDate(d.getDate() + dayOffset);
        return {
          dateWithYear: d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(),
          date: (d.getMonth() + 1) + "-" + d.getDate()
        };
      }

      for (var i = -20; i < 0; i++) {
        var date = getDate(i);
        lis += '<li data-date="' + date.dateWithYear + '"><span class="a">' + date.date + '</span></li>'
      }

      var html = '<div class="h5-plugin-tab ui-border-bottom" id="J_Tabs2">' +
        '<div class="h5-plugin-tab-in J_In" data-spm="no">' +
        '<ul>' + lis + '</ul>' +
        '<div class="h5-plugin-tab-silder J_Slider"></div>' +
        '</div>' +
        '</div>' +
        '<div class="spm-count ui-border-bottom">当前页面：PV:<span id="J_PV">0</span>， UV:<span id="J_UV">0</span> </div>'

      $(document.body).prepend(html)

    },
    getAB: function () {
      var meta = document.querySelectorAll("meta[name=spm-id]");
      var ab = "";
      var a = 0;
      var b = 0;
      if (meta && meta.length && (ab = meta[0].content.split("."))) {
        a = ab[0];
        b = ab[1];
      }

      return a + "." + b;
    },
    renderSPMData: function (date) {
      this.get("https://spm.yuantutech.com:3104/analysis/spmd?date=" + date + "&spmb=" + this.getAB() + "&pwd=" + window.spmviewpwd);
    },

    onSuccess: function (result) {
      var data = result.data;
      $("#J_PV").text(data.page.pv);
      $("#J_UV").text(data.page.uv);
      SPMView.init(data);
    }
  });


  component.init()

  module.exports = component;
});
