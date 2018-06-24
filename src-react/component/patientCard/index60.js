import React from 'react'
import {SmartBlockComponent} from '../../BaseComponent'
import util from '../../lib/util'
import UserCenter from '../../module/UserCenter'
import {BlockLoading} from '../../component/loading/index'
import Alert from '../alert/alert';

export default class PatientCard60 extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cardType: this.props.cardType,
      unionId: this.props.unionId,
      patientId: this.props.patientId,
      corpId: this.props.corpId,
      patientName: this.props.patientName,
      idNo: this.props.idNo,
      cardNo:this.props.cardNo,
      idType:this.props.idType,
      balance:this.props.balance,
      guarderIdNo:this.props.guarderIdNo,
      phoneNum:this.props.phoneNum,
      cardCount:this.props.cardCount,
      hasDetail:this.props.hasDetail,
      id:this.props.cardId,
    }
  }

  componentWillReceiveProps(props) {
    this.state = {
      cardType: props.cardType,
      unionId: props.unionId,
      patientId: props.patientId,
      corpId: props.corpId,
      patientName:props.patientName,
      idNo: props.idNo,
      cardNo:props.cardNo,
      idType:props.idType,
      balance:props.balance,
      guarderIdNo:props.guarderIdNo,
      phoneNum:props.phoneNum,
      cardCount:props.cardCount,
      hasDetail:props.hasDetail,
      id:props.cardId,
    }
  }

  //点击就诊卡,查看向详情
  hasDetail(hasDetail) {
    let {cardType,guarderIdNo,unionId, patientId, corpId,patientName,id,cardCount,balance,idNo,cardNo} =this.state;
    let href = util.flatStr('./patient-card-detail.html?',{
      patientId,
      id,
      bindBack:1,
      target:'_blank',
      corpId,
      unionId
    })
   
    if (!hasDetail) {
      Alert.show('该卡不支持查看详情', 1000);
      return
    }
    location.href = href;
  }

  toBind() {
    let {cardType,guarderIdNo,unionId, patientId, corpId,patientName,cardCount,balance,idNo,cardNo,idType} =this.state;
    location.href = util.flatStr('./bind-card.html?',{
      cardType,
      patientId,
      bindBack:1,
      corpId,
      idType,
      unionId,
      target:'_blank'
    });
  }

  getItem() {
    let type ={
      '3':'医保卡',
      '4':'番禺民生卡',
      '6':'番禺医保卡'
    }
    let {cardType,guarderIdNo,unionId, patientId, corpId,patientName,cardCount,balance,idNo,hasDetail,cardNo} =this.state;
    let Int = util.getInt(balance/100),
        Float = util.getFloat(balance/100);
    const dataStyle = {
      changeCardStyle:{
        position:'absolute',
        color:'#666',
        top:'0',
        right:'15px',
        height:'100%',
        textAlign:'center',
        display:'flex',
        justifyContent:'space-around',
        alignItems:'center'

      },
      manageCard:{
        position:'relative',
        paddingTop:'15px',
        backgroundColor:'#fff',
        marginTop:'10px'
      }
   
    }

    return (
      <div>
          <div className="add-patient-label" style={dataStyle.manageCard}>
          就诊卡管理 
          {cardCount==0?null:
          <a onClick={(e)=>{this.toBind()}} style={dataStyle.changeCardStyle}><img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/eca6a120dba08ed084fe790b7af8a591-36-36.png" style={{width:'20px',height:'20px',marginRight:'5px'}}/><span style={{color:"#999999"}}>更换</span></a>}
          </div>
          {cardCount==0?
          <div className="ui-form ui-medical-card">
          <ul className="list-ord">
            <li className="list-item ">
              <a className="txt-arrowlink list-link-wrapper" onClick={() => this.toBind()}>
                <img src="//image.yuantutech.com/user/a3ab8a00d7ded4af13c304446051fc7a-92-92.png"
                     className="list-icon"/>
                <div className="list-content">
                  <div className="list-title txt-prompt">尚未绑定，请先绑定就诊卡</div>
                </div>
              </a>
            </li>
          </ul>
        </div>:
          <ul className="list-ord">
                  <li className="list-item txt-arrowlink"
                      onClick={() => this.hasDetail(hasDetail)}>
                      <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/570cd9eb67e080005320c0fe38d4792a-84-84.png"
                          className="list-icon"/>
                      <div className="list-content">
                        <div className="list-title">
                          {type[cardType]}
                          <span style={{marginLeft:'5px'}}>(尾号{cardNo.slice(-4)})</span>
                        </div>
                        <div className="list-brief ">卡内余额 
                            <span className="txt-highlight" style={{color:'#ff5256',marginLeft:'10px'}}>¥{balance / 100 > 0 ? <span style={{fontSize:'16px'}}><span>{Int}</span><span style={{fontSize:'12px'}}>{Float}</span></span> : 0}</span>
                          </div>
                      </div>
                  </li>
            </ul>}
        </div>
    )
  }

  render() {
    return (
      <div>
        {this.getItem()}
      </div>
    )
  }
}
