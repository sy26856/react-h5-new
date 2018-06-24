/*
 * @Author: saohui 
 * @Date: 2017-08-17 13:46:13 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-05 15:10:17
 */
import React, { Component, PropTypes } from 'react'
import util from '../../lib/util'
import './TagList.less'

/**
 * 实现功能
 * 1. 标签渲染：组件的子元素进行传递标签
 *    <TagList>
 *     <div>第一个标签</div>
 *     <div disabled checked>第二个标签</div>
 *    </TagList>
 * 2. 子标签无论是何元素，最终渲染的时候将被 div 替换
 * 3. 传出选中：
 *  1) 选中状态使用 checked 来改变样式
 *  2) 不可选使用 disabled
 *  3) 可以直接采用 事件进行传递，会把传进行的事件进行全部注册
 * @export props = {
 *    showMore: true / false => 是否可以加载更多
 * }
 */
export default class TagList extends Component {

  static propTypes = {
    showMore: PropTypes.bool
  }

  WRAPPER_HEIGHT = 76

  constructor ( props ) {
    super( props )

    this.state = {
      isMore: true
      ,needMore: null
    }
  }

  componentDidUpdate () {
    if ( this.state.needMore == null ) {
      let needMore = true
      if ( this.refs.J_TagsWrapper.offsetHeight <= this.WRAPPER_HEIGHT ) {
        needMore = false
      }
      this.setState({
        needMore
        ,isMore: false
      })
    }
  }

  render () {
    const tabs = util.arrDeepFlattenL( this.props.children )
    const { isMore, needMore } = this.state
    const { showMore, className } = this.props

    const containerProps = {
      ...this.props
      ,className: 'tags-container '+ ( className ? className : '')
    }
    delete containerProps.showMore
    
    return <div { ...containerProps }>
      <div ref='J_TagsWrapper' className="tags-wrapper" style={{ maxHeight: isMore ? '' : this.WRAPPER_HEIGHT }}>
        {
          tabs && tabs.length > 0 ? tabs.map(( item, key ) => {
            const props = item.props
            let itemClassName = 'tag tag-blue '
                                + ( props.checked ? 'tab-checked ' : '')
                                + ( props.disabled ? 'tab-disabled ' : '')
                                + ( props.className || '')
            return <div 
                  key={ key }
                  { ...props }
                  className={ itemClassName }>
              </div>
          }) : null
        }
      </div>
      <span className="tags-more" style={{ display: !showMore || !needMore ? 'none' : 'block', transform: !isMore ? '' : 'rotate(180deg)' }} onClick={() => {
          this.setState({
            isMore: !this.state.isMore
          })
        }}></span>
    </div>
  }
}