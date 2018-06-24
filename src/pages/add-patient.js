define("pages/add-patient", function (require, exports, module) {

  var PageModule = require("component/PageModule");
  var PatientCardModule = require("pages/patient-card");

  //表单验证逻辑
  var formModule = PageModule.render({

    init: function () {
      this.regEvent();
    },
    regEvent: function () {
      var self = this;
      var idType = $('#idType').val();
      self.render({idType: idType})
      $('#idType').change(function () {
        self.render({idType: $(this).val()});
      });
      $('#J_Default').click(function () {
        var checked = this.checked;
        // console.log(checked)
        if (checked) {
          self.util.dialog("是否将此人设为默认就诊人？", function (okay) {
            if (okay) {
              if (formModule.checkData()) {
                var data = formModule.getData();
                if (data.id) {
                  self.util.waitAlert("请稍等...");
                  self.get("/user-web/restapi/patient/update", data);
                }
              }
            } else {
              $('#J_Default')[0].checked = !checked;
            }
          })
        }
        else {
          self.util.dialog("不再将此人设为默认就诊人？", function (okay) {
            if (okay) {
              if (formModule.checkData()) {
                var data = formModule.getData();
                // self.submitData = data;

                if (data.id) {
                  self.util.waitAlert("请稍等...");
                  self.get("/user-web/restapi/patient/update", data);
                }
              }
            } else {
              $('#J_Default')[0].checked = !checked;
            }
          })
        }
      });
      // $('#J_Children').change(function () {
      //  self.render({hasId:$(this)[0].checked})
      // });
    },
    onError: function (result) {
      $('#J_Default')[0].checked = !($('#J_Default')[0].checked);
      $('#J_Page').removeClass("wait");
      this.errorHandle(result);
    },
    onSuccess: function (result) {
      if (result) {
        this.cache.set("needDefault", true);
        this.util.alert("操作成功")
      }
    },
    setData: function (data) {
      //...
      // $('#patientId').val( data.patientId );
      this.id = data.id;
      if (data.guarderIdNo) {
        data.idType = 2;
      } else {
        data.idType = 1;
      }
      this.render(data);

      $('#patientName').val(data.patientName);
      // $('#sex').val(data.sex);
      $('#idType').val(data.idType);
      $('#idNo').val(data.idNo);
      $('#J_Default')[0].checked = data.default;

      if (data.id) {
        //修改模式
        // $('#idNo').attr("disabled", "disabled");
      } else {
        //添加就诊人的时候  默认填入

      }
      $('#J_Phone').val(data.phoneNum);
      $('#guarderIdNo').val(data.guarderIdNo);
      if (data.birthday) {
        var year = this.util.dateFormat(data.birthday, "yyyy"),
          month = this.util.dateFormat(data.birthday, "MM"),
          day = this.util.dateFormat(data.birthday, "dd");
        document.getElementById("J_Year").value = year;
        document.getElementById("J_Month").value = month;
        document.getElementById("J_Day").value = day;
      }
      if (data.sex) {
        document.getElementById("J_Sex").value = data.sex;
      }
      // if(data.idNo){
      // 	$('#J_Children')[0].checked = true;
      // }else {
      //  $('#J_Children')[0].checked = false;
      // }
      this.render(data);
    },
    getData: function () {
      var idType = $('#idType').val()
      var birthday = $('#J_Year').val() + "-" + $('#J_Month').val() + "-" + $('#J_Day').val();
      // var registerData = this.cache.getCacheModule();
      // var corpId = registerData.get("corpId").value;
      // console.log("111=====>",this.query.corpId,corpId)
      return {
        corpId: this.query.corpId == "undefined" ? null : this.query.corpId,
        unionId: this.query.unionId == "undefined" ? null : this.query.unionId,
        id: this.id,//$('#patientId').val(),
        patientName: $('#patientName').val(),
        idType: idType,//,
        idNo: $('#idNo').val(),
        guarderIdNo: idType == 2 ? $('#guarderIdNo').val() : null,
        phoneNum: $.trim($('#J_Phone').val()),
        isDefault: $("#J_Default")[0].checked,
        sex: idType == 2 ? $('#J_Sex').val() : null,
        birthday: idType == 2 ? birthday : null
      }
    },
    render: function (data) {
      // console.log(data.idType, data.guarderIdNo)
      // alert(data.idType);
      if (data.idType) {
        if (data.idType == 1) {
          $('#J_GuarderIdNoInput').hide();
          $('#children').hide();
          $('#sex,#J_Date').hide();
          $('#J_idNo').show();
          $('#J_BindCardTip').find('ul').remove();
          $('#J_BindCardTip').append('<ul><li>1. 就诊人姓名、身份证号将用于医院建档信息匹配，请输入正确的就诊人姓名和身份证号；</li>' +
            '<li>2.添加就诊人后预约，取号时需使用与此处填写的就诊人身份证号和姓名相匹配的就诊卡，否则无法取号；</li>' +
            '<li>3.无身份证儿童请选择“儿童”类型添加就诊人。</li></ul>');
        }
        if (data.idType == 2) {
          $('#J_GuarderIdNoInput').show();
          $('#children').show();
          // if (!$('#J_Children')[0].checked){
          $('#sex,#J_Date').show();
          $('#J_idNo').show();
          // }
          $('#J_BindCardTip').find('ul').remove();
          $('#J_BindCardTip').append('<ul><li>1. 如果儿童已办理身份证，请选择“成人”类型添加就诊人，并在线下办卡时，凭借儿童本人身份证办理就诊卡；</li>' +
            '<li>2.添加“儿童”类型就诊人需另外提供监护人身份信息。</li>' +
            '<li>3.添加儿童就诊人后预约，取号时需使用此处填写的监护人身份证号和儿童姓名相匹配的就诊卡取号，否则无法取号；</li></ul>');
        }
      } else {
        if (data.hasId) {
          $('#sex,#J_Date').hide();
          $('#J_idNo').show();
        } else {
          $('#sex,#J_Date').show();
          $('#J_idNo').hide();
        }
      }
    },
    checkData: function () {
      var data = this.getData();
      // var type = $('#J_Children')[0].checked;
      // console.log( data )
      //\u00b7 姓名中间的 ·
      //|| (!/^[a-zA-Z\u4e00-\u9fa5]+$/.test(data.patientName))
      // 中文姓名中支持两种 点  英文的点（\u00b7） 中文的点（\u2022）下点(\u002e)
      // alert(data.patientName)
      // var patientName = data.patientName.replace("•", "").replace("·","");
      // alert(patientName)
      if (!(data.patientName.length > 1) || (!/^[a-zA-Z\u4e00-\u9fa5•·.]+$/.test(data.patientName))) {
        this.util.alert("请正确填写患者姓名");
        return false;
      }

      if (!data.phoneNum || !/^\d{11}$/.test(data.phoneNum)) {
        this.util.alert("请正确填写手机号码");
        return false;
      }

      if (!(/^\d{17}[\d\x]?/.test(data.idNo)) && data.idType == "1") {
        this.util.alert("请正确填写身份证号码");
        return false;
      }

      if (data.idType == 2 && (!/^\d{4}-\d{2}-\d{2}$/.test(data.birthday))) {
        this.util.alert("请正确填写儿童出生日期");
        return false;
      }
      // console.log(/^\d{17}[\d\x]?/.test(data.guarderIdNo))
      if (data.idType == "2") { //&& data.guarderIdNo != ""
        if (!/^\d{17}[\d\x]?/.test(data.guarderIdNo)) {
          this.util.alert("请正确填写监护人身份证号码");
          return false;
        }
      }

      return true;
    }
  });

  //根据unionid或者corpId判断是否要绑卡
  var isNeedCard = PageModule.render({
    init: function () {
      this.unionId = this.query.unionId;
      this.corpId = this.query.corpId;
      if (this.unionId != "undefined") {
        this.util.waitAlert("加载中...");
        this.get("/user-web/restapi/card/isNeedCardByUnionId", {
          unionId: this.unionId,
        });
      } else if (this.corpId != "undefined") {
        this.util.waitAlert("加载中...");
        this.get("/user-web/restapi/card/isNeedCardByCorpId", {
          corpId: this.corpId,
        });
      }


    },
    onSuccess: function (result) {

      this.status = result.data;
    },
    getData: function () {
      return this.status;
    }
  });

  //根据unionid或者corpId,和patientId是否有卡
  var cardList = PageModule.render({
    init: function () {
      this.unionId = this.query.unionId;
      this.corpId = this.query.corpId;
      this.id = this.query.id;
      this.status = false;
      if (this.id) {
        this.util.waitAlert("加载中...");
        this.get("/user-web/restapi/card/list", {
          unionId: this.unionId,
          corpId: this.corpId,
          patientId: this.id
        });
      }
    },
    onSuccess: function (result) {
      if (result.data && result.data.cardNo) {
        this.status = true;
      }
    },
    onError: function () {
      return false;
    },
    getStatus: function () {
      return this.status;
    }
  });
  //editModule
  var editModule = PageModule.render({
    init: function () {
      this.id = this.query.id;
      this.util.waitAlert("正在获取患者信息...");
      this.get("/user-web/restapi/patient/getbaseinfo", {
        corpId: this.query.corpId || this.corpId, //可不传
        patientId: this.id
      });

    },
	  regEvent: function () {
		  document.getElementById("idNo").setAttribute("readOnly",true);
		  document.getElementById("patientName").setAttribute("readOnly",true);
		  document.getElementById("idType").setAttribute("disabled",true);
		  document.getElementById("guarderIdNo").setAttribute("readOnly",true);
	  },
    onSuccess: function (result) {
      if (result.success == true) {
        formModule.setData(result.data);
	      this.regEvent()
        // 没有经过认证的就诊人可以删除
        if (result.data && result.data.auth == false) {
          deleteModule.init(this.query.id);
        }
      }
    }
  });

  //submitModule

  var pageModule = PageModule.render({
    init: function () {
      //查看该医院是否要绑卡
      isNeedCard.init();
      cardList.init();
      //修改
      if (this.query.id) {
        //修改就诊人
        editModule.init();

        //查看就诊人是否已经绑定就诊卡
        PatientCardModule.init(this.query.unionId, this.query.id);
      } else {

        //添加就诊人 默认填入当前登录用户的手机号码
        this.io.get("/user-web/restapi/ytUsers/getUserInfo", {}, function (result) {
          if (result && result.data && result.data.phoneNum) {
            $('#J_Phone').val(result.data.phoneNum)
          }
        });

        $('#J_BindCardTip').removeClass("hide")

      }
      this.regEvent();
      formModule.init();
    },
    regEvent: function () {

      var self = this;
      $('#J_SubmintBtn').click(function () {
        // result.data && result.data.cardType && result.data.isTiedCard
        if (formModule.checkData()) {
          var data = formModule.getData();
          // self.submitData = data;
          self.util.waitAlert("请稍等...");
          if (data.id) {
            self.get("/user-web/restapi/patient/update", data);
          } else {
            self.get("/user-web/restapi/patient/add", data);
          }
        }

      });
      var now = new Date();
      var year = "";
      for (var i = 0; i < 18; i++) {
        year += "<option value='" + (parseInt(now.getFullYear()) - i) + "'>" + (parseInt(now.getFullYear()) - i) + "</option>"
      }
      $('#J_Year').append(year)
      var month = ""
      for (var i = 1; i < 13; i++) {
        if (i < 10) {
          i = "0" + i;
        }
        month += "<option value='" + i + "'>" + i + "</option>"
      }
      $('#J_Month').append(month);
      var day = "";
      for (var i = 1; i < 32; i++) {
        if (i < 10) {
          i = "0" + i;
        }
        day += "<option value='" + i + "'>" + i + "</option>"
      }
      $('#J_Day').append(day);
      $('#J_Month').change(function () {
        $('#J_Day').empty();
        var d = new Date($('#J_Year').val(), $(this).val(), 0);
        var day = "";
        for (var i = 1; i <= d.getDate(); i++) {
          if (i < 10) {
            i = "0" + i;
          }
          day += "<option value='" + i + "'>" + i + "</option>"
        }
        $('#J_Day').append(day);
      });
    },
    onSuccess: function (result) {
      // console.log( this.query.unionId )
      // alert(2)
      var tip = this.query.id ? '修改' : '添加';
      var tips = tip + '就诊人成功';
      var context = tip + '<span>就诊人成功，是否立即绑定就诊卡</span>' + '</br>' + "<span style='font-size: 12px;color: rgba(31, 29, 29, 0.95);'>绑定就诊卡可以方便各项医院内服务</span>";
      var self = this;
      if (result.data && !isNeedCard.getData().need) {
        this.util.alert(tips, function () {
          self.util.goBack(true);
        });
      } else if (result.data && !cardList.getStatus()) {
        var href = "bind-card.html?cardType=" + isNeedCard.getData().cardType + "&description=" + isNeedCard.getData().description + "&target=_blank" + "&patientId=" + result.data;
        if (self.query.unionId != "undefined") {
          href = href + "&unionId=" + self.query.unionId
        }
        if (self.query.corpId != "undefined") {
          href = href + "&corpId=" + self.query.corpId
        }
        self.util.dialog(context, function (okay) {
          if (okay) {
            self.util.goBack(true);
          } else {
            location.href = href
          }
        }, {
          cancel: true,
          cancelText: "绑定就诊卡",
          ok: true,
          okText: "暂不绑卡"
        });
        // PatientCardModule.init(this.query.unionId, result.data,true,context);
      }
    }
  });

  //删除就诊人
  var deleteModule = PageModule.render({
    init: function (id) {
      var self = this;
      //this.id = id;

      $('#J_DeleteBtn').removeClass("hide").click(function () {

        self.util.dialog("删除就诊人后，所有医疗服务数据也一并删除，确认要删除吗？", function (okay) {
          if (okay) {
            self.deletePatient(id);
          }
        })

      });
    },
    deletePatient: function (id) {
      this.util.waitAlert("请求中...");
      this.get("/user-web/restapi/patient/del", {patientId: id});
      //从本地缓存中删除就诊人
      var cache = this.cache.getCacheModule();
      var patient = cache.get("patient");
      if (patient && patient.value == id) {
        cache.remove("patient");
      }

    },
    onSuccess: function () {
      var self = this;
      this.util.alert("删除成功", function () {
        self.util.goBack(true);
      });
    }
  });

  pageModule.init();

  module.exports = pageModule;

});
