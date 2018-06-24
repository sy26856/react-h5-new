import React from 'react'
import './search-bar.less'

export default class SearchBar extends React.Component {

  static defaultProps = {
    focus: false,
    style: {},
    inputColor: '#fff'
  };

  static propTypes = {
    style: React.PropTypes.object,
    inputColor: React.PropTypes.string,
    onChange: React.PropTypes.func,
    onSubmit: React.PropTypes.func,
    clearInput: React.PropTypes.func,
    placeholder: React.PropTypes.string,
    throttle: React.PropTypes.number,
    ele:React.PropTypes.element,
  }

  state = {
    focus: false,
  }

  changeValue(z) {
    this.props.onChange(z)
  }

  submit(e) {
    this.props.onSubmit && this.props.onSubmit(e)
  }

  focus = () => {
    this.setState({
      focus: true
    })
  }

  blur = () => {
    this.setState({
      focus: false
    })
  }

  render() {
    const {focus} = this.state;
    const {inputColor,ele} = this.props;
    return (
      <div className="search-position" ref="container">
        <div className="search-wrapper search-focus" style={this.props.style}>
          <div className="search" style={{backgroundColor: inputColor,flex:1}}>
            <span className="search-icon icon-search"></span>
            <div className="search-text">搜索医院、医生</div>
            <form className="search-input search-input-no-border" action="javascript:;">
              <input
                placeholder={this.props.placeholder}
                ref="input"
                type="search"
                onFocus={this.focus}
                onChange={(z) => this.changeValue(z)}
                onKeyDown={(z) => this.submit(z)}
                className="search-input search-input-no-border"
                style={{ width: '100%'}}
                defaultValue={ this.props.defaultValue }
              />
            </form>
          </div>
          {ele}
        </div>
      </div>
    )
  }
}