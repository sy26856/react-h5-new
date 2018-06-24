import React from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import SearchBar from './component/searchbar/SearchBar';
import Queue from './module/Queue';
import util from './lib/util';
import AppDownloadBanner from './component/AppDownloadBanner';

import './query-area-head.less';

export default class QueryArea extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();
    this.timer = null;
    this.corpId = query.corpId || '';
    this.state = {
      loading: true,
      data: null
    }
  }

  async componentDidMount() {
    const res = await Queue.queryCorpArea(this.corpId);
    res.subscribe(this).fetch();
  }

  onSuccess(result) {
    console.log(result);
    this.setState({
      loading: false,
      success: true,
      data: result.data,
      listData: JSON.parse(JSON.stringify(result.data))     //sb深拷贝
    });
  }

  search(z) {
    clearTimeout(this.timer);
    const value = z.target.value;
    this.timer = setTimeout(() => {
      const {data} = this.state;
      const listData = data.filter(item => item.areaName.indexOf(value) > -1);
      this.setState({
        listData,
      })
    }, 800);
  }

  renderItem(data, i) {
    const urlInfo = {
      corpId: data.corpId,
      area: data.area,
      target: '_blank'
    };
    return (
      <li className="list-item list-nowrap" key={i} style={{height: '69px'}}>
        <a href={`./queue-list.html?${util.flat(urlInfo)}`} className="txt-arrowlink list-link-wrapper">
          <div className="list-content">
            <div className="list-title txt-nowrap">{data.areaName}</div>
            <div className="list-brief txt-nowrap">{data.address}</div>
          </div>
        </a>
      </li>
    );
  }

  render() {
    const { listData } = this.state;

    return (
      <div>
        <SearchBar
          onChange={(z) => this.search(z)}
          placeholder="请输入诊区名搜索"
          style={{backgroundColor: '#fff'}}
          inputColor="#f9f9f9"
        />
        <div className="query-area-head">请选择诊区</div>
        <ul className="list-ord">
          {listData.map((item, i) => this.renderItem(item, i))}
        </ul>
        <AppDownloadBanner />
      </div>
    );
  }
}
