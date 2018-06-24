import React from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import getLocation from './lib/getLocation';
import './leaf-corp.less';

export default class LeafCorp extends SmartBlockComponent {

  constructor(props) {
    super(props);
    this.state = {
      leafList: [],
      loading: true,
      lat: '',
      lng: '',
      distanceSuccess: false,
      distanceError: false,
    };
    const query = util.query();
    this.corpId = query.corpId || '';
    this.type = query.type || '';
    this.unionId = query.unionId || '';
  }

  componentDidMount() {
    const funcionId = this.type === '0' ? 1 : 2;
    this.initMap();
    UserCenter.getLeafCorp(this.corpId, funcionId).subscribe(this).fetch();
  }

  onSuccess(result) {
    console.log(result);
    this.setState({
      title: result.data.parentName,
      leafList: result.data.leafList,
      loading: false,
      success: true,
    });
  }

  async initMap() {
    try {
      const location = await getLocation();
      this.setState({
        lat: location.lat,
        lng: location.lng,
        distanceSuccess: true,
      });
    } catch (e) {
      this.setState({
        distanceError: true,
      })
    }
  }

  toReg(data) {
    const regMode = this.type == 1 ? 2 : 1;
    if (data.online == 1) {
      window.location.href = `./sections.html?regMode=${regMode}&unionId=${this.unionId}&corpId=${data.corpId}&target=_blank`
    }
  }

  renderItem(data, i) {
    const {lat, lng, distanceSuccess, distanceError} = this.state;
    const distanceNum = util.getFlatternDistance(lat, lng, data.lat, data.lng);
    let distanceStr = distanceSuccess ? util.distanceFormat(distanceNum) : '';

    if (distanceError) {
      distanceStr = ''
    }

    return (
      <li className="list-item list-nowrap" key={i} onClick={() => this.toReg(data)}>
        <div className="list-content">
          <div className="list-title txt-nowrap">{data.name}</div>
          <div className="list-brief">
            <span className="hospital-distance">{data.area} {distanceStr}</span>
            <div className="hospital-tags">
              {data.funcTagList.map((z, i) => <span key={i} className="hosptail-tags2">{z}</span>)}
            </div>
          </div>
        </div>
        {data.online == 0 && <div className="off-line-tag">未开通</div> }
      </li>
    );
  }

  render() {
    const {leafList, title} = this.state;
    return (
      <div>
        <div className="leaf-corp-title">选择{title}下属院区 (机构)</div>
        <ul className="list-ord">
          {leafList.map((z, i) => this.renderItem(z, i))}
        </ul>
      </div>
    );
  }
}
