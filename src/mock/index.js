/**
	lib.io.js
	所有 异步  ajax 请求集散地	
*/

define(function(require, exports, module) {

    var cache = require("libs/cache");
    var io = require("libs/io");
    var config = window.config;

    var mockData = {
        "/user-web/Reservation/HospitalInfo": {
            "success": "true", //
            "msg": "成功",
            "data": {
                "corpLogo": "http://s.yuantutech.com/i4/7939b31ce29486aa70e7ec2c8f5dc29f.jpg",
                "corpName": "浙江省人民医院",
                "corpId": 1231231, //医院id
                "functions": [1, 2, 3, 4, 5, 6] //1普通挂号，2专家挂号，3名医挂号，4普通预约，5专家预约，6名医预约   }
            }
        },
        "/ytUsers/reg": {
            "success": "true", //
            "msg": "成功", // 用户不存在，
            "data": {
                "sessionId": "12312312", //用户登录用
                "user_id": 12222
            }
        },
        "/ytUsers/sendcode": {
            "success": "true", //
            "msg": "成功", // 用户不存在，
            "data": null
        },
        "/ytUsers/login": {
            "success": "true",
            msg: "成功",
            data: null
        },
        "/user-web/restapi/common/reservation/numbersource": {
            "success": "true", //
            "msg": "成功", //  如果是fail，提示缘由
            "data": {
                needSource: false,
                sourceList: [{
                    "appoNo": "1",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "2",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "3",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "4",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "5",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "6",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "7",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "8",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "9",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "10",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "11",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "12",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "13",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "14",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "15",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "16",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "17",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "18",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "19",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "20",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "21",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "22",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "23",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "24",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "25",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "26",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "27",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "28",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "29",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "30",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "31",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "32",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "33",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "34",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "35",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "36",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "37",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "38",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "39",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "40",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "41",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "42",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "43",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "44",
                    "medBegTime": "",
                    "medEndTime": ""
                }, {
                    "appoNo": "45",
                    "medBegTime": "",
                    "medEndTime": ""
                }]
            }
        },
        "/user-web/Reservation/Appointment": {
            "success": "true", //
            "msg": "成功", //  如果是fail，提示缘由
            "data": {
                "orderNo": "12312312", //订单号    string  预约号或取号密码
                "sTatus": "200", //100 待支付，101 支付成功-His失败，200 成功，301 退款中...,302 退款成功-His失败，400 已取消 
                "regNo": "0263", //挂号序号，号源
                "regTime": "2015-12-12 14:00",
                "regTime": "2015-12-12 13:00", //候诊时间 string  时段
                "address": "浙江省杭州市上塘路158号", //就诊地点 
                "info": "none", //如果身份未验证需要提示
                "corpId": "1",
                "corpName": "浙江人民医院",
                "patientId": "123",
                "patientName": "代军",
                "isReg": "true", //是否时挂号，true 挂号，false 预约
                "deptCode": "123123",
                "deptname": "耳鼻喉科",
                "doctCode": "1231",
                "doctName": "鲁军",
                "regTime": "2015-12-12",
                "regAmpm": "上午",
                "regNo": "1",
                "treatTime": " 2", //就诊时间 时段
                "appointNo": " 1231231",
                "regId": " 131231231",
                "isVisit": "1",
                "regAmount": "100" //挂号费+诊疗费


            }
        },

        "/user-web/restapi/common/reservation/departmentlist": {
            "success": "true", //
            "msg": "成功",
            "data": [{
                "deptCode": "0263",
                "deptName": "便民门诊",
                "deptPy": "bianminmenzhen"

            }, {
                "deptCode": "0080",
                "deptName": "产科门诊",
                "deptPy": "chankemenzhen"
            }]
        },

        "/user-web/restapi/patient/update": {
            "success": true, //
            "msg": "成功", // 如果success false 提示错误原因，如：用户不存在，
            "data": true
        },
        "/user-web/restapi/patient/add": {
            "success": true, //
            "msg": "成功", // 用户不存在，
            "data": 23 //平台患者id 
        },
        "/user-web/restapi/patient/getList": {
            "success": true,
            "msg": "成功",
            "data": [{
                "orderNo": "00100231",
                "regTime": "2015-09-29",
                "type": "普通预约号",
                "deptname": "外科"
            }, {
                "orderNo": "00100232",
                "regTime": "2015-09-30",
                "type": "加急预约号",
                "deptname": "内科"
            }, {
                "orderNo": "00100233",
                "regTime": "2015-10-01",
                "type": "加急预约号",
                "deptname": "妇科"
            }]
        },
        "/user-web/Reservation/get": {
            "success": true,
            "msg": "成功",
            "data": {
                "orderNo": "1334645",
                "corpName": "浙江省人民医院",
                "patientName": "李丁丁",
                "type": 1,
                "deptName": "眼科",
                "doctName": "李医生",
                "sTatus": 200,
                "regNo": "0023",
                "regAmpm": "下午",
                "date": "2015-09-30",
                "regTime": "2015-10-05",
                "address": "第三门诊部",
                "info": "需要到自助机验证身份"
            }
        },
        "/user-web/restapi/common/corpNews/helthInfo": {
            "success": true, //
            "msg": "成功", // 用户不存在，
            "data": [{
                "id": 1,
                "title": "app配置一下数据，app启动读取配置文件进行页面加载。",
                "img": "http://s.yuantutech.com/i4/7939b31ce29486aa70e7ec2c8f5dc29f.jpg",
                "url": "http://www.taobao.com"
            }, {
                "id": 1,
                "title": "app配置一下数据，app启动读取配置文件进行页面加载。",
                "img": "http://s.yuantutech.com/i4/7939b31ce29486aa70e7ec2c8f5dc29f.jpg",
                "url": "http://www.taobao.com"
            }, {
                "id": 1,
                "title": "app配置一下数据，app启动读取配置文件进行页面加载。",
                "img": "http://s.yuantutech.com/i4/7939b31ce29486aa70e7ec2c8f5dc29f.jpg",
                "url": "http://www.taobao.com"
            }, {
                "id": 1,
                "title": "app配置一下数据，app启动读取配置文件进行页面加载。app配置一下数据，app启动读取配置文件进行页面加载。",
                "img": "http://s.yuantutech.com/i4/7939b31ce29486aa70e7ec2c8f5dc29f.jpg",
                "url": "http://www.taobao.com"
            }]
        },
        "/user-web/restapi/common/pay/getpaymentessentialslist": {
            "success": true, //
            "msg": "成功",
            "data": [{
                "corpId": "51", //医院id
                "patientId": "patientId", //用户平台病人id
                "patientName": "鲁军",
                "hisId": "123", //病人在医院的就诊id

                "billNo": "56789123", //待结算医院单据号
                "billDate": "1989-09-21", //开单日期 YYYY-MM-DD
                "billType": "西药", //单据类型 西药，中药，化验等
                "billFee": "4900", //该单费用
                "deptCode": "123", //开单科室代码
                "deptName": "化验科", //开单科室名称
                "doctCode": "123", //开单医生代码
                "doctName": "王医生" //开单医生姓名
            }, {
                "corpId": "51", //医院id
                "patientId": "patientId", //用户平台病人id
                "patientName": "鲁军",
                "hisId": "123", //病人在医院的就诊id

                "billNo": "56789123", //待结算医院单据号
                "billDate": "1989-09-21", //开单日期 YYYY-MM-DD
                "billType": "西药", //单据类型 西药，中药，化验等
                "billFee": "4900", //该单费用
                "deptCode": "123", //开单科室代码
                "deptName": "化验科", //开单科室名称
                "doctCode": "123", //开单医生代码
                "doctName": "王医生" //开单医生姓名
            }]
        },
        "user-web/Reservation/RegInfo": {
            "success": true,
            "resultCode": "100",
            "msg": "成功",
            "data": [{
                "id": 38,
                "orderNo": "88000001",
                "status": 200,
                "type": 3,
                "regMode": 2,
                "regType": 3,
                "createDate": 1444467813000,
                "userId": 100001,
                "patientId": 25,
                "hisId": "31260001",
                "patientName": "猪猪",
                "idType": 0,
                "idNo": "410527198810101234",
                "regNo": "6",
                "regDate": 1444924800000,
                "regBeginTime": 6660000,
                "regEndTime": 7200000,
                "regAmpm": 1,
                "address": "3号楼一楼105",
                "regAmount": 15.0,
                "corpId": 11,
                "corpName": "浙江第一人民医院[轩轩测试用]",
                "deptCode": "101",
                "deptName": "骨科",
                "doctCode": "203",
                "doctName": "刘医生"
            }]
        },
        "/user-web/restapi/pay/query/billlist": {
            "success": true,
            "resultCode": "100",
            "msg": "成功",
            "data": {
                "data": [{
                    "gmtModify": 1448088894000,
                    "gmtCreate": 1448088894000,
                    "id": 1246,
                    "corpId": 162,
                    "corpUnionId": 29,
                    "userId": 58,
                    "patientId": 78,
                    "hisId": null,
                    "outId": null,
                    "billNo": null,
                    "fee": 1,
                    "status": 400,
                    "feeChannel": 1,
                    "optType": 1,
                    "outPayNo": null,
                    "receiptNo": null,
                    "outPayAttr": null,
                    "hisAttr": null,
                    "subject": "充值",
                    "corpName": null,
                    "corpUnionName": "青岛医联体",
                    "createTime": "2015-11-21 14:54:54"
                }, {
                    "gmtModify": 1448088816000,
                    "gmtCreate": 1448088806000,
                    "id": 1245,
                    "corpId": 162,
                    "corpUnionId": 29,
                    "userId": 58,
                    "patientId": 487,
                    "hisId": null,
                    "outId": null,
                    "billNo": null,
                    "fee": 1,
                    "status": 300,
                    "feeChannel": 2,
                    "optType": 1,
                    "outPayNo": "1003970848201511211699752927",
                    "receiptNo": "20151022171350115911",
                    "outPayAttr": "{\"transaction_id\":\"1003970848201511211699752927\",\"nonce_str\":\"SU1448088806\",\"bank_type\":\"CFT\",\"openid\":\"oYPywswDE-gOqzkTw8jmN_OfwwWg\",\"sign\":\"223FB63636EE80F21D150804D0D6C45D\",\"fee_type\":\"CNY\",\"mch_id\":\"1279981801\",\"cash_fee\":\"1\",\"out_trade_no\":\"1245\",\"appid\":\"wxe9062380f1a04582\",\"total_fee\":\"1\",\"trade_type\":\"APP\",\"result_code\":\"SUCCESS\",\"time_end\":\"20151121145334\",\"is_subscribe\":\"N\",\"return_code\":\"SUCCESS\"}",
                    "hisAttr": "{\"data\":{\"cash\":12000,\"receiptNo\":\"20151022171350115911\"},\"msg\":\"成功\",\"resultCode\":\"100\",\"success\":true}",
                    "subject": "充值",
                    "corpName": null,
                    "corpUnionName": "青岛医联体",
                    "createTime": "2015-11-21 14:53:26"
                }, {
                    "gmtModify": 1448088779000,
                    "gmtCreate": 1448088779000,
                    "id": 1244,
                    "corpId": 162,
                    "corpUnionId": 29,
                    "userId": 58,
                    "patientId": 487,
                    "hisId": null,
                    "outId": null,
                    "billNo": null,
                    "fee": 1,
                    "status": 400,
                    "feeChannel": 1,
                    "optType": 1,
                    "outPayNo": null,
                    "receiptNo": null,
                    "outPayAttr": null,
                    "hisAttr": null,
                    "subject": "充值",
                    "corpName": null,
                    "corpUnionName": "青岛医联体",
                    "createTime": "2015-11-21 14:52:59"
                }, {
                    "gmtModify": 1448088772000,
                    "gmtCreate": 1448088772000,
                    "id": 1243,
                    "corpId": 162,
                    "corpUnionId": 29,
                    "userId": 58,
                    "patientId": 487,
                    "hisId": null,
                    "outId": null,
                    "billNo": null,
                    "fee": 1,
                    "status": 400,
                    "feeChannel": 2,
                    "optType": 1,
                    "outPayNo": null,
                    "receiptNo": null,
                    "outPayAttr": null,
                    "hisAttr": null,
                    "subject": "充值",
                    "corpName": null,
                    "corpUnionName": "青岛医联体",
                    "createTime": "2015-11-21 14:52:52"
                }, {
                    "gmtModify": 1448088723000,
                    "gmtCreate": 1448088723000,
                    "id": 1241,
                    "corpId": 162,
                    "corpUnionId": 29,
                    "userId": 58,
                    "patientId": 483,
                    "hisId": null,
                    "outId": null,
                    "billNo": null,
                    "fee": 1,
                    "status": 400,
                    "feeChannel": 2,
                    "optType": 1,
                    "outPayNo": null,
                    "receiptNo": null,
                    "outPayAttr": null,
                    "hisAttr": null,
                    "subject": "充值",
                    "corpName": null,
                    "corpUnionName": "青岛医联体",
                    "createTime": "2015-11-21 14:52:03"
                }, {
                    "gmtModify": 1448088696000,
                    "gmtCreate": 1448088696000,
                    "id": 1240,
                    "corpId": 162,
                    "corpUnionId": 29,
                    "userId": 58,
                    "patientId": 483,
                    "hisId": null,
                    "outId": null,
                    "billNo": null,
                    "fee": 1,
                    "status": 400,
                    "feeChannel": 2,
                    "optType": 1,
                    "outPayNo": null,
                    "receiptNo": null,
                    "outPayAttr": null,
                    "hisAttr": null,
                    "subject": "充值",
                    "corpName": null,
                    "corpUnionName": "青岛医联体",
                    "createTime": "2015-11-21 14:51:36"
                }, {
                    "gmtModify": 1448088577000,
                    "gmtCreate": 1448088577000,
                    "id": 1237,
                    "corpId": 162,
                    "corpUnionId": 29,
                    "userId": 58,
                    "patientId": 483,
                    "hisId": null,
                    "outId": null,
                    "billNo": null,
                    "fee": 1,
                    "status": 400,
                    "feeChannel": 2,
                    "optType": 1,
                    "outPayNo": null,
                    "receiptNo": null,
                    "outPayAttr": null,
                    "hisAttr": null,
                    "subject": "充值",
                    "corpName": null,
                    "corpUnionName": "青岛医联体",
                    "createTime": "2015-11-21 14:49:37"
                }, {
                    "gmtModify": 1448088474000,
                    "gmtCreate": 1448088474000,
                    "id": 1235,
                    "corpId": 162,
                    "corpUnionId": 29,
                    "userId": 58,
                    "patientId": 483,
                    "hisId": null,
                    "outId": null,
                    "billNo": null,
                    "fee": 1,
                    "status": 400,
                    "feeChannel": 2,
                    "optType": 1,
                    "outPayNo": null,
                    "receiptNo": null,
                    "outPayAttr": null,
                    "hisAttr": null,
                    "subject": "充值",
                    "corpName": null,
                    "corpUnionName": "青岛医联体",
                    "createTime": "2015-11-21 14:47:54"
                }, {
                    "gmtModify": 1448088336000,
                    "gmtCreate": 1448088336000,
                    "id": 1233,
                    "corpId": 162,
                    "corpUnionId": 29,
                    "userId": 58,
                    "patientId": 483,
                    "hisId": null,
                    "outId": null,
                    "billNo": null,
                    "fee": 1,
                    "status": 400,
                    "feeChannel": 2,
                    "optType": 1,
                    "outPayNo": null,
                    "receiptNo": null,
                    "outPayAttr": null,
                    "hisAttr": null,
                    "subject": "充值",
                    "corpName": null,
                    "corpUnionName": "青岛医联体",
                    "createTime": "2015-11-21 14:45:36"
                }],
                "totalItem": 13,
                "pageSize": 9,
                "currentPage": 2
            }
        },
        "/user-web/restapi/ytUsers/viewPatientInspect": {
            "success": true,
            "resultCode": "100",
            "msg": "成功",
            "data": [{
                "patientName": "布娃娃",
                "inspectType": "血常规",
                "corpId": 73,
                "checkUpDate": 1447722265000,
                "repId": 4
            }, {
                "patientName": "鲁军",
                "inspectType": "建卡生化+外科常规",
                "corpId": 73,
                "checkUpDate": 1447669143000,
                "repId": 3
            }, {
                "patientName": "你好",
                "inspectType": "血常规",
                "corpId": 73,
                "checkUpDate": 1447669105000,
                "repId": 2
            }, {
                "patientName": "布娃娃",
                "inspectType": "血科",
                "corpId": 73,
                "checkUpDate": 1447314269000,
                "repId": 5
            }, {
                "patientName": "布娃娃",
                "inspectType": "血科",
                "corpId": 73,
                "checkUpDate": 1336193702000,
                "repId": 10
            }, {
                "patientName": "布娃娃",
                "inspectType": "血科",
                "corpId": 73,
                "checkUpDate": 1336193702000,
                "repId": 12
            }, {
                "patientName": "布娃娃",
                "inspectType": "血科",
                "corpId": 73,
                "checkUpDate": 1336193702000,
                "repId": 11
            }, {
                "patientName": "布娃娃",
                "inspectType": "血科",
                "corpId": 73,
                "checkUpDate": 1336193702000,
                "repId": 13
            }, {
                "patientName": "布娃娃",
                "inspectType": "血科",
                "corpId": 73,
                "checkUpDate": 1336193702000,
                "repId": 19
            }]
        },
        "/user-web/restapi/common/reservation/scheduleinfo": {
            "success": true,
            "resultCode": "100",
            "msg": "成功",
            "data": [{
                "date": "2015-11-27",
                "asDoc": false,
                "data": [
                	{
                		"asDoc": true,
	                    "medDate": "2015-11-27",
	                    "deptCode": "025",
	                    "deptName": "小儿科",
	                    "parentDeptCode": null,
	                    "parentDeptName": null,
	                    "doctCode": null,
	                    "doctName": "鲁军",
	                    "doctTech": null,
	                    "hosRegType":123,
	                    "listSchedule": [{
	                        "medAmPm": 2,
	                        "regFee": "400",
	                        "treatFee": "0",
	                        "regAmount": "400",
	                        "scheduleId": null,
	                        "restnum": "999"
	                    }]
                	},
                	{
                		"asDoc": true,
	                    "medDate": "2015-11-27",
	                    "deptCode": "025",
	                    "deptName": "小儿科",
	                    "parentDeptCode": null,
	                    "parentDeptName": null,
	                    "doctCode": null,
	                    "doctName": null,
	                    "doctTech": null,
	                    hosRegType:456,
	                    "listSchedule": [{
	                        "medAmPm": 2,
	                        "regFee": "400",
	                        "treatFee": "0",
	                        "regAmount": "400",
	                        "scheduleId": null,
	                        "restnum": "999"
	                    }]
                	},
                	{
                		"asDoc": false,
	                    "medDate": "2015-11-27",
	                    "deptCode": "025",
	                    "deptName": "小儿科",
	                    "parentDeptCode": null,
	                    "parentDeptName": null,
	                    "doctCode": null,
	                    "doctName": null,
	                    "doctTech": null,
	                    hosRegType:12321,
	                    "listSchedule": [{
	                        "medAmPm": 2,
	                        "regFee": "400",
	                        "treatFee": "0",
	                        "regAmount": "400",
	                        "scheduleId": null,
	                        "restnum": "999"
	                    }]
                	}
                ]
            }]
        },
        "/user-web/restapi/pay/getpaymentlist":{"success":true,"resultCode":"100","msg":"成功","data":[{"corpId":261,"corpName":"青岛妇女儿童医院","patientId":200733,"patientName":"丫头","idNo":"13092319910420***6","guardId":null,"billNo":"18301416","billDate":"2015-12-02 09:53:19","billType":"非药品","billFee":500,"deptCode":null,"deptName":null,"doctCode":null,"doctName":null},{"corpId":261,"corpName":"青岛妇女儿童医院","patientId":51857,"patientName":"刁俊玲","idNo":"13092319820327***9","guardId":null,"billNo":"18300893","billDate":"2015-12-02 09:44:24","billType":"非药品","billFee":500,"deptCode":null,"deptName":null,"doctCode":null,"doctName":null}],"startTime":1449126312466,"timeConsum":17413},
        "/user-web/restapi/pay/getpaymentdetail":{"success":true,"resultCode":"100","msg":"成功","data":{"billNo":"18301416","corpId":261,"corpName":"青岛妇女儿童医院","hisId":null,"patientId":200733,"patientName":"丫头","idNo":"13092319910420***6","items":[{"billDate":"2015-12-02","itemNo":1,"productCode":"F00000001822","itemName":"产前检查","itemSpecs":"","itemLiquid":null,"itemUnits":"次","itemQty":1,"itemPrice":500,"cost":500,"billFee":500}],"preSettlement":{"selfFee":500,"insurFee":0,"insurFeeInfo":"","payAccount":500}},"startTime":1449126365599,"timeConsum":8156},
        "/user-web/restapi/pay/type":{"success":true,"resultCode":"100","msg":"成功","data":{"accoutPay":{"balance":100,"status":true},"aliPay":{"status":true},"wxPay":{"status":true}},"startTime":1449127229437,"timeConsum":0},
        "/user-web/restapi/patient/get":{"success":true,"resultCode":"100","msg":"成功","data":{"id":88828,"hisId":"0100090583","patientName":"鲁军","sex":1,"idType":1,"idNo":"511324198902013818","guarderIdNo":null,"userId":744,"phoneNum":"13682637304","cardNo":null,"balance":0,"seqno":null,"account":true,"auth":false,"hisAuth":false},"startTime":1449649138390,"timeConsum":63026},
        //"/user-web/restapi/account/preCharge":{"success":true,"resultCode":"100","msg":"成功","data":{"feeChannel":2,"data":{"appid":"wxe9062380f1a04582","mch_id":"1279981801","nonceStr":"SU1449727730","notify_url":"http://api.daily.yuantutech.com/user-web/restapi/common/wx/payNotify","partner":"1279981801","paySign":"F2F14AFF8FE9BF724692555C256B1251","prepayId":"wx2015121014085191620928e70158687486","signType":"MD5","timeStamp":"1449727730"},"id":"1422","status":101},"startTime":1449727730931,"timeConsum":438}
        //"/user-web/restapi/common/corp/corpHome":{"success":true,"resultCode":"100","msg":"成功","data":{"tags":["二级甲等"],"logo":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/421fa7760c534fabb4656d97933fb76a.jpg","address":"山东 青岛市 经济技术开发区黄浦江路9号","name":"青岛市开发区第一人民医院","type":2,"funcions":[{"icon":"http://s.yuantutech.com/i4/e8826ae8afe58cdd4ff2b7b428971516-70-66.PNG","subTitle":"线上快捷挂号","title":"预约挂号","isNeedLogin":false,"href":"reg-type.html"},{"icon":"http://s.yuantutech.com/i4/4ac82bfc5f7f5cd1ff98d261c5175c2e-70-66.png","subTitle":"查看预约信息","title":"我的预约","isNeedLogin":true,"href":"my-reservation.html"},{"icon":"http://s.yuantutech.com/i4/517e3f966b9c859fa1fdb65959ea7887-70-66.png","subTitle":"缴纳费用","title":"缴费","isNeedLogin":true,"href":"pay-list.html"},{"icon":"http://s.yuantutech.com/i4/200377519a19c606e4e189daf96cc3ac-70-66.png","subTitle":"查看报告单","title":"报告单","isNeedLogin":true,"href":"report.html"},{"icon":"http://s.yuantutech.com/i4/faa73fd2cbc182f5623a5c555a9e8627-70-66.png","subTitle":"为账户充值","title":"充值","isNeedLogin":true,"href":null},{"icon":"http://s.yuantutech.com/i4/6eb7ec3a1311f6145e336782873f3e5f-70-66.png","subTitle":"医院位置导航","title":"医院导航","isNeedLogin":true,"href":null}],"banners":[{"id":217,"img":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/d16ab3cde15c47de8307ca7182028471.jpg","href":""}]},"startTime":1452562713388,"timeConsum":1},
        "/user-web/restapi/common/corp/corpHome":{"success":true,"resultCode":"100","msg":"\u6210\u529f","data":{"tags":["\u4e8c\u7ea7\u7532\u7b49"],"logo":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/421fa7760c534fabb4656d97933fb76a.jpg","address":"\u5c71\u4e1c \u9752\u5c9b\u5e02 \u7ecf\u6d4e\u6280\u672f\u5f00\u53d1\u533a\u9ec4\u6d66\u6c5f\u8def9\u53f7","name":"\u9752\u5c9b\u5e02\u5f00\u53d1\u533a\u7b2c\u4e00\u4eba\u6c11\u533b\u9662","type":2,"funcions":[{"isNeedLogin": false, "subTitle": "线上快捷挂号", "icon": "http://s.yuantutech.com/i4/dd5af8b9d942023defd8a7d1f0ab506a-69-68.png", "href": "reg-type.html", "title": "预约挂号"}, {"isNeedLogin": true, "subTitle": "查看预约信息", "icon": "http://s.yuantutech.com/i4/be0d2062cf0c2608ed6f0f6490ac1332-69-68.png", "href": "my-reservation.html", "title": "我的预约"}, {"isNeedLogin": true, "subTitle": "所需费用缴纳", "icon": "http://s.yuantutech.com/i4/b0733a602e5e8542b4c6c6d2dde04e04-69-68.png", "href": "pay-list.html", "title": "便捷缴费"}, {"isNeedLogin": true, "subTitle": "相关报告查询", "icon": "http://s.yuantutech.com/i4/85cfa29854f88dc129b43837c1f3689d-69-68.png", "href": "report.html", "title": "检查报告"}, {"isNeedLogin": true, "subTitle": "为支付做准备", "icon": "http://s.yuantutech.com/i4/b2819d0130f5c0a54474bafe2616adef-69-68.png", "href": null, "title": "账户充值"}, {"isNeedLogin": true, "subTitle": "医院位置导航", "icon": "http://s.yuantutech.com/i4/70dc9e3dbf26119eb8bfab088c9a16a2-69-68.png", "href": null, "title": "医院导航"}, {"isNeedLogin": true, "subTitle": "查询每日清单", "icon": "http://s.yuantutech.com/i4/c7a32f452c6f5c46064d93d644947118-69-68.png", "href": "hospitalize/records.html", "title": "住院清单"}] ,"banners":[{"id":217,"img":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/d16ab3cde15c47de8307ca7182028471.jpg","href":""},]},"startTime":1452562713388,"timeConsum":1},
        "/user-web/restapi/ytUsers/message":{"success":true,"resultCode":"100","msg":"成功","data":[
            {"gmtModify":1452678901000,"gmtCreate":1452678899000,"id":2,"corpId":260,"unionId":null,"userId":744,"msgId":null,"pointId":null,"status":1,"newMsg":1,"msgType":1,"title":"挂号测试","body":"您好，您已经。。。","receiveDate":1452678896000},
            {"gmtModify":1452678901000,"gmtCreate":1452678899000,"id":2,"corpId":260,"unionId":null,"userId":744,"msgId":null,"pointId":null,"status":1,"newMsg":1,"msgType":2,"title":"挂号测试","body":"您好，您已经。。。","receiveDate":1452678896000},
            {"gmtModify":1452678901000,"gmtCreate":1452678899000,"id":2,"corpId":260,"unionId":null,"userId":744,"msgId":null,"pointId":null,"status":1,"newMsg":1,"msgType":3,"title":"挂号测试","body":"您好，您已经。。。","receiveDate":1452678896000},
            {"gmtModify":1452678901000,"gmtCreate":1452678899000,"id":2,"corpId":260,"unionId":null,"userId":744,"msgId":null,"pointId":null,"status":1,"newMsg":1,"msgType":4,"title":"挂号测试","body":"您好，您已经。。。","receiveDate":1452678896000},{"gmtModify":1452678901000,"gmtCreate":1452678899000,"id":2,"corpId":260,"unionId":null,"userId":744,"msgId":null,"pointId":null,"status":1,"newMsg":1,"msgType":1,"title":"挂号测试","body":"您好，您已经。。。","receiveDate":1452678896000},{"gmtModify":1452678862000,"gmtCreate":1452678859000,"id":1,"corpId":261,"unionId":null,"userId":744,"msgId":null,"pointId":null,"status":1,"newMsg":1,"msgType":1,"title":"预约测试","body":"您好，您已经预约了青岛市第一人民医院 耳鼻喉科 预约时间2016年1月14日下午,请准时到医院取号.您已经预约了青岛市第一人民医院 耳鼻喉科 预约时间2016年1月14日下午,请准时到医院取号.","receiveDate":1452678857000}],"startTime":1452751960421,"timeConsum":23},
        "/user-web/restapi/common/corpNews/newsInfo": {"success":true,"resultCode":"100","msg":"成功","data":{"classifys":[{"gmtModify":1445853133000,"gmtCreate":1444634998000,"id":1,"name":"栏目","description":"栏目","status":1},{"gmtModify":1445853153000,"gmtCreate":1444635039000,"id":2,"name":"健康","description":"健康","status":1},{"gmtModify":1447300717000,"gmtCreate":1444842616000,"id":3,"name":"养生栏目","description":"养生栏目","status":1},{"gmtModify":1445850570000,"gmtCreate":1445822954000,"id":9,"name":"栏目2","description":"栏目2","status":1},{"gmtModify":1447300723000,"gmtCreate":1445839082000,"id":10,"name":"栏目1","description":"栏目1","status":1},{"gmtModify":1447300720000,"gmtCreate":1445853741000,"id":11,"name":"@","description":"@","status":1}],"introsNews":[{"gmtModify":1446603113000,"gmtCreate":1445918497000,"id":159,"classifyId":2,"hospitalId":null,"unionId":29,"title":"医联体轮播","titleImg":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/a474f3e5d6734474a8f548bf8d10c9c6.jpg","homeUrl":"","newsId":219,"sort":1,"type":2,"status":"2","summary":"医联体轮播摘要"},{"gmtModify":1447041584000,"gmtCreate":1447041440000,"id":189,"classifyId":2,"hospitalId":null,"unionId":29,"title":"世间哪有自由？心中找个自在。","titleImg":null,"homeUrl":"","newsId":310,"sort":1,"type":2,"status":"2","summary":"荷塘已经枯萎，黄叶即将落去。我坐秋风面前，不知与谁相遇"},{"gmtModify":1446198670000,"gmtCreate":1445934834000,"id":160,"classifyId":1,"hospitalId":null,"unionId":29,"title":"杭州医联体广告1","titleImg":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/032fcc4644ca45c78bdecb919158aeb7.jpg","homeUrl":"","newsId":220,"sort":2,"type":1,"status":"2","summary":"杭州医联体广告1"},{"gmtModify":1446621692000,"gmtCreate":1445934899000,"id":161,"classifyId":2,"hospitalId":null,"unionId":29,"title":"杭州医联体广告2","titleImg":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/463e062a9e98485380a0cf1db7191f93.jpg","homeUrl":"www.baidu.com","newsId":221,"sort":2,"type":1,"status":"2","summary":"杭州医联体广告2"},{"gmtModify":1446620849000,"gmtCreate":1446016204000,"id":164,"classifyId":2,"hospitalId":null,"unionId":29,"title":"杭州医联体广告3","titleImg":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/14638c278d7f4935be352b81747afa31.jpg","homeUrl":"","newsId":224,"sort":2,"type":1,"status":"2","summary":"杭州医联体广告3"},{"gmtModify":1451909064000,"gmtCreate":1451908729000,"id":220,"classifyId":1,"hospitalId":null,"unionId":29,"title":"王文媛-儿童保健科","titleImg":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/5be91e5a4bca410f9014d3b3b96d7fea.jpg","homeUrl":"","newsId":342,"sort":2,"type":6,"status":"2","summary":"王文媛，副主任医师，副教授，医学硕士，硕士生导师，青岛市妇女儿童医院儿保科主任。"},{"gmtModify":1451908786000,"gmtCreate":1451908786000,"id":221,"classifyId":1,"hospitalId":null,"unionId":29,"title":"阿爽-皮肤科","titleImg":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/9be0d44ab2664a368474a3e7bcaf3cff.jpg","homeUrl":"","newsId":343,"sort":3,"type":6,"status":"2","summary":"阿爽，副主任医师，毕业后从事儿科工作二十余年，有较丰富的专业知识和临床经验，熟悉儿科常见病，多发病的诊治，尤其擅长各种常见、疑难儿童皮肤病的诊疗。"},{"gmtModify":1451908832000,"gmtCreate":1451908832000,"id":222,"classifyId":1,"hospitalId":null,"unionId":29,"title":"周长虹-心理卫生科","titleImg":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/f800371ef71c47469d29b7c0891ee5fc.jpg","homeUrl":"","newsId":344,"sort":4,"type":6,"status":"2","summary":"周长虹，女，副主任医师，医学硕士，心理治疗师，主要培训背景为沙盘治疗、创伤治疗、叙事治疗、催眠治疗、精神动力学治疗等，主要从事儿童多动症、抽动症、孤独症、学习困难、情绪问题等心理行为问题的咨询与治疗。"},{"gmtModify":1447378230000,"gmtCreate":1447378230000,"id":204,"classifyId":1,"hospitalId":null,"unionId":29,"title":"sdfghjkl","titleImg":null,"homeUrl":"","newsId":327,"sort":6,"type":3,"status":"2","summary":"ertyukl"},{"gmtModify":1451908892000,"gmtCreate":1451908892000,"id":223,"classifyId":1,"hospitalId":null,"unionId":29,"title":"申彩霞","titleImg":"http://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/30564f926d384621a27a24fe2ad8f3b8.jpg","homeUrl":"","newsId":345,"sort":6,"type":6,"status":"2","summary":"申彩霞，主任医师，教授，产科副主任，青岛市卫生局专业技术拔尖人才，擅长围产医学，高危妊娠，产科疑难重症的诊治，产科复杂手术，产科内分泌疾病，尤其妊娠合并糖尿病等的诊治，妊娠合并症及并发症的诊断处理，围产期感染性疾病，遗传咨询优生优育咨询。"},{"gmtModify":1448079642000,"gmtCreate":1448012611000,"id":206,"classifyId":1,"hospitalId":null,"unionId":29,"title":"热门医生","titleImg":null,"homeUrl":"","newsId":328,"sort":7,"type":6,"status":"2","summary":"热门医生"},{"gmtModify":1448251463000,"gmtCreate":1448251463000,"id":210,"classifyId":1,"hospitalId":null,"unionId":29,"title":"标题信息","titleImg":null,"homeUrl":"","newsId":332,"sort":8,"type":6,"status":"2","summary":"文章摘要"},{"gmtModify":1448251508000,"gmtCreate":1448251508000,"id":211,"classifyId":1,"hospitalId":null,"unionId":29,"title":"信息标题","titleImg":null,"homeUrl":"","newsId":333,"sort":9,"type":5,"status":"2","summary":"文章摘要\r\n"}]},"startTime":1451984016573,"timeConsum":90},
        //"/user-web/restapi/inhos/patientinfo":{"success":true, "resultCode":"100", "msg":"成功", "data":{"name":"何八七", "sex":"男", "birthday":"2012-12-03T00:00:00", "idNo":"441723199105280018", "cardNo":null, "guardianNo":"", "address":"广东省阳东县东城镇金村村委会学仕村七巷14号", "phone":"18057102018", "patientType":"07", "accountNo":"1628824", "items.":[] } }
        "/user-web/restapi/inhos/patientinfo":{"success":true, "resultCode":"100", "msg":"成功", "data":{"name":"何八七", "sex":"男", "birthday":"2012-12-03T00:00:00", "idNo":"441723199105280018", "cardNo":null, "guardianNo":"", "address":"广东省阳东县东城镇金村村委会学仕村七巷14号", "phone":"18057102018", "patientType":"07", "accountNo":"1628824", "items":[{"corpId":549, "corpName":"广州番禺中心医院", "status":"在院", "createDate":"2016-01-20", "hosNo":"1628824", "area":"ICU", "bedNo":"12-4", "deptName":null, "visitId":"1", "accBalance":"0", "cost":321000}, {"corpId":549, "corpName":"广州番禺中心医院", "status":"在院", "createDate":"2016-01-10", "hosNo":"1628824", "area":"ICU", "bedNo":"12-4", "deptName":null, "visitId":"1", "accBalance":"0", "cost":300000} ] } },
        "/user-web/restapi/inhos/inhosbilllist":{"success":true, "resultCode":"100", "msg":"成功", "data": {"corpId":549, "corpName":"广州番禺中心医院", "patientId":503, "patientName":"何八七", "items": [{"tradeTime":"2016-01-22", "cost":"0"}, {"tradeTime":"2016-01-23", "cost":"1111111111100"}, {"tradeTime":"2016-01-24", "cost":"6"} ] }, "startTime":1453691874994, "timeConsum":23663 },
        "/user-web/restapi/inhos/inhosbilldetail":{"success":true, "resultCode":"100", "msg":"成功", "data": {"date":"2016-01-22", "dailyCost":66980, "items": [{"tradeTime":"2016-01-22", "productCode":null, "itemNo":"8102008", "itemName":"住院诊查费", "itemSpecs":"日", "itemLiquid":null, "itemUnits":"日", "itemQty":"0", "itemPrice":300, "cost":300, "visitId":"0"}, {"tradeTime":"2016-01-22", "productCode":null, "itemNo":"8102008", "itemName":"住院诊查费", "itemSpecs":"日", "itemLiquid":null, "itemUnits":"日", "itemQty":"0", "itemPrice":300, "cost":300, "visitId":"0"}, {"tradeTime":"2016-01-22", "productCode":null, "itemNo":"8124011", "itemName":"静脉输液(连续输液第二组起每组收)", "itemSpecs":"组", "itemLiquid":null, "itemUnits":"组", "itemQty":"0", "itemPrice":100, "cost":100, "visitId":"0"} ] } },
        "/user-web/restapi/common/ytUsers/reg":{"success":true},
        "/user-web/restapi/common/reservation/departmentlist2":{"success":true,"resultCode":"100","msg":"成功","data":{
                corp:{
                   scheduleRule:1
                },
                list:[{"deptCode":"5019","deptName":"下肢缺血性疾病专科","deptPY":"xiazhiquexuexingjibingzhuanke","deptSimplePY":"xzqxxjbzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5018","deptName":"下肢静脉曲张专科","deptPY":"xiazhijingmaiquzhangzhuanke","deptSimplePY":"xzjmqzzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5021","deptName":"营养专科","deptPY":"yingyangzhuanke","deptSimplePY":"yyzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"4009","deptName":"内分泌专病门诊","deptPY":"neifenmizhuanbingmenzhen","deptSimplePY":"nfmzbmz","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"4029","deptName":"血管栓塞疾病专病门诊","deptPY":"xueguanshuansaijibingzhuanbingmenzhen","deptSimplePY":"xgssjbzbmz","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1001","deptName":"门诊内科","deptPY":"menzhenneike","deptSimplePY":"mznk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5002","deptName":"心血管内科专科","deptPY":"xinxueguanneikezhuanke","deptSimplePY":"xxgnkzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1002","deptName":"门诊外科","deptPY":"menzhenwaike","deptSimplePY":"mzwk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5119","deptName":"创伤骨科难愈伤口专科","deptPY":"chuangshanggukenanyushangkouzhuanke","deptSimplePY":"csgknyskzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"4008","deptName":"创伤骨科难愈伤口专病","deptPY":"chuangshanggukenanyushangkouzhuanbing","deptSimplePY":"csgknyskzb","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5124","deptName":"骨关节骨质疏松专科","deptPY":"guguanjieguzhishusongzhuanke","deptSimplePY":"ggjgzsszk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1003","deptName":"门诊骨科","deptPY":"menzhenguke","deptSimplePY":"mzgk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5314","deptName":"不孕症专科","deptPY":"buyunzhengzhuanke","deptSimplePY":"byzzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5313","deptName":"妇科肿瘤专科","deptPY":"fukezhongliuzhuanke","deptSimplePY":"fkzlzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5306","deptName":"计划生育专科","deptPY":"jihuashengyuzhuanke","deptSimplePY":"jhsyzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1004","deptName":"门诊妇科","deptPY":"menzhenfuke","deptSimplePY":"mzfk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5303","deptName":"宫颈病变专科","deptPY":"gongjingbingbianzhuanke","deptSimplePY":"gjbbzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5318","deptName":"妇产科盆底康复专科","deptPY":"fuchankependikangfuzhuanke","deptSimplePY":"fckpdkfzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1005","deptName":"门诊产科","deptPY":"menzhenchanke","deptSimplePY":"mzck","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5204","deptName":"新生儿保健专科","deptPY":"xinshengerbaojianzhuanke","deptSimplePY":"xsebjzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1006","deptName":"门诊儿科","deptPY":"menzhenerke","deptSimplePY":"mzek","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1007","deptName":"门诊眼科","deptPY":"menzhenyanke","deptSimplePY":"mzyk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5420","deptName":"嗓音及反流性咽喉疾病","deptPY":"sangyinjifanliuxingyanhoujibing","deptSimplePY":"syjflxyhjb","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1008","deptName":"门诊耳鼻喉科","deptPY":"menzhenerbihouke","deptSimplePY":"mzebhk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"4081","deptName":"牙周疾病专病门诊","deptPY":"yazhoujibingzhuanbingmenzhen","deptSimplePY":"yzjbzbmz","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1009","deptName":"门诊口腔科","deptPY":"menzhenkouqiangke","deptSimplePY":"mzkqk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5461","deptName":"口腔、颌面颈外科专科","deptPY":"kouqiang、hemianjingwaikezhuanke","deptSimplePY":"kq、hmjwkzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"5601","deptName":"过敏性皮肤病专科","deptPY":"guominxingpifubingzhuanke","deptSimplePY":"gmxpfbzk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1010","deptName":"门诊皮肤科","deptPY":"menzhenpifuke","deptSimplePY":"mzpfk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1012","deptName":"门诊肿瘤科","deptPY":"menzhenzhongliuke","deptSimplePY":"mzzlk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1013","deptName":"门诊康复科","deptPY":"menzhenkangfuke","deptSimplePY":"mzkfk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1011","deptName":"门诊中医","deptPY":"menzhenzhongyi","deptSimplePY":"mzzy","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1014","deptName":"高压氧科","deptPY":"gaoyayangke","deptSimplePY":"gyyk","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"1017","deptName":"心理精神科门诊","deptPY":"xinlijingshenkemenzhen","deptSimplePY":"xljskmz","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null},{"deptCode":"99980","deptName":"测试诊元","deptPY":"ceshizhenyuan","deptSimplePY":"cszy","parentDeptCode":"-1","parentDeptName":"","parentDeptPY":null,"parentDeptSimplePY":null}]
            }
            ,"startTime":1461045664472,"timeConsum":2007},
        "/user-web/restapi/common/reservation/doctlist":{"success":true,"resultCode":"100","msg":"成功","data":[
                {
                    "corpId": 261,
                    "corpName": "青岛市妇女儿童医院",
                    "logo": null,
                    "doctCode": "001201",
                    "doctName": "俞冬熠",
                    "deptCode": "0224",
                    "deptName": "遗传科门诊",
                    "parentDeptCode": null,
                    "parentDeptName": null,
                    "doctTech": null,
                    "doctProfe": null,
                    "doctSpec": null,
                    "doctIntro": null,
                    "hosRegType": null
                },
                {
                    "corpId": 261,
                    "corpName": "青岛市妇女儿童医院",
                    "logo": null,
                    "doctCode": "001201",
                    "doctName": "俞冬熠",
                    "deptCode": "0224",
                    "deptName": "遗传科门诊",
                    "parentDeptCode": null,
                    "parentDeptName": null,
                    "doctTech": null,
                    "doctProfe": null,
                    "doctSpec": null,
                    "doctIntro": null,
                    "hosRegType": null
                },
                {
                    "corpId": 261,
                    "corpName": "青岛市妇女儿童医院",
                    "logo": null,
                    "doctCode": "001201",
                    "doctName": "俞冬熠",
                    "deptCode": "0224",
                    "deptName": "遗传科门诊",
                    "parentDeptCode": null,
                    "parentDeptName": null,
                    "doctTech": null,
                    "doctProfe": null,
                    "doctSpec": null,
                    "doctIntro": null,
                    "hosRegType": null
                }
        ],"startTime":1461130081418,"timeConsum":963},
        "/videoAttend/user/showAttendStatus":{
                "success": true,
                "msg": "成功",  
                "data":{
                    "doctCode":"01223",     //医生code
                    "doctName":"鲁军",     //医生名字
                    "deptCode":"0123",     //科室code
                    "deptName":"妇产科",     //科室名字
                    "hospitalCode":"261", //医院code
                    "hospitalName":"青岛妇女儿童医院", //医院名字
                    "appoNo":"1",  //挂号序号，号源   
                    "appoDate":"2016-12-12" ,   //预约日期
                    "awaitPersonNum":"3", //当前等待人数
                    "period":"13:40-14:00",       //预约时段 13:40-14:00,
                    "apiKey":"",
                    "roomId":""
                }
            }
    };
    module.exports = {
        get: function(path, param, callback, errorCallback) {
            var data = mockData[path];

            if (data && (data.success == "true" || data.success == true)) {
                // setTimeout(function(){
                callback(data);
                // }, 5000)
            } else if (data && data.success == "false") {
                errorCallback(data)
            } else {
                io.get(path, param, callback, errorCallback, {dataType:"json"});
            }
        },
        getCache:function(path, param, callback, errorCallback) {
            var data = mockData[path];

            if (data && (data.success == "true" || data.success == true)) {
                // setTimeout(function(){
                callback(data);
                // }, 5000)
            } else if (data && data.success == "false") {
                errorCallback(data)
            } else {
                io.get(path, param, callback, errorCallback, {dataType:"json"});
            }
        }
    }




});