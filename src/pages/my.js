define(function (require, exports, module) {


  var PageModule = require("component/PageModule");
  var registerToken = require("mods/register-token/index")

  var page = PageModule.render({
    init: function () {

      this.unionId = this.query.unionId;
      this.corpId = this.query.corpId;

      if (!this.query.corpId && !this.query.unionId) {
        this.util.alert("缺少corpId or unionId");
      }

      if (this.query.unionId == 29) {
        $('#blackItem').removeClass("hide");
      }

      this.getUserInfo();

      this.regEvent();
      this.uid = this.util.getUID();
    },
    //监听用户登录状态发生变化，需要刷新页面重新载入数据
    onActivation: function () {

      if (this.uid != this.util.getUID()) {
        window.location.reload(true);
      }

    },

    regEvent: function () {

      var self = this;
      $('#J_LoginOut').click(function () {
        self.loginOut();
      });

      $('#J_LoginLink').click(function () {

        self.util.goLogin();

      });

      $('#J_needLoginList a.ui-list-info').click(function (e) {
        if (!self.util.isLogin()) {
          e.preventDefault();
          self.util.goLogin();
          return false;
        }
      });

      var unionId = this.unionId;
      var corpId = this.corpId;

      $('.funs-list .ui-list-info').each(function () {

        var href = $(this).attr("href");

        if (href) {
          if (unionId) {
            href += "&unionId=" + unionId;
          }

          if (corpId) {
            href += "&corpId=" + corpId;
          }

          $(this).attr("href", href);

        }
      });

      var t = 0;
      $('#J_Version').on("click", function () {
        // console.log(1)
        if (t++ > 3) {
          $('#J_TestPage').removeClass("hide");
        }
      })
      // if( this.util.isInYuantuApp() ){
      //   $('#J_Setting').removeClass("hide");
      // }
      if (window.config.daily || window.config.debug || window.config.isTest || window.config.isUAT) {
        $('#J_TestPage').removeClass("hide");
      }

      PageModule.render({
        init: function () {
          this.unionId = this.query.unionId;
          if (this.query.unionId == 29) {
            this.get("/user-web/restapi/ytUsers/breakAppointmentList", {unionId: this.unionId});
          }
        },
        onSuccess(result){
          var blackNum = 0;
          result.data && result.data.forEach((z) => {
            z.blackFlag && blackNum++;
          });
          blackNum > 0 && $('#blackNum').text(blackNum + '位就诊人进入黑名单');
        },
        onError(){}
      }).init();

    },
    loginOut: function () {
      //已登录状态 已经获得了登录的 deviceToke
      // var devicePlatform = this.devicePlatform;// = this.util.getPlatform();
      // var deviceToke = this.deviceToke;// = null;

      PageModule.render({
        init: function () {
          //清除token

          var self = this;
          this.unionId = this.query.unionId;
          registerToken.onComplate = function () {

            self.get("/user-web/restapi/ytUsers/logout", {unionId: self.unionId});

          }
          registerToken.clear();

        },
        onComplate: function () {
          if (window.localStorage) {
            localStorage.clear();
          }
          window.location.reload();
        }
      }).init();

    },
    //已经登录
    renderLogined: function (data) {

      $('#J_Name').text(data.name);
      $('#J_Avatar').css("background-image", "url(" + data.avatar + ")")
      $('#J_LoginOutLink').removeClass("hide");

    },
    //未登录
    renderNoLogin: function () {
      var self = this;
      $('#J_Name').text("未登录");
      $('#J_Header').click(function () {
        self.util.goLogin();
      });
      $('#J_LoginLink').removeClass("hide");

      $('#J_LoginOut')
    },
    //登录
    getUserInfo: function () {
      this.get("/user-web/restapi/ytUsers/getUserInfo", {unionId: this.unionId});
    },
    onSuccess: function (result) {

      if (result.success) {

        var self = this;
        this.renderLogined({
          name: result.data.userNick || result.data.phoneNum,
          avatar: result.data.logoImg || "//s.yuantutech.com/i4/f61a9c581f1005276cbad8613bae7d6f-470-459.png"
        });
        //查看工单系统是否有管理员的回复
        TickesNewMessage.init();
      } else {
        this.renderNoLogin();
      }
    },
    onError: function () {
      this.renderNoLogin();
    }

  });

  //工单系统是否有新消息
  var TickesNewMessage = PageModule.render({
    init: function () {
      var uid = this.util.getTID();
      var orderUrl = this.config.orderUrl;
      this.unionId = this.query.unionId;
      if (this.util.isLogin()) {
        this.get(orderUrl + "/my-status", {uid: uid, unionId: this.unionId});
      }
    },
    onActivation: function () {
      this.init();
    },
    onReady: function () {
      this.init();
    },
    onSuccess: function (result) {
      // console.log( result )
      //有新消息
      if (result.data && result.data.newMessage) {
        $('#J_TickesNew').show();
      } else {
        $('#J_TickesNew').hide();
      }
    },
    onError: function () {

    }
  })


  //页面
  page.init();

  module.exports = page;

});