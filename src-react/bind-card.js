import React from 'react';
import UserCenter from './module/UserCenter';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import util from './lib/util';
import Alert from './component/alert/alert';
import cache from './lib/cache';
import './bind-card.less';

export default class BindCard extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();
    this.unionId = query.unionId || '';
    this.patientId = query.patientId || '';
    this.patientName = query.patientName || '';
    this.patientIdNo = query.patientIdNo || '';
    this.idType = query.idType || '';
    this.redirect = query.redirect || '';
    this.selectPatient = query.selectPatient || '';  //如果存在，就设置localStorage中的patient信息
    this.cardType = query.cardType || '';
    this.rebind = query.rebind || '';
    this.bindBack = query.bindBack || ''; //如果存在，绑定成功返回上一个页面
    this.timer = null;
    this.state = {
      data: null,
      loading: true,
      needMsg: 0,
      msg: null,
      sendCodeMsgTime: 0,
      btnLoading: false
    }
  }

  componentDidMount() {
    UserCenter.getCardTypeList(this.unionId).subscribe(this).fetch();
    this.getRemind();
  }

  onSuccess(result) {
    const need = result.data.filter(z => z.id == this.cardType)[0];
    this.setState({
      data: result.data,
      loading: false,
      success: true,
      needMsg: need ? need.needMsg : 0
    });
  }

  submit = () => {
    const cardType = this.refs.cardType.value;
    const cardNo = this.refs.cardNo.value;
    const phone = this.refs.phone.value;
    const validCode = this.refs.validCode ? this.refs.validCode.value : '';

    if (!cardType) {
      Alert.show("无可用的就诊卡类型", 1000);
      return;
    }

    if (!(cardNo.length > 5 && cardNo.length < 30)) {
      Alert.show("请输入正确的卡号", 1000);
      return;
    }

    if (!/^\d{11}$/.test(phone)) {
      Alert.show("请输入正确的手机号码", 1000);
      return;
    }

    UserCenter.addCard(cardNo, cardType, phone, this.patientId, this.unionId, validCode,this.idType).subscribe({
      onSendBefore: ()=>{
        this.setState({
            btnLoading: true
        })
      },
      onSuccess: (result) => {
        if (result.success) {
            this.setState({
                btnLoading: false
            })
          Alert.show("卡片绑定成功", 1000);
          setTimeout(() => {
            if (this.redirect) {
              if (this.selectPatient) {
                if (this.patientIdNo.indexOf("_") > -1) {
                  this.patientIdNo = this.patientIdNo.replace("_", "");
                }
                cache.set("patientId", this.patientId);
                cache.set("patientName", this.patientName);
                cache.set("needDefault", false);
                cache.set("patientIdNo", this.patientIdNo);
                window.location.replace(this.redirect);
              } else {
                window.location.href = this.redirect;
              }
            } else {
              if(this.unionId==60){
                window.location.replace(`./patient-list-60.html?unionId=${this.unionId}&corpId=${this.corpId}&target=_blank`)
              }else{
                if (this.bindBack) {
                  window.location.replace(`./add-patient.html?id=${this.patientId}&unionId=${this.unionId}&bindBack=1&corpId=${this.corpId}&target=_blank`)
                } else {
                  window.location.replace(`./add-patient.html?id=${this.patientId}&unionId=${this.unionId}&corpId=${this.corpId}&target=_blank`);
                }
              }
            }
          }, 1000);
        }
      },
      onError: (result) => {
        this.setState({
            btnLoading: false
        })
        Alert.show(result.msg, 1000);
      }
    }).fetch();

  };

  changeCardType() {
    const {data} = this.state;
    const cardType = this.refs.cardType.value;
    const selectCard = data.filter(item => item.id == cardType)[0];

    this.setState({
      needMsg: selectCard ? selectCard.needMsg : 0,
      cardId: selectCard ? selectCard.id : ''
    });
  }

  getRemind() {
    UserCenter.getCardRemind(this.unionId).subscribe({
      onSuccess: (result) => {
        this.setState({
          msg: result.data || ''
        })
      }
    }).fetch();
  }

  validate = () => {
    const cardType = this.refs.cardType.value;
    const cardNo = this.refs.cardNo.value;
    const phone = this.refs.phone.value;

    if (!cardType) {
      Alert.show("无可用的就诊卡类型", 1000);
      return;
    }

    if (!(cardNo.length > 5 && cardNo.length < 30)) {
      Alert.show("请输入正确的卡号", 1000);
      return;
    }

    if (!/^\d{11}$/.test(phone)) {
      Alert.show("请输入正确的手机号码", 1000);
      return;
    }

    UserCenter.getBindCardValidate(cardNo, cardType, phone, this.patientId, this.unionId).subscribe({
      onSuccess: (result) => {
        Alert.show("发送成功", 800);
        this.setState({
          sendCodeMsgTime: 60
        });
        this.codeMsgTime();
      },
      onError: (err) => {
        Alert.show(err.msg || '', 1500);
      }
    }).fetch();
  };

  codeMsgTime = () => {
    this.timer = setInterval(() => {
      const currentTime = this.state.sendCodeMsgTime - 1;
      this.setState({
        sendCodeMsgTime: currentTime
      });
      if (currentTime == 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  };

  render() {
    const {data, needMsg, msg, sendCodeMsgTime, btnLoading} = this.state;
    return (
      <div>
        <div className="bind-card-title">绑定就诊卡，可在挂号、缴费等环节直接支付</div>
        <div className="list-ord">
          <div className="list-item item-input">
            <div className="item-input-title">就诊卡类型</div>
            <div className="item-input-content item-select-wrapper">
              <select
                style={{height: '28px'}}
                disabled={this.rebind}
                ref="cardType"
                onChange={() => this.changeCardType()}
                defaultValue={this.cardType ? this.cardType : ''}
              >
                <option value="">请选择</option>
                {data.map((item, index) =>
                  <option value={item.id} key={"a" + index}>{item.name}</option>
                )}
              </select>
            </div>
          </div>
          <div className="list-item item-input">
            <div className="item-input-title">卡号</div>
            <div className="item-input-content">
              <input type="text" ref="cardNo" placeholder="请输入卡号"/>
            </div>
          </div>
          <div className="list-item item-input">
            <div className="item-input-title">手机号码</div>
            <div className="item-input-content item-select-wrapper">
              <input type="text" ref="phone" placeholder="请输入手机号"/>
            </div>
          </div>
          {
            needMsg == 1 && <div className="list-item item-input">
              <div className="item-input-title">验证码</div>
              <div className="item-input-content item-select-wrapper">
                <input type="text" ref="validCode" placeholder="请输入验证码"/>
              </div>
              {
                sendCodeMsgTime > 0 ?
                  <button style={{width: '86px'}} className="btn btn-disabled btn-sm" disabled>{this.state.sendCodeMsgTime}s</button>
                  : <button className="btn btn-secondary btn-sm" onClick={this.validate}>发送验证码</button>
              }
            </div>
          }
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block btn-secondary" onClick={this.submit}>{btnLoading?<span className="icon-loading" style={{marginRight: 10}}> </span>: null}确认</button>
        </div>
        {msg && <div dangerouslySetInnerHTML={{__html: msg}}></div>}
      </div>
    );
  }
}
