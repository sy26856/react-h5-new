/**
 全局配置文件
 */

;(function () {


  let currentHostname = window.location.hostname;
  let version = {
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
  }

  //h5 domain
  let H5_DAILY_DOAMIN = "daily.yuantutech.com";
  let H5_UAT_DOMAIN = "uat.yuantutech.com";
  let H5_ONLINE_DOMAIN = "s.yuantutech.com";
  let H5_ABTEST_DOMAIN = "abtest.yuantutech.com";


  //tms domain
  let TMS_DAILY_DOAMIN = "//daily.yuantutech.com";
  let TMS_UAT_DOMAIN = "//uat.yuantutech.com";
  let TMS_ONLINE_DOMAIN = "//s.yuantutech.com";
  let TMS_ABTEST_DOMAIN = "//test.yuantutech.com";


  //api domain
  let API_DAILY_DOMAIN = "//api.daily.yuantutech.com";
  let API_UAT_DOMAIN = "//route-uat.yuantutech.com";
  let API_ONLINE_DOMAIN = "//route.yuantutech.com";
  let API_ABTEST_DOMAIN = "//test.yuantutech.com";
  let API_QUEUE_UAT_DOMAIN = "//route-uat.yuantutech.com";
  let API_QUEUE_DOMAIN = "//route.yuantutech.com";  //原api.yuantutech
  //let API_QUEUE_DOMAIN = "//api.yuantutech.com";
  let API_UAT_AOLSEE = "//aolsee.uat.ali.yuantutech.com/aolsee-web";
  let API_ONLINE_AOLSEE = "//aolsee.yuantutech.com/aolsee-web";
  let API_SMP_DOMAIN = "https://spm.yuantutech.com:3104?";
  //工单系统
  let API_ORDER_DOMAIN = "https://node.yuantutech.com:3105"


  let IS_DAILY = currentHostname.indexOf(H5_DAILY_DOAMIN) != -1;
  let IS_UAT = currentHostname.indexOf(H5_UAT_DOMAIN) != -1;
  let IS_ONLINE = currentHostname.indexOf(H5_ONLINE_DOMAIN) != -1;
  let IS_ABTEST = currentHostname.indexOf(H5_ABTEST_DOMAIN) != -1;

  let API_DOMAIN = API_ONLINE_DOMAIN;
  let H5_DOMAIN = H5_ONLINE_DOMAIN;
  let TMS_DOMAIN = TMS_ONLINE_DOMAIN;

  if (navigator.userAgent.indexOf("YuanTu(") != -1 && version.lt(3, 5, 0)) {
    API_UAT_DOMAIN = "//api.uat.yuantutech.com";
    API_ONLINE_DOMAIN = "//api.yuantutech.com";
    API_QUEUE_UAT_DOMAIN = "//api.uat.yuantutech.com";
    API_QUEUE_DOMAIN = "//api.yuantutech.com";
  }

  let API_AOLSEE_DOMAIN = API_ONLINE_AOLSEE;

  if (IS_DAILY) {
    API_DOMAIN = API_DAILY_DOMAIN;
    H5_DOMAIN = H5_DAILY_DOAMIN;
    TMS_DOMAIN = TMS_DAILY_DOAMIN;
    API_QUEUE_DOMAIN = API_QUEUE_UAT_DOMAIN;
    API_AOLSEE_DOMAIN = API_UAT_AOLSEE;
  } else if (IS_UAT) {
    API_DOMAIN = API_UAT_DOMAIN;
    H5_DOMAIN = H5_UAT_DOMAIN;
    TMS_DOMAIN = TMS_UAT_DOMAIN;
    API_QUEUE_DOMAIN = API_QUEUE_UAT_DOMAIN;
    API_AOLSEE_DOMAIN = API_UAT_AOLSEE;
  } else if (IS_ABTEST) {
    API_DOMAIN = API_ABTEST_DOMAIN;
    H5_DOMAIN = H5_ABTEST_DOMAIN;
    TMS_DOMAIN = TMS_ABTEST_DOMAIN;
    API_QUEUE_DOMAIN = API_QUEUE_UAT_DOMAIN;
    API_AOLSEE_DOMAIN = API_UAT_AOLSEE;
  } else {
    API_DOMAIN = API_ONLINE_DOMAIN;
    H5_DOMAIN = H5_ONLINE_DOMAIN;
    TMS_DOMAIN = TMS_ONLINE_DOMAIN;
    API_AOLSEE_DOMAIN = API_ONLINE_AOLSEE;
  }

  //
  // var spmview = (function () {
  //   if (window.location.href.indexOf("spm-view") != -1) {
  //     spmView();
  //   }
  //   $('#J_SpmView').on("click", function () {
  //     spmView();
  //   })
  // })();
  //
  // function spmView() {
  //
  //   window.spmviewpwd = localStorage.getItem("spmviewpwd");
  //
  //   if (!spmviewpwd) {
  //     window.spmviewpwd = window.prompt("请输入密码")
  //   }
  //
  //   if (spmviewpwd) {
  //     localStorage.setItem("spmviewpwd", window.spmviewpwd);
  //     setTimeout(function () {
  //       seajs.use("mods/track/view")
  //     }, 50)
  //   }
  // }

  // console.log(123)
  /**
   普通挂号 4， 专家挂号 5， 名医挂号 6
   普通预约 1， 专家预约 2， 名医预约 3
   */

  window.config = {
    version: "1.12.56",
    daily: IS_DAILY,
    isTest: IS_ABTEST,
    isUAT: IS_UAT,
    h5Domain: H5_DOMAIN,
    domain: API_DOMAIN,
    domainName: API_DOMAIN,
    queueDomain: API_QUEUE_DOMAIN,
    aolseeDomain: API_AOLSEE_DOMAIN,
    // spm 服务器
    trackUrl: API_SMP_DOMAIN,
    // 工单系统服务器
    orderUrl: API_ORDER_DOMAIN,
    tmsDomain: TMS_DOMAIN,
    corpId: 261,//todo需要删除
  }

  seajs.config({
    alias: {
      "PageModule": "component/PageModule",
      "io": "../libs/io"
    }
  });


  try {
    document.domain = "yuantutech.com";
  } catch (e) {
    console.log("set domain error");
  }

  if (IS_DAILY || IS_ABTEST || IS_UAT) {
    let text = "";
    if (IS_DAILY) {
      text = "[daily]"
    }
    if (IS_ABTEST) {
      text = "[abtest]"
    }
    if (IS_UAT) {
      text = "[uat]"
    }
    $('<div class="uat-box"><span class="fixed-test" id="J_FixedTest">' + text + '环境请勿挂号</span></div>').insertBefore(document.body.firstElementChild);
  }
})();
