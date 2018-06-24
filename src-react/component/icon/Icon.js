import React, {PropTypes} from 'react';
import './icon.less';
//引入图片懒加载组件
import LazyLoad from 'react-lazyload';
export default class Icon extends React.Component {

  static defaultProps = {
    width: '42px',
    height: '42px',
    circle: false,
    style: PropTypes.object,
  };

  static propTypes = {
    url: PropTypes.string.isRequired,
    width: PropTypes.string,
    height: PropTypes.string,
    circle: PropTypes.bool,
  };

  render() {

    const { url, width, height, circle, style } = this.props;

    return (
      <LazyLoad offset={100} once={true}>
        <span
        className="background-icon"
        style={{
          backgroundImage: `url(${url})`,
          width,
          height,
          borderRadius: circle ? '50%' : '0',
          ...style
        }}
      />
      </LazyLoad>
    )
  }
}
