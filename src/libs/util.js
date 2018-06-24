define("libs/util", function (require, exports, module) {

  var alerts = null;
  var timeout = null;
  var config = window.config;
  var url = require("./url")
  var nihao = module.exports = {
    pad: function (string, length, pad) {
      var len = length - String(string).length
      if (len < 0) {
        return string;
      }
      var arr = new Array(length - String(string).length || 0)
      arr.push(string);
      return arr.join(pad || '0');
    },
    flat: function (param) {
      var str = ""
      for (var key in param) {
        str += key + "=" + (param[key] != undefined ? encodeURIComponent(param[key]) : "") + "&"
      }
      return str.slice(0, -1);
    },
    https: function (a) {
      return String(a).replace("http://", "//");
    },
    //可视化object把假值转换为 ""
    vis: function (json) {
      for (var key in json) {
        // || isNaN(json[key])
        if (json[key] === undefined || json[key] === null) {
          json[key] = "";
        }
      }
      return json;
    },
    forEach(object, callback){
      var list = []
      for (var key in object) {
        list.push(callback(object[key], key))
      }
      return list;
    },
    flatStr: function (str, param) {
      return str + this.flat(param);
    },

    is: function (is, str) {
      return is ? str : ""
    },
    rmb: function (rmb, dot) {

      dot = dot == undefined ? 4 : dot;

      if (rmb == 0) {
        return 0
      }

      if (dot == 2) {
        return (rmb).toFixed(2)
      }

      if (dot == 4 && (rmb).toFixed(2) * 10000 == (rmb).toFixed(4) * 10000) {
        return (rmb).toFixed(2);
      }

      return (rmb).toFixed(dot);
    },
    getSID: function () {


      if (this.isLogin()) {
        var cookie = document.cookie;
        var sids = cookie.match(/sid=(\w+)/);
        if (sids && sids[1]) {
          return sids[1];
        }
      }

      return null;
    },

    getUID: function () {

      if (this.isLogin()) {
        var cookie = document.cookie;
        var sids = cookie.match(/[^u]uid=(\d+)/);
        if (sids && sids[1]) {
          return sids[1];
        }
      }

      return null;
    },
    getTID: function () {
      if (this.isLogin()) {
        var cookie = document.cookie;
        var sids = cookie.match(/tid=([\-\w]+)/);
        if (sids && sids[1]) {
          return sids[1];
        }
      }
      return null;
    },
    dateFormatGMT: function (source, pattern) {
      let time = new Date(source);
      time.setUTCHours(time.getUTCHours() + ((time.getTimezoneOffset() + 8 * 60) / 60));
      return this.dateFormat(time, pattern);
    },
    dateFormat: function (source, pattern) {
      // Jun.com.format(new Date(),"yyyy-MM-dd hh:mm:ss");
      //Jun.com.format(new Date(),"yyyy年MM月dd日 hh时:mm分:ss秒");
      if (!source) {
        return "";
      }

      source = new Date(source);
      var pad = nihao.pad,
        date = {
          yy: String(source.getFullYear()).slice(-2),
          yyyy: source.getFullYear(),
          M: source.getMonth() + 1,
          MM: pad(source.getMonth() + 1, 2, '0'),
          d: source.getDate(),
          dd: pad(source.getDate(), 2, '0'),
          h: source.getHours(),
          hh: pad(source.getHours(), 2, '0'),
          m: source.getMinutes(),
          mm: pad(source.getMinutes(), 2, '0'),
          s: source.getSeconds(),
          ss: pad(source.getSeconds(), 2, '0')
        };
      return (pattern || "yyyy-MM-dd hh:mm:ss").replace(/yyyy|yy|MM|M|dd|d|hh|h|mm|m|ss|s/g, function (v) {
        return date[v];
      });

    },
    //将金额*100的整数转换成 千分位金额 1,234.00
    moneyFormat: function (money, fixed) {
      if (!fixed) {
        fixed = 2
      }
      if (!money || Number(money) == 0) {
        return 0;//(0).toFixed(fixed)
      }
      var negative = false;

      var mStr = money.toString().split(".");
      mStr[1] = Number('0.00' + (mStr[1] || ""));

      if (mStr[0].indexOf('-') == 0) {
        negative = true;
        mStr[0] = mStr[0].replace("-", '');
      }

      var len = mStr[0].length;

      if (len <= 5) {
        if (negative) {
          return '-' + (mStr[0] / 100 + mStr[1]).toFixed(fixed)
        } else {
          return (mStr[0] / 100 + mStr[1]).toFixed(fixed)
        }
      }

      var decimal = (Number('0.' + mStr[0].slice(-2)) + mStr[1]).toFixed(fixed).replace("0.", "");
      var num = [];
      for (var i = -5; i > -len - 3; i = i - 3) {
        var part = [];
        part[0] = mStr[0].slice(i, i + 3);
        num = part.concat(num);
      }
      var round = num.join(",");
      //return (round + '.' + decimal );
      if (negative) {
        return ('-' + round + '.' + decimal );
      } else {
        return (round + '.' + decimal );
      }
    },

    //获取标准时差
    getTimezoneOffset: function () {
      var now = new Date();
      return now.getTimezoneOffset() * 60 * 1000;
    },
    isLogin: function () {
      return /sid\=\w+/.test(document.cookie);
    },

    isInYuantuApp: function () {

      //临时
      //return navigator.userAgent.indexOf("MicroMessage") != -1;
      return navigator.userAgent.indexOf("YuanTu(") != -1;
      // return navigator.userAgent.indexOf("YuanTu(") != -1;
    },
    //在微信中
    isInMicroMessenger: function () {
      return navigator.userAgent.indexOf("MicroMessenger") != -1;
    },
    isInAliPay: function () {
      return navigator.userAgent.indexOf("AliPay") != -1;
    },
    isInZhifubao: function () {
      return navigator.userAgent.indexOf("AliApp(AP") != -1;
    },
    isInIOS:function(){
      //ios
      return /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);
    },
    waitAlert: function (text, delay) {
      /**
       700 毫秒以上才弹出加载动画
       */
      var self = this;
      this.waitHide();
      timeout = setTimeout(function () {
        self.alertDialog({
          text: text,
          time: 120000,
          isWait: true
        });
      }, delay === undefined ? 700 : delay);
    },
    waitHide: function () {
      timeout && clearTimeout(timeout);
      if (alerts) {
        alerts.remove();
      }
    },
    alert: function (text, callback) {
      this.alertDialog({
        text: text,
        time: Math.max(String(text).length * 250, 2000)
      }, callback);
    },
    /**
     * text
     * param {
				text:"",
				time:"", //显示时间
				isWait:true //是否显示等待
			}
     */
    alertDialog: function (param, callback) {

      timeout && clearTimeout(timeout);

      var text = param.text;
      var time = param.time;
      var isWait = param.isWait;
      // console.log( param )
      if (alerts) {
        alerts.remove();
        alerts = null;
      }

      alerts = $('<div class="ui-alert"><div  class="text">' + (isWait ? '<div class="loading-icon"></div>' : '') + text + '</div></div>');

      alerts.appendTo(document.body);

      setTimeout(function () {
        callback && callback();
        alerts && (alerts.remove());
      }, time || text.length * 200);

      return alerts;
    },
    dialog: function (content, callback, option) {
      option = $.extend({
        cancel: true,
        cancelText: "取消",
        ok: true,
        okText: "确定"
      }, option || {})

      var tmpl = '<div class="ui-dialog show">' +
        '<div class="ui-dialog-cnt">' +
        '<div class="ui-dialog-bd">' +
        '<div style="text-align:center;">' + content + '</div>' +
        '</div>' +
        '<div class="ui-dialog-ft">' +
        (option.cancel ? '<button type="button" class="J_Btn" data-role="0">' + option.cancelText + '</button>' : '') +
        (option.ok ? '<button type="button" class="J_Btn" data-role="1">' + option.okText + '</button>' : '') +
        '</div>' +
        '</div>' +
        '</div>';

      var dialog = $(tmpl);
      dialog.appendTo(document.body).find(".J_Btn").click(function () {
        var role = $(this).attr("data-role");
        dialog.remove();
        callback && callback(role == "1");
      });

    },
    //调用jsbrige方法
    brige: function (name, param, callback, fail, time) {
      if (this.isInYuantuApp()) {
        lib.windvane.call("jsbrige", name, param || {}, callback || function () {
          }, fail || function () {
          }, time);
      } else {
        // 只在YuantuApp调用jsBrige
        return false;
      }
    },
    //跳转到登录页面 history 是否清楚当前页面的历史记录
    goLogin: function (clearHistory) {
      // var h5_domain = config.h5Domain;
      var query = url.parse(window.location.href, true).query || {};
      var unionId = query.unionId || '';
      var corpId = query.corpId || '';
      var loginUrl = this.h5URL("/sign-in.html");//"https://"+h5_domain+"/tms/h5/login.php";

      if (this.isInYuantuApp()) {
        loginUrl = this.h5URL("pages/logo2.html")
        loginUrl += "?backview=1";//登录完成跳转到上一个页面并刷新
        this.brige("openView", {
          url: loginUrl,
          animation: "bottom-in"
        });
      } else {
        if (history) {
          /*window.location.replace(this.flatStr(loginUrl + "?", {
            redirecturl: encodeURIComponent(window.location.href),
            unionId: query.unionId,
          }));*/
          let flag = '?';
          if (loginUrl.indexOf('?') > -1) {
            flag = '&';
          }
          window.location.replace(loginUrl + flag + "redirecturl=" + encodeURIComponent(window.location.href) + "&unionId=" + unionId + (unionId ? '' : '&corpId=' + corpId));

        } else {
          //window.location.href = this.flatStr(loginUrl + "?", {unionId: query.unionId});
          let flag = '?';
          if (loginUrl.indexOf('?') > -1) {
            flag = '&';
          }
          window.location.href = loginUrl + flag + "unionId=" + unionId + (unionId ? '' : '&corpId=' + corpId);;
        }
      }
    },

    //返回上一个webview
    goBack: function (isReload, url) {
      // lib.windvane.call("jsbrige","backView", {isReload:isReload});
      if (this.isInYuantuApp()) {
        this.brige("backView", {isReload: isReload});
      } else {

        //直接back无法刷新上一个页面， replace 会导致需要返回两次
        // if(isReload && document.referrer){
        // window.location.replace(document.referrer);
        // }else{
        window.history.back();
        // }
      }
    },
    //支付宝支付
    pay: function (feeChannel, param, callback, fail) {
      this.brige("pay", {
        feeChannel: feeChannel,//1 支付宝， 2微信支付
        payData: param
      }, callback, fail);
    },
    getYuanTuVersion: function () {
      //getPlatform
      // > gt
      // < lt
      this.getPlatform();
    },
    setNativeTitle: function (text, callback, fail) {
      if (this.isInYuantuApp()) {
        this.brige("setTitle", {text: text}, callback, fail);
      } else {
        document.title = text;
      }
    },
    getDeviceToke: function (callback, fail) {

      if (this.isInYuantuApp()) {
        this.brige("getDeviceToken", {}, callback, fail)
      } else {
        fail();
      }
    },
    getPlatform: function () {
      var ua = navigator.userAgent
      if (ua.indexOf("iPhone") != -1 || ua.indexOf("iPad") != -1) {
        return "ios";
      }

      if (ua.indexOf("Android") != -1) {
        return "android";
      }
      return null;
    },
    h5URL(path){
      return location.protocol + "//" + config.h5Domain + "/yuantu/h5-cli/" + config.version + path;
    },
    //当前客户端版本比较
    version: {
      v: (function () {

        var versions = navigator.userAgent.match(/YuanTu\((?:QY|YY)\/([\d.]+)\)/);
        if (versions && versions.length) {
          return {
            x: parseInt(versions[1].split(".")[0]),
            y: parseInt(versions[1].split(".")[1]),
            z: parseInt(versions[1].split(".")[2])
          }
        }

        return {x: 0, y: 0, z: 0};
      })(),
      // >
      gt: function (x, y, z) {
        var aa = [this.v.x, this.v.y, this.v.z]
        var ab = [x, y, z];
        var i = 0;
        var la = aa.length, lb = ab.length;
        while (la > lb) {
          ab.push(0);
          ++lb;
        }
        while (la < lb) {
          aa.push(0);
          ++la;
        }
        while (i < la && i < lb) {
          var ai = parseInt(aa[i], 10);
          var bi = parseInt(ab[i], 10);
          if (ai > bi) {
            return true;
          } else if (ai < bi) {
            return false;
          }
          ++i;
        }

        return false;
      },
      // <
      lt: function (x, y, z) {
        // 相等的时候不小于
        if (this.v.x == x && this.v.y == y && this.v.z == z) {
          return false;
        }

        return !this.gt(x, y, z)
      },
      test: function () {
        var v = {
          v: {
            x: 2,
            y: 1,
            z: 19
          }
        }

        console.log(nihao.version.gt.apply(v, [2, 1, 6]) == true)
        console.log(nihao.version.gt.apply(v, [3, 1, 6]) == false)
        console.log(nihao.version.gt.apply(v, [2, 2, 6]) == false)
        console.log(nihao.version.gt.apply(v, [2, 1, 19]) == false)
        // console.log( nihao.version.test() )
        return [this.v.x, this.v.y, this.v.z].join(".") > [x, y, z].join(".")
      },
    },
    h5Version: {
      v: (function () {

        var versions = window.location.href.match(/\/h5\-cli\/([\d\.]+)\/pages/);
        if (versions && versions.length) {
          return {
            x: parseInt(versions[1].split(".")[0]),
            y: parseInt(versions[1].split(".")[1]),
            z: parseInt(versions[1].split(".")[2])
          }
        }
        return {x: 100, y: 100, z: 100};
      })(),
      // >
      gt: function (x, y, z) {
        var aa = [this.v.x, this.v.y, this.v.z]
        var ab = [x, y, z];
        var i = 0;
        var la = aa.length, lb = ab.length;
        while (la > lb) {
          ab.push(0);
          ++lb;
        }
        while (la < lb) {
          aa.push(0);
          ++la;
        }
        while (i < la && i < lb) {
          var ai = parseInt(aa[i], 10);
          var bi = parseInt(ab[i], 10);
          if (ai > bi) {
            return true;
          } else if (ai < bi) {
            return false;
          }
          ++i;
        }

        return false;
      },
      // <
      lt: function (x, y, z) {
        // 相等的时候不小于
        if (this.v.x == x && this.v.y == y && this.v.z == z) {
          return false;
        }
        return !this.gt(x, y, z)
      }
    },
    IsPC: function () {
      var userAgentInfo = navigator.userAgent;
      var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
      var flag = true;
      for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }
      return flag;
    },
    keys: function (obj) {
      var keys = [];
      for (var key in obj) {
        keys.push(key);
      }
      return keys;
    }
  }

  //test

    if (!Object.assign) {
        // 定义assign方法
      Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target) { // assign方法的第一个参数
          'use strict';
          // 第一个参数为空，则抛错
          if (target === undefined || target === null) {
            throw new TypeError('Cannot convert first argument to object');
          }

          var to = Object(target);
          // 遍历剩余所有参数
          for (var i = 1; i < arguments.length; i++) {
            var nextSource = arguments[i];
            // 参数为空，则跳过，继续下一个
            if (nextSource === undefined || nextSource === null) {
              continue;
            }
            nextSource = Object(nextSource);

            // 获取改参数的所有key值，并遍历
            var keysArray = Object.keys(nextSource);
            for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
              var nextKey = keysArray[nextIndex];
              var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
              // 如果不为空且可枚举，则直接浅拷贝赋值
              if (desc !== undefined && desc.enumerable) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
          return to;
        }
      });
    }

    window.nihao = nihao;
})
