define("pages/address/add-address",function(require, exports, module){

  var PageModule = require("component/PageModule");
  var PatientCardModule = require("pages/patient-card");


  //submitModule

  var pageModule = PageModule.render({
    init:function(){

        var id = this.query.id;
        this.id = id;
        if(this.id){
          //添加就诊人 默认填入当前登录用户的手机号码
          this.get("/user-web/restapi/video/getAddress", {id:id})
        }else{
          this.onSuccess({data:{
            id:"",
            recipient:"",
            phone:"",
            postcode:"",
            address:"",
            def:0
          }})
        }

    },
    regEvent:function(){

      var self = this;
      $('#J_SubmintBtn').click(function(){
          var data = self.getData();
          if(self.checkedData(data)){
            addAndEditModule.init(data)
          }
      });

      $('#J_DeleteBtn').click(function(){
        self.util.dialog("您确定要删除地址吗？", function(okay){
          if(okay){
            deleteModule.deletePatient( self.id )
          }
        })
      });

      $('#J_Page').delegate("#J_Def","click", function(){
          // $(this).attr("checked");
          if(self.checkedData()){
            updateDefAddress.init( self.getData() )
          }
      })
    },
    getData:function(){
      return {
        id:$("#J_Id").val(),
        recipient:$.trim($('#J_Name').val()),
        phone:$.trim($('#J_Phone').val()),
        postcode:$.trim($('#J_Code').val()),
        address:$.trim($('#J_Address').val()),
        def:$('#J_Def').attr("checked") ? 1 : 0
      }
    },
    checkedData:function(data){
      var data = data || this.getData();

      if(!(data.recipient.length > 1)){
        this.util.alert("请填写收件人名字");
        return false;
      }

      if(!data.phone || !/^\d{11}$/.test(data.phone)){
        this.util.alert("请正确填写手机号码");
        return false;
      }


      if(!(/^\d{6}[\d\x]?/.test(data.postcode))){
        this.util.alert("请填写6位数邮编");
        return false;
      }

      if(!(data.address && data.address.length > 3)){
        this.util.alert("请填写具体地址");
        return false;
      }

      return true;
    
    },
    onSuccess:function( result ){

      $('#J_Page').removeClass("wait");
      $('#J_Page').html( this.render(result.data) )

      this.regEvent();
    },
    render:function(data){
        return `
          <div class="ui-form">
              <div class="ui-form-item ui-form-item-show  ui-border-b">
                <label for="patientName">收件人:</label>
                <input type="hidden" id="J_Id" value="${data.id}" >
                <input type="text" id="J_Name" value="${data.recipient}" maxlength="20" placeholder="收件人姓名" />
              </div>
              <div class="ui-form-item ui-form-item-show ui-border-b">
                <label for="idNo">手机号码:</label>
                <input type="number"  id="J_Phone" value="${data.phone}" maxlength="11"  placeholder="收件人手机号码" />
              </div>
              <div class="ui-form-item ui-form-item-show ui-border-b">
                <label for="idNo">邮编:</label>
                <input type="text" id="J_Code" maxlength="6" value="${data.postcode||""}"  placeholder="请输入地区邮编" />
              </div>
              <div class="ui-form-item ui-form-item-textarea ui-border-b">
                    <label>详细地址</label>
                    <textarea placeholder="街道等详细地址" id="J_Address" maxlength="300">${data.address}</textarea>
                </div>
            </div>
            <div class="ui-form ui-border-t">
                <div class="ui-form-item ui-form-item-switch ui-border-b">
                    <p>设为默认</p>
                    <label class="ui-switch">
                        <input type="checkbox" id="J_Def" ${data.def == 1 ? `checked="checked"` : ""} />
                    </label>
                </div>
            </div>
            <div class="y-footer-placehold"><div>
            <div class="y-ui-footer y-ui-flex">
                ${
                  data.id ? `<button class="y-ui-btn danger" id="J_DeleteBtn">删除</button>` : ``
                }
                <button class="y-ui-btn" id="J_SubmintBtn">
                    确定提交
                </button>
            </div>
        </div>
      `
    }
  });

  var updateDefAddress = PageModule.render({
    init:function(data){
      this.data = data
      if(data.id){
        this.util.waitAlert("请稍等...");
        this.get("/user-web/restapi/video/updateAddress", data);
      }
    },
    onSuccess(){
      this.util.alert("操作成功");
    }
  })

  var addAndEditModule = PageModule.render({
    init:function(data){
      this.data = data
      this.util.waitAlert("请稍等...");
      if( data.id ){
        this.get("/user-web/restapi/video/updateAddress", data);
      }else{
        this.get("/user-web/restapi/video/addNewAddress", data);
      }
    },
    onSuccess(){

      var tip = this.data.id ? "更新地址成功" : "添加地址成功";
      var self = this;
      this.util.alert( tip, function(){
        self.util.goBack(true);
      });
    }

  });


  //删除就诊人
  var deleteModule = PageModule.render({
    deletePatient:function( id ){
      this.util.waitAlert("请求中...");
      this.get("/user-web/restapi/video/delAddress", {id:id});
    },
    onSuccess:function(){
      var self = this;
      this.util.alert("删除成功", function(){
        self.util.goBack(true);
      });
    }
  });

  pageModule.init();

  module.exports = pageModule;



});
