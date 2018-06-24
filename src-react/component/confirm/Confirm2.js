import React from 'react'
// import './smart-ui.less'
class ConfirmDialog extends React.Component {
	onSelect(confirm){
		this.props.callback && this.props.callback(confirm)
	}
	render(){
		let { title, des, cancelText, okText,showCancelBtn} = this.props;
		console.log(showCancelBtn)
		return (
			<div className="modal-mask">
				<div className="modal-wrapper">
					<div className="modal">
						<div className="modal-title">{title}</div>
						<div className="modal-body txt-insign ">{des}</div>
						<div className="modal-footer">
							<div className="modal-button-group-h">
							{showCancelBtn!==1?<a className="modal-button" onClick={this.onSelect.bind(this, false)} >{cancelText}</a>:null}
							<a className="modal-button" onClick={this.onSelect.bind(this, true)}>{okText}</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}


export default class Confirm2 extends React.Component{
	constructor(props){
		super(props)
		console.log(this.props.showCancelBtn)
		this.state = {
			display:this.props.display,
			title:this.props.title || "确认信息",
			des:this.props.des || "请确认信息",
			cancelText:this.props.cancelText || "取消",
			okText:this.props.okText || "确认",
			callback:this.props.callback || function(){},
			showCancelBtn:this.props.showCancelBtn,
		}
	}

	componentWillReceiveProps(props) {
		this.state = {
			display:props.display,
			title:props.title || "确认信息",
			des:props.des || "请确认信息",
			cancelText:props.cancelText || "取消",
			okText:props.okText || "确认",
			callback:props.callback || function(){},
			showCancelBtn:this.props.showCancelBtn,
		}
	}

	render(){
		let {display, title, des, cancelText, okText, callback,showCancelBtn} = this.state;
		return display ? <ConfirmDialog title={title} des={des} cancelText={cancelText} okText={okText} callback={callback}  showCancelBtn={showCancelBtn}/> : null
	}
}
