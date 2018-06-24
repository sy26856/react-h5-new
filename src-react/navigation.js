'use strict'

import './navigation.less'
import React from 'react'
import util from './lib/util'
import hybridAPI from './lib/hybridAPI'
import {SmartNoBlockComponent} from './BaseComponent/index'


export default class Navigation extends React.Component {
  constructor(props) {
    super(props)
    this.list = corpLocations
    this.query = util.query()
    this.util = util
    this.state = {
      btnShow: false
    }
  }

  componentDidMount() {
    if (util.isInYuantuApp() && util.getPlatform() === 'android') {
      hybridAPI.banRefresh();
    }
    this.lonLat = this.list[this.query.corpId] ? this.list[this.query.corpId].LonLat : []
    let title = this.list[this.query.corpId] ? this.list[this.query.corpId].name : '导航'

    if (this.util.isInYuantuApp()) {

      hybridAPI.setTitle(decodeURIComponent(title))

      if (this.util.getPlatform() == 'ios') {
        if (this.util.version.gt(2, 2, 2)) {
          this.setState({
            btnShow: true
          })
        }
      } else if (this.util.getPlatform() == 'android') {
        if (this.util.version.gt(2, 1, 16)) {
          this.setState({
            btnShow: true
          })
        }
      }
    }

    if (this.lonLat.length) {
      this.map = new AMap.Map("container", {
        resizeEnable: true,
        zoom: 15,
        center: this.lonLat
      });

      this.addMarker();

      if (this.util.IsPC()) {
        this.map.plugin(["AMap.ToolBar"], () => {
          this.map.addControl(new AMap.ToolBar());
        });
      }
    }
  }

  addMarker() {

    var marker = new AMap.Marker({
      map: this.map,
      position: this.lonLat
    });

    var infoWindow = new AMap.InfoWindow({
      content: "<b style='font-size:14px'>" + this.list[this.query.corpId].name + "</b></br><span style='font-size:14px'>电话：" + this.list[this.query.corpId].tel + "</span></br><span style='font-size:14px'>地址：" + this.list[this.query.corpId].address + "</span>",
      offset: {x: 0, y: -30}
    });

    this.makerAnimation(marker);

    setTimeout(() => {
      this.stopMove(marker, infoWindow);
    }, 1200);

    marker.on("touchstart", (e) => {
      infoWindow.open(this.map, marker.getPosition());
    });
  }

  btnClick() {
    hybridAPI.skipNavigation(this.lonLat)
  }

  makerAnimation(mar) {
    mar.setAnimation('AMAP_ANIMATION_BOUNCE');
  }

  stopMove(mar, infoWin) {
    mar.setAnimation('AMAP_ANIMATION_NONE');
    infoWin.open(this.map, mar.getPosition());
  }

  render() {
    return (
      <div className='map-container'>
        {
          this.list[this.query.corpId] ?
            <div className='map-box'>
              <div id="container"></div>
              {
                this.state.btnShow ?
                  <div className="btn-wrapper">
                    <button className="btn btn-secondary btn-block" onTouchStart={this.btnClick.bind(this)}>
                      使用地图导航
                    </button>
                  </div>
                  :
                  null
              }
            </div>
            :
            <div className="notice">
              <span className="notice-icon icon-record"></span>
              <p>没有录入地理信息</p>
            </div>
        }
      </div>
    )
  }
}