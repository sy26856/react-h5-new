import React from 'react';

export default class CorpItem extends React.Component {

  static defaultProps = {
    online: 1,
  };

  static propTypes = {
    data: React.PropTypes.object,
    myClick: React.PropTypes.func,
    corpName: React.PropTypes.string,
    corpLogo: React.PropTypes.string,
    label: React.PropTypes.string,
    tags: React.PropTypes.array,
    area: React.PropTypes.string,
    distanceStr: React.PropTypes.string,
  };

  myClick() {
    this.props.myClick();
  }

  render() {
    const { online, corpName, corpLogo, label, tags, area, distanceStr } = this.props;
    return (
      <li className="list-item" style={{overflow: 'hidden'}} onClick={() => this.myClick()}>
        <img className="list-icon hospital-icon"
             src={corpLogo} />
        <div className="list-content corp-list-item">
          <div className="list-title hospital-corpname">{corpName}</div>
          <div className="list-brief">{label}</div>
          <div className="list-brief">
            <span className="hospital-distance">{area} {distanceStr}</span>
            <div className="hospital-tags">
              {tags.map((z, i) => <span key={i} className="hosptail-tags2">{z}</span>)}
            </div>
          </div>
        </div>
        {online == 0 && <div className="off-line-tag">未开通</div> }
      </li>
    )
  }
}