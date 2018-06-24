import util from '../lib/util';
import H5_VERSION from '../../h5-version';
function AjaxAsyncData(url,methed, data, success) {
    var ajax = new XMLHttpRequest()
    // get请求
    data = data || {};
    data.t = parseInt(Math.random() * 100000);
    data.invokerChannel = 'H5';
    data.invokerDeviceType = util.isInYuantuApp() ? 'yuantuApp' : (util.isWeixin() ? 'weixin' : 'others');
    data.invokerAppVersion = H5_VERSION;
    var param = '';
    for (var attr in data) {
        param += attr + '=' + data[attr] + '&';
    }
    if (param) {
        param = param.substring(0, param.length - 1);
    }
    ajax.open(methed, url + '?' + param);
    ajax.withCredentials = true;
    ajax.send();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            success(JSON.parse(ajax.responseText));
        }
    }

}
module.exports = AjaxAsyncData;