import React from 'react'
import {SmartBlockComponent} from '../../BaseComponent'
import util from '../../lib/util'
import UserCenter from '../../module/UserCenter'
import {BlockLoading} from '../../component/loading/index'
import Alert from '../alert/alert';

export default class PatientCard_qd extends React.Component {
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
      phoneNum:props.phoneNum
    }
  }

  //点击就诊卡,查看向详情
  // hasDetail(e, item) {
  //   if (!item.hasDetail) {
  //     e.preventDefault();
  //     Alert.show('该卡不支持查看详情', 1000);
  //   }
  //   //item.hasDetail为真,点击a标签自动跳转到详情页
  // }

  //点击更换,更换绑定的卡
  changeBindCard(e){
    e.preventDefault()
    let data = {
      idNo: this.state.idNo,
      patientName: this.state.patientName,
      idType:this.state.idType,
      id:this.state.patientId,
      guarderIdNo:this.state.guarderIdNo
    }
    let _this = this;
    let _idNo = _this.state.idType == 1?data.idNo:data.guarderIdNo
    UserCenter.getUserCardsByPatientId(data.guarderIdNo, data.patientName,data.id).subscribe({
      onSuccess(result){
        //这里不存在length为0的情况,因为能进入这个页面的都是绑卡的就诊人
        if (result.success && result.data) {
          let resultDate = result.data;//[{},{}]
          if(resultDate.length == 1 && resultDate[0].cardType == _this.state.cardType){
            Alert.show('没有其他卡可绑定',1000)
            return;
          }else{
              //说明该就诊人可绑定的卡的类型有2种,跳转到bind-change-card-29页面绑卡
              let param = util.flat({
                ..._this.state,
                target:'_blank'
              })
              window.location.href = "bind-card-change-29.html?" + param
        }
      }
      },
      onError(result){
        Alert.show( result.msg,1000)
      }
    }).fetch()  
  }


  getItem() {

    let {cardType,guarderIdNo,unionId, patientId, corpId,patientName,balance,idNo,cardNo} =this.state;
    let Int = util.getInt(balance/100),
        Float = util.getFloat(balance/100);
    let href = `./patient-card-detail.html?&patientId=${patientId}&bindBack=1&target=_blank`;
        href = corpId ? href + "&corpId=" + corpId : href;
        href = unionId ? href + "&unionId=" + unionId : href;
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
          <a onClick={(e)=>{this.changeBindCard(e)}} style={dataStyle.changeCardStyle}><img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/eca6a120dba08ed084fe790b7af8a591-36-36.png" style={{width:'20px',height:'20px',marginRight:'5px'}}/><span style={{color:"#999999"}}>更换</span></a>
          </div>
          <ul className="list-ord">
                  <li className="list-item">
                      <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/570cd9eb67e080005320c0fe38d4792a-84-84.png"
                          className="list-icon"/>
                      <div className="list-content">
                        <div className="list-title">
                          {cardType == 1?'青岛区域诊疗卡':'青岛医保卡'}
                          {cardType == 1?
                              <span style={{marginLeft:'5px'}}>(尾号{cardNo.slice(-4)})</span>
                            :null}
                        </div>
                        <div className="list-brief ">卡内余额 
                            <span className="txt-highlight" style={{color:'#ff5256',marginLeft:'10px'}}>¥{balance / 100 > 0 ? <span style={{fontSize:'16px'}}><span>{Int}</span><span style={{fontSize:'12px'}}>{Float}</span></span> : 0}</span>
                          </div>
                      </div>
                  </li>
            </ul>
        </div>
    )
  }

    /* 渲染区域*/
  render() {
    return (
      <div>
        {this.getItem()}
      </div>
    )
  }
}
