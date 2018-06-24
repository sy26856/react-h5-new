import React from 'react';
import './styletest.less';

export default class StyleTest extends React.Component {

  hybridFunc() {
    return new Hybrid("callCar", {
      corpName: '青岛开发区第一人民医院',
      corpAddress: '山东省青岛市黄岛区黄浦江路9号',
      lat: '35.963554',
      lon: '120.189926'
    }).send()
  }

  render() {
    return (
      <div>
        <div className='no-name' style={{ padding: 50 }}>
          <label className="checkbox-wrapper" htmlFor="checkbox">
            <input ref="noname" className="no-name-checkbox" defaultChecked={true} type="checkbox" name="checkbox"
                    id="checkbox"/>匿名评价
          </label>
        </div>
        <div className="btn-wrapper">
          <button onClick={() => this.hybridFunc()} className="btn btn-block">滴滴打车</button>
        </div>
      </div>
    );
  }
}
