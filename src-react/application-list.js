import React from 'react';
import UserCenter from './module/UserCenter';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import util from './lib/util';
import './application-list.less';

export default class ApplicationList extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();
    this.unionId = query.unionId;

    this.timer = null;

    this.state = {
      loading: true,
      success: false,
    }
  }

  componentDidMount() {
    UserCenter.getWindowService(this.unionId, "H5").subscribe(this).fetch();
  }

  onSuccess(result) {

    this.setState({
      loading: false,
      success: true,
      data: result.data || [],
      tempData: result.data || [],
    });
  }

  getUrl(data, urlInfo) {
    const url = {};
    let urlStr = data.href || '';

    if (urlStr.indexOf('?') > -1) {
      urlStr += '&';
    } else {
      urlStr += '?';
    }
    if (data.status != 1) {
      url.href = `${urlStr}${util.flat(urlInfo)}`;
    }
    return url;
  }

  renderPanel(data, i) {
    const urlInfo = {
      unionId: this.unionId,
      target: '_blank'
    };
    return (
      <div className="application-list-panel" key={'a' + i} data-spm={'panel' + data.value}>
        <div className="application-list-title">{data.title || ''}</div>
        <div className="application-list-line" />
        <div className="grid-bottom-container">
          {data.windowList.map((item, i) =>
            <a className="grid-bottom-box" key={'b' + i} {...this.getUrl(item, urlInfo)} data-spm={item.code}>
              <div className="grid-bottom-logo">
                <img src={item.windowImage}/>
              </div>
              <p>{item.windowName}</p>
              {item.status == 1 ? <div className="not-online"></div> : null}
              {item.status == 2 ? <div className="new-online"></div> : null}
            </a>
          )}
        </div>
      </div>
    );
  }

  searchApplication() {
    clearInterval(this.timer);
    this.timer = setTimeout(() => {
      const value = this.refs.input.value;
      let {tempData, data} = this.state;
      tempData = JSON.parse(JSON.stringify(data));
      for (let i = 0; i < data.length; i++) {
        tempData[i].windowList = data[i].windowList.filter(z => z.windowName.indexOf(value) > -1);
      }
      this.setState({
        tempData,
      })
    }, 1000);
  }

  searchBar() {
    return (
      <div className="application-input-container">
        <span className="icon-search input-search-position"></span>
        <input ref="input" placeholder="搜索您需要的服务" onChange={(e) => this.searchApplication(e)}/>
      </div>
    );
  }

  searchPanel(item, i) {
    if (item.windowList && item.windowList.length > 0) {
      return (
        <div key={'search-panel' + i}>
          <div className="application-list-title"
               style={{backgroundColor: '#f9f9f9', border: 'none'}}>
            {item.title || ''}
          </div>
          <div style={{backgroundColor: '#fff'}}>
            {item.windowList.map((sItem, j) => this.searchItem(sItem, j))}
          </div>
        </div>
      );
    }
    return null
  }

  searchItem(data, i) {
    const urlInfo = {
      unionId: this.unionId,
      target: '_blank'
    };

    return (
      <div className="application-list-container">
        <div className="list-item" key={'search-item' + i}>
          <a className="list-link-wrapper" {...this.getUrl(data, urlInfo)}>
          <span
            className="icon-pic list-icon-sm"
            style={{backgroundImage: `url(${data.windowImage})`}}
          />
            <div className="list-content">
              <div className="list-title ">{data.windowName}</div>
            </div>
          </a>
        </div>
        {data.status == 1 ? <div className="not-online"></div> : null}
        {data.status == 2 ? <div className="new-online"></div> : null}
      </div>
    );
  }

  searchList() {
    const {tempData} = this.state;
    return (
      <div>
        {tempData.map((item, i) => this.searchPanel(item, i))}
      </div>
    );
  }

  render() {
    const {tempData} = this.state;
    let haveData = false;
    tempData && tempData.forEach((z) => {
      z.windowList.length > 0 ? haveData = true : null;
    });

    if (this.refs.input && this.refs.input.value) {
      return (
        <div>
          {this.searchBar()}
          {haveData ? this.searchList() : <div className="notice">
              <span className="notice-icon icon-o-search"></span>
              <p>未找到符合条件的应用</p>
              <p>请更换搜索词进行查询</p>
            </div>}
        </div>
      );
    }

    if (haveData) {
      return (
        <div>
          {this.searchBar()}
          {tempData.map((z, i) => this.renderPanel(z, i))}
        </div>
      );
    }
  }
}