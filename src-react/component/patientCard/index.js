import React from 'react'
import {SmartBlockComponent} from '../../BaseComponent'
import util from '../../lib/util'
import UserCenter from '../../module/UserCenter'
import Alert from '../alert/alert';

export default class PatientCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cardType: this.props.cardType,
      description: this.props.description,
      unionId: this.props.unionId,
      patientId: this.props.patientId,
      corpId: this.props.corpId,
      cardInfo: this.props.cardInfo,
      need: this.props.need,
      bindBack: this.props.bindBack,
    }
  }

  componentDidMount() {

  }

  componentWillReceiveProps(props) {
    this.state = {
      cardType: props.cardType,
      description: props.description,
      unionId: props.unionId,
      patientId: props.patientId,
      corpId: props.corpId,
      cardInfo: props.cardInfo,
      need: props.need,
      bindBack: props.bindBack
    }
  }

  hasDetail(e, item) {
    if (!item.hasDetail) {
      e.preventDefault();
      Alert.show('该卡不支持查看详情', 1000);
    }
  }

  toBind(href) {
    if (this.state.bindBack) {
      location.replace(href);
    } else {
      location.href = href;
    }
  }

  getItem() {
    let {cardType, description, unionId, patientId, corpId, need} =this.state;
    //let {cardNo, cardName, balance, id} = this.props.cardInfo || [];
    //cardNo = cardNo || "";
    const cardInfo = this.props.cardInfo || [];

    if (need && cardInfo.length > 0) {
      return <div>
        <div className="add-patient-label" style={{paddingTop: '15px'}}>就诊卡管理</div>
        <ul className="list-ord">
          {
            cardInfo.map((item, key) => {
              let href = `./patient-card-detail.html?id=${item.id}&patientId=${item.patientId}&bindBack=1&target=_blank`;
              href = corpId ? href + "&corpId=" + corpId : href;
              href = unionId ? href + "&unionId=" + unionId : href;
              return (
                <li className="list-item " key={"a" + key}>
                  <a className="txt-arrowlink list-link-wrapper" href={href} onClick={(e) => this.hasDetail(e, item)}>
                    <img src="//image.yuantutech.com/user/a3ab8a00d7ded4af13c304446051fc7a-92-92.png"
                         className="list-icon"/>
                    <div className="list-content">
                      <div className="list-title">{item.cardName}({item.cardNo.slice(-4)})</div>
                      {
                        cardInfo.length === 1 ? <div className="list-brief ">卡内余额：
                          <span className="txt-highlight">{item.balance / 100 > 0 ? item.balance / 100 : 0}元</span>
                        </div> : null
                      }
                    </div>
                  </a>
                </li>
              )
            })
          }
        </ul>
        <div className="list-item" style={{borderTop: 'none', backgroundColor: '#fff', marginLeft: '0', paddingLeft: '15px'}}>
          <a
            style={{color: '#76acf8'}}
            className="txt-arrowlink list-link-wrapper"
            onClick={() => this.toBind(`./bind-card.html?cardType=${cardType || ''}&description=${description || ''}&bindBack=1&patientId=${patientId}&unionId=${unionId}&target=_blank`)}
          >
            绑定新的就诊卡
          </a>
        </div>
      </div>
      /*return (
       <div id="J_PatientCard">
       <div className="ui-form ui-medical-card">
       <ul className="list-ord">
       <li className="list-item ">
       <a className="txt-arrowlink list-link-wrapper" href={href}>
       <img src="//image.yuantutech.com/user/a3ab8a00d7ded4af13c304446051fc7a-92-92.png"
       className="list-icon"/>
       <div className="list-content">
       <div className="list-title">{cardName}({cardNo.slice(-4)})</div>
       <div className="list-brief ">卡内余额：<span className="txt-highlight">{balance / 100}元</span></div>
       </div>
       </a>
       </li>
       </ul>
       </div>
       </div>
       )*/
    } else if (!need && cardInfo.length > 0) {
      return <div>
        <div className="add-patient-label" style={{paddingTop: '15px'}}>就诊卡管理</div>
        <ul className="list-ord">
          {
            cardInfo.map((item, key) => {
              return (
                <li className="list-item " key={"b" + key}>
                  <img src="//image.yuantutech.com/user/a3ab8a00d7ded4af13c304446051fc7a-92-92.png"
                       className="list-icon"/>
                  <div className="list-content">
                    <div className="list-title">{item.cardName}{item.cardNo ? `(${item.cardNo.slice(-4)})` : ''}</div>
                    {
                       cardInfo.length === 1 ? <div className="list-brief ">卡内余额：
                        <span className="txt-highlight">{item.balance / 100 > 0 ? item.balance / 100 : 0}元</span>
                      </div> : null
                    }
                  </div>
                </li>
              )
            })
          }
        </ul>
      </div>
    } else if (need && cardInfo.length == 0) {
      let href = `./bind-card.html?cardType=${cardType || ''}&description=${description || ''}&patientId=${patientId}&bindBack=1&target=_blank`;
      href = corpId ? href + "&corpId=" + corpId : href;
      href = unionId ? href + "&unionId=" + unionId : href;
      return (
        <div id="J_PatientCard">
          <div className="add-patient-label" style={{paddingTop: '15px'}}>就诊卡管理</div>
          <div className="ui-form ui-medical-card">
            <ul className="list-ord">
              <li className="list-item ">
                <a className="txt-arrowlink list-link-wrapper" onClick={() => this.toBind(href)}>
                  <img src="//image.yuantutech.com/user/a3ab8a00d7ded4af13c304446051fc7a-92-92.png"
                       className="list-icon"/>
                  <div className="list-content">
                    <div className="list-title txt-prompt">尚未绑定，请先绑定就诊卡</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      )
    }
  }

  render() {
    return (
      <div>
        {this.getItem()}
      </div>
    )
  }
}
