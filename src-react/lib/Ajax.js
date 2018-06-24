function Ajax(url, data, success) {
    var ajax = new XMLHttpRequest()
    // get请求
    var param = '';   
    for (var attr in data) {
        param += attr + '=' + data[attr] + '&';
    }
    if (param) {
        param = param.substring(0, param.length - 1);
    }
    ajax.open('get', url + '?' + param);
    ajax.send();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            success(JSON.parse(ajax.responseText));
        }
    }

}
module.exports = Ajax;