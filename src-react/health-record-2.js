'use strict'

import React from 'react'
import {findDOMNode} from 'react-dom'
import util from './lib/util'
import {SmartNoBlockComponent, SmartBlockComponent, SmartComponent} from './BaseComponent/index'

import UserCenter from './module/UserCenter'
import Alert from './component/alert/alert'

class HealthRecord2 extends SmartNoBlockComponent {
	constructor(props) {
		super(props)
		this.query = util.query()
		this.unionId = this.query.unionId
		this.state = {
			loading: false,
			success: true
		}
		this.inputGroup = []
		this.card = [
			{
				groupName: '身高体重',
				childList: [
					{
						text: '身高',
						placeholder: '请输入身高 (cm)',
						unit: 'cm'
					},
					{
						text: '体重',
						placeholder: '请输入体重 (kg)',
						unit: 'kg'
					}
				]
			},
			{
				groupName: '体脂',
				childList: [
					{
						text: '脂肪含量',
						placeholder: '请输入脂肪含量',
						unit: '%'
					},
					{
						text: '基础代谢值',
						placeholder: '请输入基础代谢 (KCal)',
						unit: 'kcal'
					}
				]
			},
			{
				groupName: '血压',
				childList: [
					{
						text: '收缩压(SBP)',
						placeholder: '请输入收缩压 (mmHg)',
						unit: 'mmHg'
					},
					{
						text: '舒张压(DBP)',
						placeholder: '请输入舒张压 (mmHg)',
						unit: 'mmHg'
					}
				]
			},
			{
				groupName: '血氧',
				childList: [
					{
						text: '脉搏(PR)',
						placeholder: '请输入脉搏 (bpm)',
						unit: 'bmp'
					},
					{
						text: '灌注指数(PI)',
						placeholder: '请输入灌注指数',
						unit: ''
					}
				]
			}
		]
		if(!util.isLogin()) {
		  util.goLogin()
		}
	}

	componentDidMount() {
	}

	onSuccess(result) {
		if(result.success) {
			Alert.show('健康数据记录成功', 1500)

			setTimeout(() => {
				util.goBack(true)
			}, 1500)
		}
	}

	checkInput() {
		let pass = true
		let card = this.card
		/**
		 * @author [蒋璇]
		 * 2017-1-17 代码可以优化
		 * 这里的map可以使用更加符合场景的every来代替
		 * API图解：https://www.zhihu.com/question/24927450
		 */
		this.inputGroup.map((item, index) => {
			let firstData = item[0].value.trim()
				, secondData = item[1].value.trim()
			if(firstData === '' && secondData !== '') {
				let type = item[0].dataset.type
				Alert.show(type + '不能为空', 1000)
				pass = false
				// throw new Error(type + '不能为空')
			} else if(firstData !== '' && secondData === '') {
				let type = item[1].dataset.type
				Alert.show(type + '不能为空', 1000)
				pass = false
				// throw new Error(type + '不能为空')
			} else if(firstData !== '' && secondData !== '') {
				let num1 = parseFloat(firstData)
					, num2 = parseFloat(secondData)
				if(isNaN(num1) || isNaN(num2)) {
					Alert.show('请输入数值类型的数据！', 1000)
					pass = false
					// throw new Error('请输入数值类型的数据！')
				} else if(num1 < 0 || num2 < 0){
					Alert.show('请输入正数！', 1000)
					pass = false
					// throw new Error('请输入正数！')
				}
			}
			if(!pass) {
				throw new Error('数据校验出错，出错的地方为---' + card[index].groupName)
			}
		})
		if(pass) {
			this.submit()
		}
	}

	submit() {
		let inputGroup = this.inputGroup
		let card = this.card
		// console.log('校验通过')
		// 用户填写的数据校验通过，下面进行提交数据之前的数据拼合
		let data = {
			childList: []
		}
		let select = findDOMNode(this.select)
		// 校验就诊人是否有选择项
		// 解决网速过慢导致就诊人没有加载出来的时候用户点击提交按钮
		if(!select.value.trim()) {
			Alert.show('请选择就诊人!', 1000)
			return
		}
		let idNoPatientName = select.value.trim().split(':')
		let idNo = idNoPatientName[0]
			, patientName = idNoPatientName[1]

		// 设置提交数据的idNo patientName
		data.idNo = idNo
		data.patientName = patientName
		// 设置提交数据的idNo patientName End

		// 按照数据格式进行拼合
		// 具体数据格式见 http://confluence.yuantutech.com/pages/viewpage.action?pageId=951665#_top 第九条
		inputGroup.map((item, index) => {
			item.map((sub) => {
				let temp = {}
				let childName = sub.dataset.type
				let unit = sub.dataset.unit
				let dataStr = sub.value.trim()
				temp.groupName = card[index].groupName
				temp.childName = childName
				temp.unit = unit
				temp.dataStr = dataStr
				if(dataStr) {
					data.childList.push(temp)
				}
			})
		})
		/**
		 * 如果拼合完成的数据里面没有数据，这里要做判断，让用户至少
		 * 填写一个数据
		 */
		if(!data.childList.length) {
			Alert.show('请至少填写一个数据！', 1000)
			return
		}
		// 发送给后端的数据结构构造完毕，开始发送数据
		// console.log(data)
		UserCenter.saveHealthData(JSON.stringify(data), this.unionId)
			.subscribe(this)
			.fetch()

	}

	render() {
		let card = this.card
		let self = this
		return (
			<div>
				<ul className="list-ord">
					<div className="list-item item-input">
							<div className="item-input-title">就诊人</div> 	
							<div className="item-input-content item-select-wrapper">
								<Select ref={(dom) => this.select = dom} />
							</div>
						</div>
				</ul>
				{
					card.map((item, index) => {
						self.inputGroup[index] = []
						let ind = index
						return <div key={index} className="J">
							<p>{item.groupName}</p>
							<div className="list-ord">
								{
									item.childList.map((item, index) => {
										return <div key={index} className="list-item item-input">
											<div className="item-input-title">{item.text}</div>
											<div className="item-input-content">
												<input ref={(dom) => self.inputGroup[ind].push(dom)} type="text" data-type={item.text} data-unit={item.unit} placeholder={item.placeholder} />
											</div>
										</div>
									})
								}
							</div>
						</div>
					})
				}
				<div className="btn-wrapper">
					<button className="btn btn-block" onClick={this.checkInput.bind(this)}>保存健康数据</button>
				</div>
			</div>
		)
	}
}

class Select extends SmartComponent {
  constructor(props) {
    super(props)
    this.unionId = util.query()["unionId"]
    this.state = {
      patientList: [],
      success: false,
      loading: true
    }

    if(!util.isLogin()) {
      util.goLogin()
    }
  }

  componentDidMount() {

    UserCenter.getPatientList(null, this.unionId)
     .subscribe(this)
     .fetch()
  }

  renderLoading() {
    return <option disabled>加载中</option>
  }

  renderError(){
    let {msg} = this.state;
    return <option>{msg}</option>;
  }

  onSuccess(result) {
    this.setState({
      loading: false,
      success: true,
      patientList: result.data
    })
  }

  render() {
    let {patientList, success,loading} = this.state
    return(
        <select>
          {
            patientList.map((item, index) => {
              return(
                <option value={item.idNo + ':' + item.patientName} key={index}>{item.patientName}</option>
              )
            })
          }
        </select>
    )
  }

}

export default HealthRecord2