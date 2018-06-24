/*
 * @Author: Saohui 
 * @Date: 2017-06-20 09:34:35 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-22 11:19:56
 */
import React from 'react'
import './input.less'

/**
 * 
 * props 拥有: bgUrl, placeholder = '', type = 'text', onChange = (react 默认会有), defaultValue = '', showBtn, btnVal = '', btnClick = function(){}
 *       其中: bgUrl 为必填项
 * input.value(获取 value 方式) : 使用 onChange 中可以获得 input 的 event (事件对象)
 *       然后使用 event.target 获取到真实的 input 然后获取 value
 * Re: <Input onChage={ (e)=>{ this.inputValue = e.target.value } } />
 * 当有比如，发送验证码这种需要按钮的需求时，设置 showBtn 为 true 并输入 按钮文字 btnVal btn 的 click 事件为 btnClick
 * @export
 * @class Input
 * @extends {React.Component}
 */
export default class Input extends React.Component {
  constructor(props){
    super(props)

    const val =  this.props.defaultValue || ''

    this.state = {
      againInput: (val.length > 0)
      ,showDeleteAll: false
      ,showPassword: false
    }

    this.prevVal = props.defaultValue || ''
  }

  divisionTel ( val ) {
    if ( !val ) {
      return ''
    }

    val = val.replace( /\s+/g, '')
    let arr = val.split('')

    val = arr.reduce(( result, value, index ) => {
      index++
      if ( index % 4 == 0 ) {
        result += ' '

        // 当添加了一个空格后，光标也要相应的右移
        if ( index + (~~( index / 4 ) - 1 ) == this.cursorPosition ) {
          this.cursorPosition ++
        }
      }
      result += value
      return result
    }, '')
    
    // 如果是黏贴的则，把光标放到最后面
    const isPaste = this.prevVal.length + 1 < val.length
    if ( isPaste ) {
      this.cursorPosition = val.length
    }

    return val
  }

  getCursorPosition () {
    const target = this.refs.input
    this.cursorPosition  = target.selectionStart + 1
  }
  setCursorPosition () {
    const target = this.refs.input
    , { cursorPosition } = this
    target.setSelectionRange( cursorPosition, cursorPosition )
  }

  formChange ( e, type ) {
    const { onChange } = this.props

    let result = {}

    const isTel = type == 'tel'
    
    if( e.target.value.length > 0 ){
      result['againInput'] = true
    } else {
      result['againInput'] = false
    }

    if ( isTel ) {
      e.target.value = ( this.divisionTel( e.target.value ))
      this.setCursorPosition()
    }

    this.setState(result)
    onChange && onChange( e )
    this.prevVal = e.target.value
  }

  clearInput( ref ){
    const obj = this.refs[ref]
    obj.value = ''
    obj.focus()
    this.setState({
      againInput: false
    })
    this.props.onChange( {
      target: {
        value: ''
      }
    } )
  }

  render(){
    const { bgUrl, placeholder, type, defaultValue, showBtn, maxLength } = this.props
    const { againInput, showDeleteAll, showPassword } = this.state
    
    const isPassword = type == 'password'
    , _type = isPassword && showPassword ? 'text' : type
    , _defaultValue = type == 'tel' ? this.divisionTel( defaultValue ) : defaultValue

    let btnVal = this.props.btnVal || ''
    , btnClick = this.props.btnClick || function(){}
    , btnDisable = !!this.props.btnDisable
    , btnChecked = !!this.props.btnChecked
    , deviation = ( showBtn ? btnVal.length + 2 : 0 )
                  + ( isPassword ? 3 : 0 )


    if ( !isFunction( btnClick ) ) {
      throw TypeError('btnClick not function. Please entry function')
    }

    // console.log( 'input props: ', bgUrl, placeholder, type, onChange )
    return <div className="form-grounp">
      <label onFocus={(e)=>{ 
          this.setState({ showDeleteAll: true })
        }} onBlur={()=>{
          setTimeout(()=>{
            this.setState({ showDeleteAll: false })
          })
        }} htmlFor="" style={{ paddingRight: deviation + 'em' }}>
        <input onChange={ (e)=>{ 
          this.formChange( e, type )
        } } onKeyDown={ e => this.getCursorPosition()} ref="input" type={ _type || 'text'} className="form-control" defaultValue={ _defaultValue || ''} placeholder={placeholder || ''} style={{backgroundImage: `url(${bgUrl})`}} maxLength={ maxLength } />


        <span onClick={(e)=>{
          this.clearInput( "input" )
          setTimeout(()=>{
            this.setState({ showDeleteAll: true })
          })
        }} style={{display: againInput && showDeleteAll ? 'block' : 'none', right: deviation + 'em'}} className="again-input"></span>


        <span onClick={() => {
          this.setState({ showPassword: !showPassword })
        }} style={{display: isPassword ? 'block' : 'none', right: deviation - 3 + 'em'}} className={( showPassword ? 'show' : 'hide') +'-password'}></span>


        { showBtn ? <button onClick={ (e)=>{ btnClick(e) } } className={"btn "+ (btnChecked ? '' : 'btn-secondary ') +"btn-sm input-btn " + (btnDisable ? 'btn-disabled' :'') }>{ btnVal || '' }</button> : null}
      </label>
    </div>
  }
}

function isFunction(fn) {
   return Object.prototype.toString.call(fn)=== '[object Function]';
}