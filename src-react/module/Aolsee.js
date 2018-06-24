//无缓存数据
import JSONPAsyncData from '../lib/JSONPAsyncData'
import AjaxAsyncData from '../lib/AjaxAsyncData'
import util from '../lib/util';
//优先读取缓存数据
import JSONPCacheAsyncData from '../lib/JSONPCacheAsyncData'
import config from '../config'
import PromiseAsync from 'promise-to-async-events'
import JSONP from '../lib/JSONP';
import H5_VERSION from '../../h5-version';

import {IS_ONLINE} from '../config';

const {API_DOMAIN, PROTOCOL, AOLSEE_DOMAIN} = config;
const isInYuantuApp = util.isInYuantuApp();

const deviceInfo = {
  invokerChannel: 'H5',
  invokerDeviceType: isInYuantuApp ? 'yuantuApp' : (util.isWeixin() ? 'weixin' : 'others'),
  invokerAppVersion: H5_VERSION
};

function getAPIUri(path) {
  return PROTOCOL + AOLSEE_DOMAIN + path
}
function ajax(url, data) {
  url = getAPIUri(url);
  data = data || {};
  return new Promise((reslove, reject) => {
    var param = {};

    for (var key in data) {
      if (data[key] !== "" && data[key] !== "undefined" && data[key] !== undefined && data[key] !== null) {
        param[key] = data[key]
      }
    }

    JSONP(url, param, reslove, () => {
      reject({ msg: "请求错误" })
    });

  });
}

PromiseAsync.prototype.mock = function (url) {
  this.promise = ajax(url, {})
  return this
}

export default {

  getNewsList( classifyId, currentPage, unionId, pageSize = 15, coprId, doctCode ) {
    return new JSONPAsyncData(getAPIUri("/open/app/news/page"), { classifyId, currentPage, unionId, pageSize, coprId, doctCode });
  },

  getAppIndexBanner(unionId, invokerDeviceId){
    return new JSONPAsyncData(getAPIUri("/adApi/open/findAppBannerAd.json"), {unionId, invokerDeviceId, ...deviceInfo});
  },

  // 广告获取
  getAdPositionType(deptName, invokerDeviceId, age, targetSexId, unionId,userId) {
    return new JSONPAsyncData(getAPIUri('/adApi/open/findAppAppointAd.json'), {
      deptName, invokerDeviceId, age, targetSexId, unionId,userId
    })
  },

  getNewsClassify(unionId) {
    return new JSONPAsyncData(getAPIUri("/open/app/classify/list"), {unionId});
  },

  getNewsDetail(unionId, id) {
    return new JSONPCacheAsyncData(getAPIUri("/open/app/news/detail"), {unionId, id});
  },

  setAdPv(adId, invokerDeviceId, unionId) {
    return new JSONPAsyncData(getAPIUri('/adApi/open/addAppAdResult.json'), {type:1, adId, invokerDeviceId, unionId});
  },

  findAppFeedbackAd(unionId, invokerDeviceId,id) {
    return new JSONPAsyncData(getAPIUri('/adApi/open/findAppFeedbackAd.json'), {unionId, invokerDeviceId,id});
  },

  //获取常见问题
  getQuestionList(unionId) {
    return new JSONPAsyncData(getAPIUri('/open/app/classify/list'), {
      type: 4,
      unionId
    })
  },

  // 获取卡片广告
  findAppAd ( unionId, adPositionId ) {
    return new JSONPAsyncData(getAPIUri('/adApi/open/findAppAd.json'), {
      adPositionId,
      unionId
    })
  }

  // 获取医院首页的公告
  ,getCorpIndexNotice ( unionId, corpId ) {
    return new JSONPAsyncData(getAPIUri('/open/app/news/notice'), {
      unionId
      ,corpId
    })
  }
  //获取留言内容
  , getPageComment(currentPage,newsID,pageSize=10,unionId) {
    return new PromiseAsync(ajax('/open/app/news/pageComment', {
      currentPage,
      newsID,
      pageSize,
      unionId
    }))
  }
  //资讯
  , addComments(params, success) {
    return new AjaxAsyncData(getAPIUri('/usercenterApi/open/addComment'),'get', params, success)
  }
  , delComments(params, success) {
    return new AjaxAsyncData(getAPIUri('/usercenterApi/open/delComment'),'get', params, success)
  }
  , getStar(params, success) {
    return new AjaxAsyncData(getAPIUri('/usercenterApi/open/star'),'get', params, success)
  }
  , getUnstar(params, success) {
    return new AjaxAsyncData(getAPIUri('/usercenterApi/open/unstar'),'get', params, success)
  }
}
