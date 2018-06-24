/*
 * @Author: saohui 
 * @Date: 2017-09-19 11:14:44 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-19 13:59:56
 */
import React, { PropTypes } from 'react'
import News from './News'
import util from '../../lib/util'

export default class Artical extends News {
  static propTypes = {
    unionId: PropTypes.string
  }

  constructor ( props ) {
    super( props )
  }
  init () {
    this.handleNewsMore('doctorArtical')
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

    return <div className="panel listen-doct-article">
      <div className="panel-title ">医生文章</div>
      <ul className="list-ord">
      { list.slice( 0, fold ? 3 : undefined ).map(( item, key ) => {
          //<a key={ key } className="panel-title list-link-wrapper txt-nowrap">{ item.title }</a>
          return <li key={ key } className="list-item list-nowrap">
            <a href={'./news-detail.html?'+ param +'&'+ util.flat({ id: item.id })} className="list-content">{ item.title }</a>
          </li>
      })}
      </ul>
      {( !isFinished || fold ) && list.length > 3 ? <div onClick={ this.handleNewsMore.bind( this, 'doctorArticalData')} className="listen-doct-see-more">
        <span>查看更多</span>
      </div> : null }
    </div>
  }
}