/*
 * @Author: saohui 
 * @Date: 2017-09-19 08:37:33 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-10-23 08:40:35
 */
import React, { Component, PropTypes } from 'react'
import '../../doctor-profile.less'

export default class Profile extends Component {

  static propTypes = {
    needMore: PropTypes.bool

    ,title: PropTypes.string
    ,content: PropTypes.string
  }

  constructor ( props ) {
    super( props )

    this.state = {
      isMore: false
    }
  }

  render () {
    const { title, content, needMore } = this.props

    const { isMore } = this.state

    return <div className="doctor-profile">
      <div className="be-good-at">
        <header className="title">
          <h2>{ title }</h2>
        </header>
        <section className="content" >
          <p className={'content-text '+ ( needMore && isMore ? '' : 'txt-overflow-two')}>{ content || '无' }</p>
          { needMore ? <span className="tags-more" style={{ display: ( content && content.length > 40 ? 'block' : 'none' ), height: 12, marginTop: 12, transform: isMore ? 'rotate(180deg)' : '' }} onClick={() => {
            this.setState({
              isMore: !isMore
            })
          }}></span> : null }
        </section>
      </div>
    </div>
  }
}