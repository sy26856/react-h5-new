/*
 * @Author: saohui 
 * @Date: 2017-09-19 11:14:44 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-19 11:35:42
 */
import React, { PropTypes } from 'react'
import News from './News'
import util from '../../lib/util'

export default class ListenDoctor extends News {
  static propTypes = {
    unionId: PropTypes.string
  }

  constructor ( props ) {
    super( props )
  }
  init () {
    this.handleNewsMore('listenDoctorData')
  }

  render () {
    const { list, fold, isFinished } = this.state

    if ( list.length == 0 ) {
      return null
    }

    const { unionId } = this.props
    const param = util.flat({
      unionId
      ,target: '_blank'
    })

    return <div className="panel g-space">
      <div className="panel-title">听医说课程</div>
        <div>
        { list.slice( 0, fold ? 3 : undefined ).map(( item, key ) => {
            return <a href={'./news-detail.html?'+ param +'&'+ util.flat({ id: item.id })} key={ key } className="img-link-wrapper list-link-wrapper">
              <img src={ item.titleImg } alt="" />
            </a>
        })}
        </div>
      {( !isFinished || fold ) && list.length > 3 ? <div onClick={ this.handleNewsMore.bind( this, 'listenDoctorData')} className="listen-doct-see-more">
          <span>查看更多</span>
      </div> : null }
    </div>
  }
}