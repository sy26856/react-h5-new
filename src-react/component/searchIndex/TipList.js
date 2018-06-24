import React, {PropTypes} from 'react';

export default class TipList extends React.Component {

  static propTypes = {
    tipsList: PropTypes.array,
    toDetail: PropTypes.func
  };

  toDetail(words) {
    const {toDetail} = this.props;
    try {
      let searchIndex = localStorage.getItem('searchIndex') || '[]';
      searchIndex = JSON.parse(searchIndex);
      searchIndex.indexOf(words) == -1 && searchIndex.push(words);
      searchIndex.length > 30 && searchIndex.shift();
      const result = JSON.stringify(searchIndex);
      localStorage.setItem('searchIndex', result);

      toDetail(words);
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    const {tipsList} = this.props;
    if (tipsList && tipsList.length > 0) {
      return (
        <ul className="list-ord">
          {
            tipsList.map((item, index) =>
              <li className="list-item" key={`tip${index}`} onClick={() => this.toDetail(item)}>
                <a className="txt-arrowlink list-link-wrapper">
                  <div className="list-content">
                    {item}
                  </div>
                </a>
              </li>
            )
          }
        </ul>
      );
    }
    return <div className="notice">
      <span className="notice-icon icon-record" />
      <p>未找到相关内容</p>
    </div>
  }
}
