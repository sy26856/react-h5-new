"use strict";

import './feedback.less'
import React from 'react'
import util from './lib/util'
import Ticket from './module/Ticket'
import UserCenter from './module/UserCenter'
import Alert from './component/alert/alert'
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index'
import {callPhotoUpload} from './lib/hybridAPI'

//我的账单
export default class Feedback extends SmartNoBlockComponent {
  constructor(props) {
    super(props);

    this.pageSize = 50;
    this.pageNum = 1;
    const query = util.query();
    this.id = query.id || '';
    this.unionId = query.unionId || '';

    this.state = {
      allowReply: true,
      pics: []
    };
  }

  // timer = null;
  async componentDidMount() {
    let productResult = null;
    let groups = null;
    try {
      var userInfo = await Ticket.getUserInfo().fetch();
      productResult = await Ticket.getIssueProductList(this.unionId).fetch();
      groups = productResult.data.groups.filter(item => item.groupName == '业务咨询');

      if (userInfo.code == 100) {
        util.goLogin()
      }
    } catch (e) {
      Alert.show(e.msg || "获取用户信息失败");

      setTimeout(() => {
        if (e.msg === '未登录') {
          util.goLogin()
        }
      }, 1000)

      return
    }

    this.setState({
      phoneNum: userInfo.data.phoneNum,
      productList: (groups && groups[0]) ? groups[0].products : [],
      loading: false,
      success: true,
    })

    /*Ticket.getProductList(this.pageSize, this.pageNum, this.unionId)
      .subscribe(this) //自动处理load状态
      .fetch();*/
    // window.addEventListener('scroll', this.handleScroll)
  }

  /*onSuccess(result) {
    let data = result.data;
    let appProductsId = []
    data.groups.forEach((item) => {
      if (item.groupName == "业务咨询") {
        item.products.forEach((n) => {
          if (n.productName == '慧医APP') {
            appProductsId = n.productId
          }
        })
      }
    })
    this.setState(
      {
        loading: false,
        success: true,
        appProductsId: appProductsId
      }
    )
  }*/

  selectChange() {

  }

  async createTicket() {
    let contact = this.refs.contact.value
    let type = this.refs.type.value.split("@")[0]
    let content = this.refs.content.value
    //let appProductsId = this.state.appProductsId
    let appProductsId = this.refs.type.value.split("@")[1]
    let enclosuer = this.state.pics.join(',')

    const {allowReply, productList} = this.state;

    if (this.id) {
      appProductsId = productList.filter(item => item.productName == '爽约申诉')[0].productId;
    }

    if (type == 'default') {
      Alert.show(this.id ? "请选择未按指定时间取号就诊原因" : "请选择问题类型", 1000);
      return;
    }
    if (!content || !(content.replace(/\s/g, ""))) {
      Alert.show("请填写反馈建议", 1000);
      return;
    }
    if (!contact) {
      Alert.show("请填写联系方式", 1000);
      return;
    }

    if (allowReply) {
      try {
        let quesId = `${type}`
        if (this.id) {
          quesId = "爽约记录申诉";
          quesId += `@申诉Id: ${this.id}@申诉原因: ${type}`
        }
        this.setState({
          allowReply: false
        });
        var createTickte = await Ticket.createTicket(appProductsId, content, contact, quesId, enclosuer, this.id).fetch();
        this.id && await UserCenter.updateApplyBreakAppointmentStatus(this.id).fetch();
      } catch (e) {
        Alert.show(e.msg || "提交工单失败");
        this.setState({
          allowReply: true
        });
      }

      if (createTickte.success) {
        Alert.show("反馈提交成功，感谢您对我们的支持", 1000);
        setTimeout(() => {
          window.location.href = './feedback-query.html?unionId=' + this.unionId;
        }, 1000);
      } else {
        Alert.show(createTickte.msg || "提交工单失败", 1000);
      }
    }

  }


  async selectPicture(e) {
    if (this.state.pics.length > 2) {
      Alert.show('最大只能上传三张图片', 1000)
      return
    }
    if (util.isInYuantuApp()) {
      let result = await callPhotoUpload()
      // alert(JSON.stringify(result))
      if (result.ret === 'SUCCESS') {
        let uploadData = JSON.parse(result.data)
        let {pics} = this.state
        let addressPrefix = 'https://image.yuantutech.com/' + uploadData.data.path + ''
        let addressPicName = uploadData.data.name
        let temp = `${addressPrefix}${addressPicName}`
        this.setState({
          pics: [...pics, temp]
        })
      } else {
        Alert.show('上传图片失败', 1000)
      }
    } else {
      // this.upload.click()
    }
  }

