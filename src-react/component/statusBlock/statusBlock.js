import React from 'react';
import util from '../../lib/util';

let self = null;

export default class statusBlock extends React.Component {

  constructor(props) {
    super(props);
    self = this;
    const query = util.query();
    this.unionId = query.unionId || '';
    this.state = {
      show: false
    };
  }

  cancel = () => {
    this.setState({
      show: false,
    });
  };

  bindCard = () => {
    const patientId = localStorage.getItem('patientId') || '';
    const patientName = localStorage.getItem('patientName') || '';
    const patientIdNo = localStorage.getItem('patientIdNo') || '';
    const urlInfo = {
      patientId,
      patientName,
      patientIdNo,
      unionId: this.unionId,
      selectPatient: 1,
      redirect: encodeURIComponent(`${window.location.href}`),
      target: '_blank'
    };
    window.location.href = `./bind-card.html?${util.flat(urlInfo)}`;
  };

  render() {
    if (this.state.show) {
      return (
        <div className="modal-mask">
          <div className="modal-wrapper">
            <div className="modal">
              <div className="modal-body txt-insign ">请先绑定有效就诊卡，再预约挂号</div>
              <div className="modal-footer">
                <div className="modal-button-group-h">
                  <a className="modal-button" style={{color: '#333'}} onClick={this.cancel}>取消</a>
                  <a className="modal-button" style={{color: '#76acf8'}} onClick={this.bindCard}>前往绑卡</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
}

statusBlock.show = () => {
  self.setState({
    show: true,
  });
};
