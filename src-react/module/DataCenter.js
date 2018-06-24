import {SERVICE_DOMAIN, PROTOCOL} from '../config'
import JSONPAsyncData from '../lib/JSONPAsyncData'
import 'isomorphic-fetch'
import util from '../lib/util'

function getServiceAPIUri(path) {
  return SERVICE_DOMAIN.indexOf("http") == 0 ? SERVICE_DOMAIN + path : PROTOCOL + SERVICE_DOMAIN + path
}

export default {
  queryHotWords(unionId) {
    return new JSONPAsyncData(getServiceAPIUri('/spider/api/queryHotWords'), {
      unionId
    })
  },
  getTips(keyword, unionId) {
    return new JSONPAsyncData(getServiceAPIUri('/spider/api/getTips'), {
      keyword,
      unionId
    })
  },
  newSearch(keyword, type = 'all', unionId) {
    let asyncRequest = new JSONPAsyncData(getServiceAPIUri('/spider/api/newSearch'), {
      keyword,
      type,
      unionId
    });
    asyncRequest.isSuccess = function(){
      return true;
    };
    return asyncRequest;
  },
  detail(code, type = 'all') {
    return new JSONPAsyncData(getServiceAPIUri('/spider/api/detail'), {
      code,
      type
    })
  },

  clickItem ( keyword, resultType, resultId, resultName, unionId ) {

    let asyncRequest = new JSONPAsyncData(getServiceAPIUri('/spider/api/click'), {
      deviceType: 'h5',
      resultType,
      keyword,
      resultId,
      resultName,
      unionId,
    });
    asyncRequest.isSuccess = function(){
      return true;
    };
    asyncRequest.fetch();
    return asyncRequest;
    //
    // const result = await fetch( getServiceAPIUri('/spider/api/click') + '?' + util.flat({
    //   deviceType: 'h5'
    //   ,resultType
    //   ,keyword
    //   ,resultId
    //   ,resultName
    //   ,unionId
    // }))
    // // console.log( result )
    // return result
  }
}