  deletePic(index) {
    let {pics} = this.state
    delete pics[index]
    let pics_fin = []
    pics.forEach((item) => {
      if (item) {
        pics_fin.push(item)
      }
    })
    this.setState({
      pics: pics_fin
    })
  }

  render() {
    let isInYuantuApp = util.isInYuantuApp() && util.version.gt(3, 0, 0)
    // console.log(util)
    let {pics, productList} = this.state
    productList = productList ? productList.filter(z => z.productName!="常见问题") : []
    productList = productList ? productList.filter(z => z.productName!="爽约申诉") : []
    // alert(JSON.stringify(pics))
    pics = pics.map((item) => {
      if (~item.indexOf('image.yuantutech.com')) {
        return item.replace('https://image.yuantutech.com', 'http://112.124.118.39/image')
      } else {
        return item
      }
    })
    return (
      <div>
        <div className="list-ord g-space" style={{overflow: 'hidden'}}>
          {
            this.id ?
              <div>
                <div className="list-item item-input">
                  <div className="item-input-title">未按规定时间取号就诊原因</div>
                </div>
                <div className="list-item item-input">
                  <div className="item-input-content item-select-wrapper">
                    <select defaultValue="default" ref="type">
                      <option value="default">{this.id ? '请选择申诉原因' : '请选择'}</option>
                      <option value="交通原因(堵车、医院太远、停车难)">交通原因</option>
                      <option value="就诊人不会使用设备取号(老人、小孩不会使用自助机或手机APP)">就诊人不会使用设备取号</option>
                      <option value="排队太长，排到时已过期">排队太长，排到时已过期</option>
                      <option value="手机故障无法取消">手机故障无法取消</option>
                      <option value="预约错号了，没有取消">预约错号了，没有取消</option>
                      <option value="设备出现问题，无法取号">设备出现问题，无法取号</option>
                      <option value="其它原因">其它原因</option>
                    </select>
                  </div>
                </div>
              </div>:
              <div className="list-item item-input">
                <div className="item-input-title">问题类型</div>
                <div className="item-input-content item-select-wrapper">

                  <select defaultValue="default"
                          onChange={this.selectChange.bind(this)} ref='type'>
                    <option value="default">请选择</option>
                    {productList.map(item => <option key={item.productId} value={item.productName + '@' + item.productId}>{item.productName}</option>)}
                  </select>

                </div>
              </div>
          }
          <div className="textarea-wrapper">
            <textarea placeholder="请输入意见反馈，我们将为你不断改进" ref='content'></textarea>
          </div>
          {/* */}
          {
            isInYuantuApp ? <div className="image-picker-wrapper">
                <div className="item-input-title" style={{
                  marginBottom: '15px'
                }}>上传图片
                </div>
                <div className="image-picker">
                  {
                    pics.map((item, index) => {
                      return (
                        <div key={index} className="image-picker-item">
                          <div className="image-picker-remove" onClick={this.deletePic.bind(this, index)}></div>
                          <div className="image-picker-content">
                            <img src={item} width="100%" height="100%"/>
                          </div>
                        </div>
                      )
                    })
                  }
                  <div className="image-picker-item image-picker-upload" onClick={this.selectPicture.bind(this)}>
                    <input type="file" ref={(dom) => this.upload = dom} className="image-picker-input" style={{
                      width: '100%'
                    }}/>
                  </div>
                </div>
              </div> : ''
          }

          {/* */}
          <div className="list-item item-input" style={{border: 'none'}}>
            <div className="item-input-title">联系方式</div>
            <div className="item-input-content">
              <input type="text" placeholder="手机/QQ/微信" defaultValue={this.state.phoneNum || ''} ref='contact'/>
            </div>
          </div>
        </div>


        <div className="btn-wrapper">
          <button disabled={!this.state.allowReply} className="btn btn-block" onClick={this.createTicket.bind(this)}>
            {this.id ? '提交申诉' : '提交反馈'}
          </button>
        </div>
      </div>
    )
  }
}
