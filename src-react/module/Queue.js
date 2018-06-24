//无缓存数据
import JSONPAsyncData from '../lib/JSONPAsyncData'
//优先读取缓存数据
import JSONPCacheAsyncData from '../lib/JSONPCacheAsyncData'
import 'isomorphic-fetch';
import {QUEUE_DOMAIN, IS_DAILY, IS_UAT, IS_ONLINE} from '../config'
import util from '../lib/util';

/*function getAPIUri(path) {
  return QUEUE_DOMAIN + path
}*/

async function getAPIUri(path) {
  const query = util.query();
  const corpId = query.corpId || '';
  const response = await fetch("//s.yuantutech.com/tms/queue/fenzhen-config.php?corpId=" + corpId);
  const apiDomain = await response.json();

  if (IS_DAILY) {
    return apiDomain["daily"] + path;
  } else if (IS_UAT) {
    return apiDomain["uat"] + path;
  } else {
    return apiDomain["online"] + path;
  }
}


export default {
  async queryCorpArea(corpId) {
    const api = await getAPIUri("/queue/api/app/queryCorpArea");
    return new JSONPAsyncData(api, {corpId});
  },
  async queryHzQueueByArea(corpId, area) {
    const api = await getAPIUri("/queue/api/app/queryHzQueueByArea");
    return new JSONPAsyncData(api, {corpId, area});
  },
  async queryMedicalTechVOByArea(corpId, area) {
    const api = await getAPIUri("/queue/api/app/queryMedicalTechVOByArea");
    return new JSONPAsyncData(api, {corpId, area});
  },
  async zhenjianQueueByQueue(corpId, area, queueCode) {
    const api = await getAPIUri("/queue/api/app/zhenjianQueueByQueue");
    return new JSONPAsyncData(api, {corpId, area, queueCode});
  },
  async queryAreaDetail(corpId, area) {
    const api = await getAPIUri("/queue/api/app/queryAreaDetail");
    return new JSONPAsyncData(api, {corpId, area});
  },
  async queryQueueDetail(corpId, deptCode, doctCode, regType, subRegType) {
    const api = await getAPIUri("/queue/api/app/queryQueueDetail");
    return new JSONPAsyncData(api, {corpId, deptCode, doctCode, regType, subRegType});
  }
}