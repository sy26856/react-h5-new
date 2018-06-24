//define(function (require, exports, module) {

define(function (require, exports, module) {
  var VModule = require("component/VModule");
  var PageModule = require("component/PageModule");

  var page = VModule.render({
    init: function () {


      if (!this.query.corpId) {
        this.util.alert("缺少corpId");
      }
      this.id = this.query.id || "";
      this.unionId = this.query.unionId || "";
      this.corpSelected = this.query.selected
      this.state = {
        loading: true
      }
      this.module = this.initModule(this.state, '#J_Page');

      this.getCache2("/user-web/restapi/common/corp/corpHome", {
        corpId: this.corpId,
        unionId: this.unionId,
        id: this.query.id
      });

      this.io.get(this.config.aolseeDomain + '/open/app/news/notice', {
        corpId: this.corpId,
        unionId: this.unionId
      }, (result) => {
        if (result.data.id) {

          this.setState({
            noticeTitle: result.data.title,
            noticeId: result.data.id
          });

          // $('#notice').removeClass('hide').html('<span class="icon gonggao"></span>' + result.data.title)
          //   .attr('href', this.util.flatStr("../news-detail.html?", {
          //     target: "_blank",
          //     id: result.data.id
          //   }));
        }
      });

      this.regEvent();
    },
    regEvent: function () {
      var self = this;

      $('#J_Page').delegate("a.fun", 'click', (event) => {
        //未开通
        // console.log( event.currentTarget )
        if (!$(event.currentTarget).attr("href")) {
          event.preventDefault();
          self.util.alert("未开通，敬请期待");
          return;
        }

        //需要登录
        if ($(event.currentTarget).hasClass("J_NeedLogin")) {
          if (!self.util.isLogin()) {
            event.preventDefault();
            self.util.goLogin();
            return false;
          }
        }
      });

      $('#J_Page').delegate(".J_Search", 'click', (event) => {


        let isInYuantuApp = this.util.isInYuantuApp()
        //在慧医app中，&& 版本号大于2.4.4 使用APP的搜索
        if (isInYuantuApp && this.util.version.gt(2, 4, 4)) {
          window.location.href = "yuantuhuiyi://huiyi.app/search?corpId=" + self.corpId + "&sourceId=0";
        } else {
          window.location.href = "../search.html?corpId=" + self.corpId + "&unionId=" + self.query.unionId
        }
      });

    },

    onSuccess: function (result) {

      var data = result.data;
      var corpId = this.corpId;
      var headerImage = null;
      var corpName = null;
      var tag = null;
      try {
        headerImage = result.data.banners ? result.data.banners[0].img : "";
        //"http://s.yuantutech.com/i4/8fb394296c4b1959665c3bf4c2be2370-480-296.png"
        corpName = result.data.name;
        tag = result.data.tags ? result.data.tags[0] : "";
      } catch (e) {
        console.log(e)
        console.log("数据错误")
      }
      console.log(result);
      let leafList = data.leafList;

      this.setState({
        loading: false,
        success: true,
        corpId: data.corpId || this.corpId,
        unionId: this.query.unionId,
        leafList: data.leafList,
        headerImage: headerImage,
        corpName: corpName,
        tag: tag,
        tags: data.tags,
        address: data.address,
        funcions: data.funcions,
        corpInfo: data.corpInfo,
        // noticeTitle: data.noticeTitle,
        // noticeId: data.noticeId,
        phone: data.corpPhone
      });

      if (corpName) {
        this.util.setNativeTitle(corpName);
      }

      if (!(leafList && leafList.length > 1 && !this.corpSelected)) {
        //提取村文本文件
        let div = document.createElement("div");
        div.innerHTML = data.corpInfo || corpName;
        let corpInfo = div.innerText
        corpInfo = corpInfo.replace(/[\n\t]/g, "");
        // console.log(corpInfo)
        //分享医院首页
        this.util.brige("share", {
          "isShowButton": true,
          "isCallShare": false, //是否立即唤醒分享
          "title": corpName,
          "text": corpInfo.slice(0, 50),
          "url": window.location.href,
          "imageUrl": data.logo,
        }, function (e) {
          // alert(JSON.stringify(e))
        }, function (e) {
          // alert(JSON.stringify(e))
        }, 600000);
      }

    },
    renderHref(href, query){
      href += (href.indexOf("?") == -1 ? "?" : "&")
      return href + this.util.flat(query);
    },
    render(state){


      let {headerImage, corpName, tags, address, corpInfo, funcions, unionId, leafList, corpId, noticeTitle, noticeId, phone} =  state;
      let util = this.util;
      //大于2.4.4版本有搜索功能
      let isInYuantuApp = this.util.isInYuantuApp();
      let isShowPhone = isInYuantuApp && this.util.version.gt(2, 4, 4);

      /*var funcions2 = funcions;
      funcions2.forEach(z => {
        z.title == "预约挂号" ? z.href = `../sections.html?regMode=1&corpId=${corpId}&unionId=${unionId}&target=_blank` : '';
        z.title == "当日挂号" ? z.href = `../sections.html?regMode=2&corpId=${corpId}&unionId=${unionId}&target=_blank` : '';
      });*/

      if (leafList && leafList.length > 1 && !this.corpSelected) {
        //选择院区
        // this.util.setNativeTitle( corpName )
        return this.renderSelect(state);

      } else {

        return `<div class="ui-searchbar-wrap ui-border-b J_Search">
	            <div class="ui-searchbar ui-border-radius">
	                <i class="ui-icon-search"></i>
	                <div class="ui-searchbar-text">搜索科室/医生快速预约挂号</div>
	                <div class="ui-searchbar-input">
	                    <input value="" type="text" placeholder="搜索科室" maxlength="10" id="J_SearchInput" autocapitalize="off">
	                </div>
	                <i class="ui-icon-close" id="J_SearchClear"></i>
	            </div>
	            <button class="ui-searchbar-cancel">取消</button>
	        </div>
				<div class="corp-index">
					<div class="banner" style="background-image:url(${headerImage})"></div>
					<div class="corp-info">
						<a data-spm="i1"  class="base ui-border-b ${util.is(corpInfo, " ui-arrowlink", "")}" ${corpInfo ? `href="../corp-info.html?corpId=${corpId}&unionId=${unionId}&target=_blank"` : ""} >
							<h1>${corpName}</h1>
							<div class="tags">${tags.map((tag) => {
          return `<span>${tag}</span>`
        }).join("")}</div>
						</a>
						${
          address || (phone && isShowPhone) ?
            `
								<div class="contact ui-border-b">
									${address ? `<a class="address" data-spm="d1"  href="../navigation.html?corpId=${corpId}&target=_blank"><span class="icon address"></span>${address}</a>` : ""}
									${phone && isShowPhone ? `<a href="tel:${phone}" data-spm="p1"   class="telephone ui-border-l"></a>` : ""}
								</div>
								` : ""
          }
          ${

          noticeId ? `
              <a class="news ui-border-b" id="notice" data-spm="n1" href=${this.util.flatStr("../news-detail.html?", {
              target: "_blank",
              unionId: unionId,
              id: noticeId
            })}>
                <span class="icon gonggao"></span>${noticeTitle}
              </a>
          ` : ""

          }
							
					</div>
					<div class="corp-funs" data-spm="2" >
						${
          funcions.map((item) => {
            return `
									<a class="fun ${item.isNeedLogin ? " J_NeedLogin" : ""}" ${
              item.href ? `href="${this.renderHref(item.href, {
                  corpId: corpId,
                  unionId: unionId,
                  title: 'none',
                  target: "_blank"
                })}"` : ""
              } >
										${!item.href ? `<span class="not-server"></span>` : ''}
										${item.newLand ? `<span class="new-land"></span>` : ''}
										<span class="icon" style="background-image:url(${item.icon})" ></span>
										<div class="info">
											<span class="title">${item.title}</span>
											<span class="des">${item.subTitle}</span>
										</div>
									</a>
								`
          }).join("")
          }
						${
          funcions.length % 2 != 0 ? `<div class="fun"></div>` : ""
          }
					</div>
				</div>
				`
      }
    },
    renderSelect(state){
      let {leafList, corpName} = state;
      let uid = this.query.unionId || '';
      return `
				<div class="leaf-corp-title">选择${corpName}下属院区（机构）</div>
				<ul class="ui-list ui-list-link ui-border-tb">
					${
        leafList.map((item) => {
          return `<li class="ui-border-t">
					        <a class="ui-list-info"  href="index.html?corpId=${item.corpId}&unionId=${uid}&selected=1&target=_blank" >
					            <h4 class="ui-nowrap">${item.corpName}</h4>
					            <p class="ui-nowrap">${item.address}</p>
					        </a>
					    </li>`
        }).join("")
        }
			</ul>
			`
    },
    renderError(state){
      return `
				<section class="ui-notice">
					<i></i>
					<div class="ui-tips">${state.msg || "无法获取医院数据，请稍后再试"}</div>
				</section>
			`
    }
  });

  page.init();

  module.exports = page;
});
