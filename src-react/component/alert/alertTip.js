
import React from 'react'
import './alert.less'

let alertExample = null;

export default class Alert extends React.Component {
  constructor(props){
    super(props)
    this.state={
        headText:this.props.alertParams.headText||'温馨提示',
        tipContent:this.props.alertParams.tipContent,
        btnNumber:this.props.alertParams.btnNumber,
        firstText:this.props.alertParams.firstText,
        secondText:this.props.alertParams.secondText,
        isShowhead:this.props.alertParams.isShowhead
    }
  }
  
  render(){
    let {btnNumber,isShowhead,tipContent,headText,firstText,secondText,firstColor,secondColor} = this.props.alertParams
    return <div className="ui-alert">
     <div className="modal-mask ">
        <div className="modal-wrapper">
            <div className="modal">
                {isShowhead=='true'?<div className="modal-title">{headText}</div>:null}
                <div className="modal-body ">
                <div className="txt-insign" dangerouslySetInnerHTML={{__html:tipContent}}></div> 	
                </div>
                <div className="modal-footer">
                <div className="modal-button-group-v">
                    {btnNumber==1?<a  className="modal-button" onClick={this.props.firstClick} style={{color:firstColor}}>{firstText}</a>:
                    <div className="modal-btn">
                        <a  className="modal-button-fir" onClick={this.props.firstClick} style={{color:firstColor}} >{firstText}</a>
                        <a  className="modal-button-sec" onClick={this.props.secondClick} style={{color:secondColor}}>{secondText}</a>
                    </div>}
                </div>
                </div>
            </div>
        </div>
    </div>
</div>
  }
}