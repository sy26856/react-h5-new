import React from 'react'
// import './smart-ui.less'

class ConfirmDialog extends React.Component {
  onSelect(confirm){
    this.props.callback && this.props.callback(confirm)
  }
  render(){
    let { title, des, cancelText, okText} = this.props;
    return (
      <div className="modal-mask">
        <div className="modal-wrapper">
          <div className="modal">
            <div className="modal-title">{title}</div>
            <div className="modal-body txt-insign ">{des}</div>
            <div className="modal-footer">
              <div className="modal-button-group-h">
                <a className="modal-button" onClick={this.onSelect.bind(this, false)} >{cancelText}</a>
                <a className="modal-button" onClick={this.onSelect.bind(this, true)}>{okText}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}


export default class Confirm extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      display:this.props.display,
      title:this.props.title || "确认信息",
      des:this.props.des || "请确认信息",
      cancelText:this.props.cancelText || "取消",
      okText:this.props.okText || "确认",
      callback:this.props.callback || function(){}
    }
  }
  render(){
    let {display, title, des, cancelText, okText, callback} = this.state;
    return display ? <ConfirmDialog title={title} des={des} cancelText={cancelText} okText={okText} callback={callback} /> : null
  }
}

//可以异步调用的Confirm
Confirm.confirm = function(confirm){
  return new Promise((reslove, reject)=>{
    if(confirm instanceof React.Component){
      confirm.setState({
        display:true,
        callback:(is)=>{
          confirm.setState({display:false})
          reslove(is)
        }
      });
    }else{
      reject(new Error("confirm is not instanceof of React.Component"));
    }
  })
}
