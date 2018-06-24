import React from 'react'
import './create-consultation.less'

import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import UserCenter from './module/UserCenter'
import util from './lib/util'

export default class CorpInfo extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();
    this.corpId = query.corpId || '';
    this.unionId = query.unionId || '';
    this.state = {
      loading: true,
      data: null,
    };
  }

  componentDidMount() {
    UserCenter.getCorpHome(this.corpId, this.unionId).subscribe(this).fetch();
  }

  onSuccess(result) {
    this.setState({
      loading: false,
      success: true,
      data: result.data,
    });
  }

  renderError() {
    return (
      <section className="corp-info-error">
        <i></i>
        <div className="corp-info-error-tips">{this.state.msg}</div>
      </section>
    );
  }

  renderContainer() {
    const {data} = this.state;

    return (
      <div>
        <div className="corp-info-list list-item list-nowrap list-item-action">
          <span className="icon-pic list-icon corp-info-logo" style={{backgroundImage: `url(${data.logo})`}}/>
          <div className="list-content">
            <div className="list-title txt-nowrap">{data.name}</div>
            <div className="corp-info-tags txt-nowrap">{data.tags.join(' ')}</div>
            <div className="corp-info-address txt-nowrap">{data.address}</div>
          </div>
        </div>

        <div className="corp-info-detail" dangerouslySetInnerHTML={{__html: data.corpInfo}}></div>
      </div>
    );
  }

  render() {
    return <div className='create-consultation'>
      {this.renderContainer()}
    </div>
  }
}