import React from 'react'
import AsyncRequestLoading from '../loading/AsyncRequestLoading'
import UserCenter from '../../module/UserCenter'

import './selectpatient.less';

/**
  <SelectPatientCard
    patients={[]}
    onChange={this.onChangePatientCard.bind(this)}
    onCancel={()=>{
      this.setState({showSelectPateintCard:!showSelectPateintCard})
    }}
  />
*/

export default class SelectPatient extends React.Component{
  constructor(props){
    super(props)
  }



  onSelect(patient){
    this.props.onChange && this.props.onChange(patient.id, patient.patientName, patient);
  }

  render(){
    let {patients,display} = this.props;

    //小孩
    //https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f67f01446d90cf0613feee5389c44b36-68-68.png
    //大人
    //https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/7fee31b86360d5ee6b19c10b4dae22c2-68-68.png
    let type2Icon = "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f67f01446d90cf0613feee5389c44b36-68-68.png";
    let type1Icon = "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/7fee31b86360d5ee6b19c10b4dae22c2-68-68.png";

    return (
      <div className="popup-mask" style={{display:(display ? "block" : "none")}}>
        <div className="popup-wrapper popup-up-wrapper">
          <div className="popup">
            <div className="popup-title">
                选择就诊人
                <span className="popup-close icon-fork" onClick={this.props.onCancel}></span>
            </div>
            <div className="popup-body">
              {
                patients.length ? (
                  <div className="list-ord">
                    {
                      patients.map((item, index)=>{
                        return (
                          <div className="list-item list-nowrap" key={index} onClick={this.onSelect.bind(this, item)} >
                        		<img src={item.idType == 1 ? type1Icon : type2Icon} className="list-icon" />
                        		<div className="list-content">
                        			<div className="list-title txt-nowrap">
                                {item.patientName}
                                <div className="patient-id-type-tag">{item.idType == 1 ? "成人" :"儿童"}</div>
                              </div>
                        			<div className="list-brief txt-nowrap">{item.idType == 2?item.guarderIdNo:item.idNo}</div>
                        		</div>
                        	</div>
                        )
                      })
                    }
                  </div>
                ) : null
              }
              {
                patients.length == 0 ? (
                  <div className="patient-notice">
                    <span></span>
                    <p>当前账户没有就诊人</p>
                    <p>请先添加就诊人</p>
                  </div>
                ) : null
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
