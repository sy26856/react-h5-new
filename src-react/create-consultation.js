/*
 * @Author: saohui 
 * @Date: 2017-10-19 16:c18:04
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-04-16 14:22:05
 */
// const patients = [{"id":1000006684,"patientName":"董文哲","idType":1,"idNo":"540000199901011863"},{"id":1000006686,"patientName":"丁亮亮","idType":1,"idNo":"330824199610050016"},{"id":1000006874,"patientName":"黎婉君","idType":1,"idNo":"440181198404140029"},{"id":1000007817,"patientName":"姚广华","idType":1,"idNo":"445381198509137817"},{"id":1000012714,"patientName":"吴晓晓45","idType":2,"idNo":"330183199206014349"},{"id":1000018109,"patientName":"叶浩轩","idType":1,"idNo":"52240119870816742X"},{"id":1000018645,"patientName":"苗华伟","idType":1,"idNo":"341225200411208513"},{"id":1000018692,"patientName":"陈永斌","idType":1,"idNo":"342523197712077019"},{"id":1000018696,"patientName":"雪莉","idType":2,"idNo":"130202199404042519"},{"id":1000018940,"patientName":"啊楚","idType":1,"idNo":"330183199206014349"},{"id":1000019643,"patientName":"邹嗣侗","idType":1,"idNo":"510823198802265372"},{"id":1000019644,"patientName":"邹传洋","idType":2,"idNo":"500382199303235991"},{"id":1000020806,"patientName":"张国九","idType":1,"idNo":"413026194407039013"}]
 
import React from 'react'
import { SmartBlockComponent } from './BaseComponent'
import util from './lib/util'

import Alert from './component/alert/alert'
import SelectPatient from './component/patient/SelectPatient'

import { connect } from 'gi-mini-dvajs'

class CreateConsultation extends SmartBlockComponent {
  constructor(props){
    super(props)
    let query = util.query();
    this.param = util.flat(query)
    this.state={
      success:false,
      loading:true
    }
  }
  componentWillMount(){
    window.location.href="./patient-audio.html?isGraphic=true&"+this.param
  }
  renderInputTxt () {
    const { dispatch, inputValue } = this.props
    return <div className="textarea-wrapper">
      <span className="textarea-limit">{ inputValue.length }/300字</span>
      <textarea value={ inputValue } onChange={(e) => {
        dispatch({ type: 'createConsultation/setInputValue', value: e.target.value })
      }} placeholder="请详细描述您的症状、身体状况或其他疑问，便于医生更准确地分析。（10~300个字）" style={{ height: 100 }}></textarea>
    </div>
  }
  renderInputImg () {
    const { imgs, dispatch } = this.props

    return util.isInYuantuApp() ? <div className="image-picker-wrapper">
      <div className="item-input-title" style={{
        marginBottom: '15px',fontSize: "14px", fontColor:"#989898"
      }}>添加检查或者症状相关图片
        <span style={{color: "#e56766", fontSize: "13px"}}>
          &nbsp;&nbsp;*保证隐私安全*
        </span>
        </div>
      <div className="image-picker">
        {
          imgs.map(( url, index ) => {
            return (
              <div key={ index } className="image-picker-item">
                <div className="image-picker-remove" onClick={() => {
                  dispatch({ type: 'createConsultation/removeImg', index })
                }}> </div>
                <div className="image-picker-content">
                  { url == 'loading' ? <div className="upload-img-loading">
                    <span className="icon-loading"> </span>
                  </div> : <img src={ url } width="100%" height="100%" /> }
                </div>
              </div>
            )
          })
        }
        { imgs.length <= 4 ? <div className="image-picker-item image-picker-upload"
                                  style={{border:"1px dotted #eeeeee"}}
                                  onClick={() => {
                                  dispatch({ type: 'createConsultation/upload'})
                                }}>
          <input type="file" className="image-picker-input" style={{
            width: '100%'
          }} />
        </div> : null }
      </div>
    </div> : null
  }
  renderSubmit () {
    const { dispatch, inputValue, submitOk } = this.props
    
    const isDisabled = inputValue.length < 10 || inputValue.length > 300
    return <div className="btn-wrapper">
      <button  className={'btn btn-block '+ (isDisabled ? 'btn-disabled' : '')} onClick={() => {
        if ( inputValue.length < 10 ) {
          Alert.show('文字描述少于10个字')
          return
        }
        if ( submitOk ) {
          Alert.show('只需要提交一次哦')
        }
        dispatch({ type: 'createConsultation/submit'})
      }}>
        下一步
      </button>
    </div>
  }

  renderSelectPatient () {
    const { dispatch, showSelectPatient, currentPatientName, patientList } = this.props
    return <div className='panel g-space'>
      <ul className="list-ord" >
        <li className="list-item" onClick={() => {
          dispatch({ type: 'createConsultation/selectPatient'})
        }}>
          <a className="txt-arrowlink list-link-wrapper">
            <div className="list-content">选择就诊人：</div>
            <div className="list-extra" style={{lineHeight: "18px"}}>{ currentPatientName || '请选择就诊人'}</div>
          </a>
        </li>
      </ul>
      <SelectPatient 
        display={ showSelectPatient }
        patients={ patientList }
        onChange={( currentPatientId, currentPatientName ) => {
          dispatch({
            type: 'createConsultation/setCurrentPatient'
            ,currentPatientId
            ,currentPatientName
          })
          dispatch({ type: 'createConsultation/hideSelectPatient'})
        }}
        onCancel={() => {
          dispatch({ type: 'createConsultation/hideSelectPatient'})
        }}
        />
    </div>
  }

  renderHeader () {
    return this.renderSelectPatient()
  }
  renderBody () {
    return <div className="list-ord g-space" >
      { this.renderInputTxt()}
      { this.renderInputImg()}
    </div>
  }
  renderFooter () {
    return <div className="main-footer">
      { this.renderSubmit()}
    </div>
  }

  render () {
    return <div className="create-consultation">
      {/* { this.renderHeader()}
      { this.renderBody()}
      { this.renderFooter()} */}
    </div>
  }
}


function mapStateToProps ({ createConsultation }) {
  return { 
    ...createConsultation
  }
}

export default connect( mapStateToProps )( CreateConsultation )