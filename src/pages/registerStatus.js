define('pages/registerStatus', function (require, exports, module) {

  //预约订单状态
  let REGISTER_STATUS_TEXT = {
    "1_100": "待确认",
    "1_200": "预约成功",
    "1_201": "预约成功",//-已取号
    "1_202": "完成就诊",
    "1_301": "已取消",//退款中...
    "1_302": "已取消",//退款成功，预约失败
    "1_400": "已取消",
    "1_401": "已取消",
    "1_404": "已取消",
    "1_605": "已取消",//医院手动退费成功
    "1_606": "已取消",//医院手动退费失败,
    "1_700": "已停诊",
    "2_100": "待确认",
    "2_200": "挂号成功",
    "2_201": "挂号成功",
    "2_202": "完成就诊",
    "2_301": "已取消",//退款中...
    "2_302": "已取消",//退款成功，挂号失败
    "2_400": "已取消",
    "2_401": "已取消",
    "2_404": "已取消",
    "2_605": "已取消",//医院手动退费成功
    "2_606": "已取消",//医院手动退费失败
  };

  module.exports = {
    REGISTER_STATUS_TEXT: REGISTER_STATUS_TEXT,
    getRegisterStatusText: function (status, regMode, statusDes) {
      return REGISTER_STATUS_TEXT[regMode + "_" + status] || statusDes || status;
    }
  }


});


