
//以下js有两个域名访问
//http://s.yuantutech.com/tms/h5/oauth-login.php
//http://guahao.jkqd.gov.cn/oauth-login.php

define(function(require, exports, module){

  var md5 = require("libs/md5");
  var VModule = require("component/VModule");
  var registerToken = require("mods/register-token/index")
  /**


      页面正在完善，你传入了以下参数
      <pre>
      <?php
        print_r($_GET);
      ?>
      </pre>

      页面需求参数说明：（请注意参数需进过url编码）
      <pre>
            // //daily.yuantutech.com/tms/h5/oauth-login.php?appid=1  测试环境
            appid:test //远图给第三方的id,
            sign:"FGHJKRYUIGHJK345678" //加密字符串
            phone:"136...." //用户手机
            idNo:"511321....x" //用户身份证号码
            cardType:"4"//卡类型 1:青岛区域诊疗卡 2:青岛医保卡  3:广州医保卡  4:广州番禺民生卡
            name:"" //用户真实姓名
            cardNo:""// 卡面号
            custId:"" // 客户id
            redirectCorpId:"123", //重定向到某医院首页 医院id   优先级1
            redirectUnionId:"60", //重定向到 区域医院首页  区域id  优先级2
            redirectUrl: "//www.baidu.com" //  登录完成跳转地址 优先级3
            redirectUrlKey:1 //数字，数字定义在 http://daily.yuantutech.com/tms/h5/huiyi.php 废弃 redirectUrl  
      </pre>

  */
  //当前页面只能运行在tms的的域名下
  var page = VModule.render({
    init:function(){

      this.state = {
        loading:true
      }
      /**
        appId 医联体Id 数字  医联体Id
        phone 电话号码  数字
        idNo  身份证号码 数字
        name  姓名  字符串
        guader_id 监护人身份证  数字
        guader_name 监护人姓名 字符串
        cardNo  卡号  数字
        cardType  卡类型 数字
        custId  客户号 数字
        sign  签名  字符串

        redirectCorpId:"123", //重定向到某医院首页 医院id   优先级1
        redirectUnionId:"60", //重定向到 区域医院首页  区域id  优先级2
        redirectUrl: "//www.baidu.com" //  登录完成跳转地址 优先级3
      */
      ////gitlab.yuantutech.com/yuantu/usercenter/wikis/vaccine_schedule
      this.redirectCorpId = this.query.redirectCorpId;
      this.redirectUnionId = this.query.redirectUnionId;
      this.redirectUrl = this.query.redirectUrl;
      this.redirectUrlKey = this.query.redirectUrlKey;

      // console.log( this.query )
      this.module = this.initModule(this.state, '#J_Page');
      this.get("/user-web/restapi/common/ytUsers/loginOauth", this.query);
    },
    onSuccess(result){
      // $('#')
      result.loading = false;
      if(result.success){
        //青岛PC是guahao.gov的域名 这里直接跳转到线上
        if(location.href.indexOf(".yuantutech.com") == -1){
          location.replace("https://s.yuantutech.com/tms/h5/huiyi.php?"+this.util.flat({
            redirectCorpId:this.redirectCorpId,
            redirectUnionId:this.redirectUnionId,
            redirectUrl:this.redirectUrl,
            redirectUrlKey:this.redirectUrlKey,
          }))
        }else{
          location.replace("/tms/h5/huiyi.php?"+this.util.flat({
            redirectCorpId:this.redirectCorpId,
            redirectUnionId:this.redirectUnionId,
            redirectUrl:this.redirectUrl,
            redirectUrlKey:this.redirectUrlKey,
          }))
        }
      }
      this.setState(result)
    },
    onError(result){
      result.loading = false;
      this.setState(result)
    },
    render(state){
      return '';
    },
    renderError(state){
      return `
        <div class="ui-tips center" style="margin-top:50px;">授权登录失败<br/>${state.msg || ""} , code:${state.resultCode || ""}</div>
        <div style="margin:30px 20px;">
          <a class="ui-btn-lg ui-btn-primary" href="/tms/h5/huiyi.php?${this.util.flat({
            redirectCorpId:this.redirectCorpId,
            redirectUnionId:this.redirectUnionId,
            redirectUrl:this.redirectUrl,
            redirectUrlKey:this.redirectUrlKey,
        })}">继续浏览页面</a>
        </div>
        <div style="position:absolute;bottom:20px;width:100%;text-align:center;font-size:12px;"><a href="//s.yuantutech.com/tms/fb/join-h5.html" target="_blank">查看接入文档</a></div>
      `
    }
  });


  //页面
  page.init();

  module.exports = page;

});
