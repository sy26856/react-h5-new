import React from 'react';
import util from '../../lib/util';
import './TabBar.less';

export default class TabBar extends React.Component {

  constructor(props) {
    super(props);
    const query = util.query();
    this.corpId = query.corpId || '';
    this.unionId = query.unionId || '';
    try {
      this.showTabBar = (specialConfig.indexNav.hideCorpIds.indexOf(this.corpId) < 0) && (specialConfig.indexNav.hideUnionIds.indexOf(this.unionId) < 0);
    } catch (e) {
      console.log(e);
      this.showTabBar = false;
    }
  }

  render() {
    if (this.showTabBar) {
      return (
        <div className="tabbar-container">
          <a href={`./index-area2.html?unionId=${this.unionId}&target=_blank`}>医院</a>
          <a href={`./my.html?unionId=${this.unionId}&target=_blank`}>我的</a>
        </div>
      );
    }
    return null;
  }
}
