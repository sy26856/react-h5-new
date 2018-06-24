define(function(require, exports, module) {
    console.log(test)
    module.exports = [{
        "name": "医院",
        "list": [{
            "name": "区域医院首页",
            "api": "/user-web/restapi/common/corp/unionHome",
            "param": {
                "unionId": 29,
                "ver": "1.0"
            }
        }, {
            "name": "单体医院首页",
            "api": "/user-web/restapi/common/corp/corpHome",
            "param": {
                "corpId": 162,
                "ver": "1.0"
            }
        }]
    }, {
        "name": "预约",
        "list": [{
            "name": "我的预约",
            "api": "/user-web/restapi/reservation/reginfo",
            "param": {
                "corpId": 162,
                "unionId": "",
                "ver": "1.0"
            }
        }, {
            "name": "预约详情",
            "api": "/user-web/restapi/reservation/reginfodetail",
            "param": {
                "corpId": 162,
                "id": 48,
                "ver": "1.0"
            }
        }, {
            "name": "取消预约",
            "api": "/user-web/restapi/reservation/cancelappoint",
            "param": {
                "id": 48,
                "ver": "1.0"
            }
        }]
    }];



});