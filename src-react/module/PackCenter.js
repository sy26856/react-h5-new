//无缓存数据
import JSONPAsyncData from '../lib/JSONPAsyncData'
import util from '../lib/util';
import md5 from '../lib/md5'
//优先读取缓存数据  
import JSONPCacheAsyncData from '../lib/JSONPCacheAsyncData'
import config from '../config'
import H5_VERSION from '../../h5-version';

const isInYuantuApp = util.isInYuantuApp();

const IS_ONLINE = config.IS_ONLINE;
const ZHENLIAOBAO_DOM = config.ZHENLIAOBAO_DOM;
const PROTOCOL = config.PROTOCOL;


const query = util.query();
const uid = query.unionId || '';
function getAPIUri( path ){
  return ZHENLIAOBAO_DOM.indexOf("http") == 0 ? ZHENLIAOBAO_DOM+path : PROTOCOL+ZHENLIAOBAO_DOM+path;
}
  
export default {
  queryByDays(days,groupName,idNo,name){
    return new JSONPCacheAsyncData(getAPIUri("/device/report/queryByDays"),{days,groupName,idNo,name})
  },
  queryDietByDays(days,groupName,idNo,name){
    return new JSONPCacheAsyncData(getAPIUri("/device/report/queryDietByDays"), {days,groupName,idNo,name});
  },
  queryByDate(year,groupName,idNo,name){
    return new JSONPCacheAsyncData(getAPIUri("/device/report/queryByDate"), {year,groupName,idNo,name});
  },
  getReport(reportId,groupName){
    return new JSONPCacheAsyncData(getAPIUri("/device/report/getReport"), {reportId,groupName});
  }
}