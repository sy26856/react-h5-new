import React from 'react'
import AsyncRequestLoading from '../loading/AsyncRequestLoading'
import UserCenter from '../../module/UserCenter'
/**
  <SelectPatientCard
    patients={[]}
    onChange={this.onChangePatientCard.bind(this)}
    onCancel={()=>{
      this.setState({showSelectPateintCard:!showSelectPateintCard})
    }}
  />
*/

import './selectpatient.less';

export default class SelectPatientCard extends React.Component{


  onSelect(card){
    this.props.onChange && this.props.onChange(card);
  }

  render(){
    let {cards,display} = this.props;
    return (
      <div className="popup-mask" style={{display:(display ? "block" : 'none')}}>
        <AsyncRequestLoading ref="blockLoading" />
        <div className="popup-wrapper popup-up-wrapper">
          <div className="popup">
            <div className="popup-title">
                选择就诊卡
                <span className="popup-close icon-fork" onClick={this.props.onCancel}></span>
            </div>
            <div className="popup-body">
              {
                cards.length ? (
                  <div className="list-ord">
                    {
                      cards.map((item, index)=>{
                        return (
                          <div className="list-item list-nowrap" key={index} onClick={this.onSelect.bind(this, item)} >
                        		<img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/200ebefe79377f63f8be85a66a830f2b-68-68.png" className="list-icon" />
                        		<div className="list-content">
                        			<div className="list-title txt-nowrap">{item.cardName}</div>
                        			<div className="list-brief txt-nowrap">{item.cardNo}</div>
                        		</div>
                        	</div>
                        )
                      })
                    }
                  </div>
                ) : null
              }
              {
                cards.length == 0 ? (
                  <div className="bind-notice">
                    <span></span>
                    <p>当前就诊人尚未绑定就诊卡</p>
                    <p>请先绑定就诊卡</p>
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
