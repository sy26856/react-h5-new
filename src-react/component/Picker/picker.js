import React from 'react'
import './picker.less'


export default class Picker extends React.Component {
    static propTypes = {
      type:React.PropTypes.string,//三级 必传  
      listData:React.PropTypes.array,//一级 必传
      isShow: React.PropTypes.bool,//必传 
      onCancel: React.PropTypes.func,//必传 
      onConfirm: React.PropTypes.func,//必传 
      maxDate:React.PropTypes.string,//最大日期 可传可不传  不传有默认
      minDate:React.PropTypes.string,//最小日期 同上
    }
  
    constructor(props) {
      super(props)
      this.state={
        list_0:[],//第一级数据
        list_1:[],//第二级数据
        list_2:[],//第三级数据

        selectValue_0:'',//第一级被选中索引
        selectValue_1:'',//第二级被选中索引
        selectValue_2:'',//第三级被选中索引

        selectIndex_0:'',//第一级被选中值
        selectIndex_1:'',//第二级被选中值
        selectIndex_2:'',//第三级被选中值
      }
    }
  
    componentWillReceiveProps(next){
        if(next.isShow){
            if(next.type=='date'){
                this.initDate()
            }else if(next.type=='city'){
                this.initCity()
            }else if(!next.type){//自定义的数据
                this.init()
            }
        }
    }
    
    /**
     * 初始化默认值
     */

    //初始化自定义数据
    init(){
        let list_0=this.props.listData;
        this.setState({
            list_0,
            selectIndex_0:list_0.length-1,
            selectValue_0:list_0[list_0.length-1],
          },()=>{
            this.select(this.refs['first'],this.refs['item'].clientHeight) //只有第一级
        })
    }

    //初始化日期
    initDate(){
      /**
       * @maxDate  最大日期,默认为今天 格式 2018-5-26
       * @minDate  最小日期,默认为10年前的今天 格式 2008-5-26
       * 
       */
      let {maxDate,minDate}=this.props;
      let {list_0,list_1,list_2}=this.state,
          //获取当天年月日
          year=new Date().getFullYear(),
          month=new Date().getMonth() + 1,
          date=new Date().getDate(),
          //格式化当天日期
          today = year+'-'+month+'-'+date,
          //默认最小日期10年前的今天
          year_10= year-10,
          today_10=year_10+'-'+month+'-'+date;
          /**
           * 1.最大最小日期都没有传入,使用默认值;
           * 2.只传入最大日期,最小日期-10;
           * 3.只传入了最小日期,最大日期+10
           */
          if(!maxDate&&!minDate){
            maxDate = today;
            minDate = today_10
          }else if(maxDate&&!minDate){
            let arr_max = maxDate.split('-'),
                max_yy=Number(arr_max[0]),
                max_mm=Number(arr_max[1]),
                max_dd=Number(arr_max[2]);
                minDate=max_yy-10+'-'+max_mm+'-'+max_dd
          }else if(!maxDate&&minDate){
            let arr_min = minDate.split('-'),
                min_yy=Number(arr_min[0]),
                min_mm=Number(arr_min[1]),
                min_dd=Number(arr_min[2]);
                maxDate=min_yy+10+'-'+min_mm+'-'+min_dd
          }

          let arr_max = maxDate.split('-')
          let arr_min = minDate.split('-')
          this.max_yy=Number(arr_max[0]),
          this.max_mm=Number(arr_max[1]),
          this.max_dd=Number(arr_max[2]),
          this.min_yy=Number(arr_min[0]),
          this.min_mm=Number(arr_min[1]),
          this.min_dd=Number(arr_min[2]);
          //得到年份数据
          for(let i=0;i<=(this.max_yy - this.min_yy);i++){
            list_0.push(this.min_yy+i)
          }
          //得到月份数据
          for(let i=1;i<=this.max_mm;i++){
              list_1.push(i)
            }
          //得到天数据
          for(let i=1;i<=this.max_dd;i++){
            list_2.push(i)
          }

        let index_0=list_0.length-1,
            index_1=list_1.length-1,
            index_2=list_2.length-1;
            
        this.setState({
          list_0,
          list_1,
          list_2,

          selectIndex_0:index_0,
          selectIndex_1:index_1,
          selectIndex_2:index_2,

          selectValue_0:list_0[index_0],
          selectValue_1:list_1[index_1],
          selectValue_2:list_2[index_2]
        },()=>{
          this.selectDate(this.refs['first'],this.refs['item'].clientHeight,0) //第一级
          this.selectDate(this.refs['second'],this.refs['item'].clientHeight,1) //第二级
          this.selectDate(this.refs['thrid'],this.refs['item'].clientHeight,2) //第三级  
          })
    }

    //初始化省市县
    initCity(){
        /**
         * @province   默认列表最后一个
         * @city       默认列表最后一个 
         * @country    默认列表最后一个
         * @street     默认列表最后一个
         */
       let url = 'https://restapi.amap.com/v3/config/district',
           data={
            key:'54ca62905d12a5ff51564e462de39791',//高德地图key
            keywords:'中国',
            subdistrict:'4'
           };
           //http://restapi.amap.com/v3/config/district?key=54ca62905d12a5ff51564e462de39791&keywords=中国&subdistrict=4
            getCityMap(url,data,(res)=>{
              this.initCityList(res)
            })
    }

    //初始化省市县数据
    initCityList(res){
     
        let {list_0,list_1,list_2}=this.state
          // CityMap
          //所有省份数据,排除港澳台,因为高德api没有提供
        let allData = res.districts[0].districts
         for(let val of allData){
           if(val.adcode!=810000&&val.adcode!=710000&&val.adcode!=820000){
              CityMap.push(val)
           }
         }
        for(let val of CityMap){
              list_0.push({name:val.name,adcode:val.adcode})//需要使用adcode的唯一性进行筛选
        }
        //默认省份对应的市区数据,默认省份为length-1
        for(let val of CityMap[CityMap.length-1].districts){
          list_1.push({name:val.name,adcode:val.adcode})
        }
  
        let city = CityMap[CityMap.length-1].districts
        //默认县数据
        for(let val of city[city.length-1].districts){
          list_2.push({name:val.name,adcode:val.adcode})
        }
  
        let index_0=list_0.length-1,
            index_1=list_1.length-1,
            index_2=list_2.length-1;
  
        this.setState({
          list_0,
          list_1,
          list_2,
          selectIndex_0:index_0,
          selectIndex_1:index_1,
          selectIndex_2:index_2,
          selectValue_0:list_0[index_0].name,
          selectValue_1:list_1[index_1].name,
          selectValue_2:list_2[index_2].name
        },()=>{
          this.selectCity(this.refs['first'],this.refs['item'].clientHeight,0) //第一级
          this.selectCity(this.refs['second'],this.refs['item'].clientHeight,1) //第二级
          this.selectCity(this.refs['thrid'],this.refs['item'].clientHeight,2) //第三级  
          })
    }  

    /**
     *滑动选择 
     */

    //滑动选择日期
    selectDate(li,itemHeight,level){
        //以下数据中有值的变量只是页面一加载时用,手指触摸需要全部更新
        let list =  this.state['list_'+level]; 
        let initY,//手指接触时的坐标
            endY,//手指离开时的坐标
            moveY,//translateY
            selectIndex,//当前被选中的索引
            selectValue,//被选中的值
            initLen = list.length-3,//初始化
            Y,//移动过程中的纵轴差值
            maxIndex=list.length-1;//当前list最大索引

        //默认选中最大日期或者当天日期
        li.style['-webkit-transform']='translate3d(0,'+(-initLen*itemHeight)+'px,0)';
  
        li.addEventListener('touchstart',(e)=>{
          e.preventDefault()
          e.stopPropagation()
          //更新list,maxIndex,initLen
          list =  this.state['list_'+level]; 
          maxIndex=list.length-1;
          initLen = list.length-3;//初始化
          selectIndex=this.state['selectIndex_'+level]//当前选中的值
          moveY=Number(li.style['-webkit-transform'].split(',')[1].replace('px',''))//得到translateY的值
          initY = e.targetTouches[0].pageY;
          
        })
  
        li.addEventListener('touchmove',(e)=>{
          let curY = e.targetTouches[0].pageY;
          Y=curY-initY
          li.style['-webkit-transform']='translate3d(0,'+(moveY+Y)+'px,0)'
        })
  
        li.addEventListener('touchend',(e)=>{
          endY = e.changedTouches[0].pageY;
          let res = Number(endY-initY)/itemHeight,
              index,//滑动后的索引 
              disIndex,//滑动前后索引差值
              curIndex; //实际应该的滑动距离
          if(Math.abs(res-parseInt(res)>0)){
              if(res>0){//下滑
                disIndex=parseInt(res)+1
                index=selectIndex-parseInt(res)-1
              }else{//上滑
                disIndex=parseInt(res)-1
                index=selectIndex-parseInt(res)+1
              }
          }else{
            disIndex=parseInt(res)
            index=selectIndex-parseInt(res)
          }
  
          //设置最大以及最小滑动距离以及索引值
          if(index<=0){//下滑超出最小索引
            index =0;
            disIndex=0;
            curIndex=2*itemHeight;
          }else if(index>=maxIndex){//上滑超出最大索引
            index=maxIndex;
            disIndex=0;
            curIndex=-initLen*itemHeight;
          }else{//正常范围内滑动
            curIndex = moveY + disIndex*itemHeight
          }
          li.style['-webkit-transform']='translate3d(0,'+curIndex+'px,0)';
        
            if(level==0){//滑动选择年份
              if(index==0){//选中最小年份,更新月份和天的数据,并且将位置移动到对应位置上
                let list_1 = [],list_2=[]
                for(let i=1;i<=this.min_mm;i++){
                  list_1.push(i)
                }
                for(let i=1;i<=this.min_dd;i++){
                  list_2.push(i)  
                }
  
                let initLen_2=list_1.length-3,
                    initLen_3=list_2.length-3;
                this.refs['second'].style['-webkit-transform']='translate3d(0,'+(-initLen_2*itemHeight)+'px,0)';
                this.refs['thrid'].style['-webkit-transform']='translate3d(0,'+(-initLen_3*itemHeight)+'px,0)';

                this.setState({
                  list_1,
                  list_2,
                  selectIndex_0:0,
                  selectValue_0:list[0],
                  selectIndex_1:list_1.length-1,
                  selectIndex_2:list_2.length-1,
                  selectValue_1:list_1[list_1.length-1],
                  selectValue_2:list_2[list_2.length-1],
                })
              }else if(index==maxIndex){
                //如果选中了最大的年份,那么也需要更新月份和天的数据,并且将位置移动到对应位置上
                let list_1=[],list_2=[];
                for(let i=1;i<=this.max_mm;i++){
                  list_1.push(i)
                }
                for(let i=1;i<=this.max_dd;i++){
                  list_2.push(i)
                }
                let initLen_2=list_1.length-3,
                    initLen_3=list_2.length-3;
                this.refs['second'].style['-webkit-transform']='translate3d(0,'+(-initLen_2*itemHeight)+'px,0)';
                this.refs['thrid'].style['-webkit-transform']='translate3d(0,'+(-initLen_3*itemHeight)+'px,0)';
                this.setState({
                  selectIndex_0:index,
                  selectValue_0:list[index],
                  list_1,
                  list_2,
                  selectIndex_1:list_1.length-1,
                  selectIndex_2:list_2.length-1,
                  selectValue_1:list_1[list_1.length-1],
                  selectValue_2:list_2[list_2.length-1],
                })
              }else{
                //选中非最值年份
                let list_1=[],list_2=[];
                for(let i=1;i<=12;i++){
                  list_1.push(i)
                }
                for(let i=1;i<=31;i++){
                  list_2.push(i)
                }
                let initLen_2=list_1.length-3,
                    initLen_3=list_2.length-3;
                this.refs['second'].style['-webkit-transform']='translate3d(0,'+(-initLen_2*itemHeight)+'px,0)';
                this.refs['thrid'].style['-webkit-transform']='translate3d(0,'+(-initLen_3*itemHeight)+'px,0)';
                this.setState({
                  selectIndex_0:index,
                  selectValue_0:list[index],
                  list_1,
                  list_2,
                  selectIndex_1:list_1.length-1,
                  selectIndex_2:list_2.length-1,
                  selectValue_1:list_1[list_1.length-1],
                  selectValue_2:list_2[list_2.length-1],
                  })
                }
              }else if(level==1){//滑动选择月份
                  //需要特殊处理二月份,以及30天和31天
                    //需要特殊处理最大年份的月份与最小年份的月份
                  let year = this.state.selectValue_0,
                      month = list[index],
                      list_2=[],
                      moth_31=[1,3,5,7,8,10,12];
                      //31天
                      function is31(mon){
                        return moth_31.some((value)=>{
                          return value==mon
                        })
                      }        
                  if(month==2){
                    //区分平年还是闰年
                    if(year%400==0||year%4==0){
                        for(let i=1;i<=29;i++){
                          list_2.push(i)
                        }
                    }else{
                      for(let i=1;i<=28;i++){
                        list_2.push(i)
                      }
                    }
                  }else if(year==this.max_yy&&month==this.max_mm){//选中今天
                    for(let i=1;i<=this.max_dd;i++){
                      list_2.push(i)
                    }
                  }else if(year==this.min_yy&&month==this.min_mm){//选中早日期
                    for(let i=1;i<=this.min_dd;i++){
                      list_2.push(i)
                    }
                  }
                  else if(is31(month)){
                    for(let i=1;i<=31;i++){
                      list_2.push(i)
                    }
                  }else{
                    for(let i=1;i<=30;i++){
                      list_2.push(i)
                    }
                  }  
                let initLen_3=list_2.length-3;
                this.refs['thrid'].style['-webkit-transform']='translate3d(0,'+(-initLen_3*itemHeight)+'px,0)';
                this.setState({
                  selectIndex_1:index,
                  selectValue_1:list[index],
                  list_2,
                  selectIndex_2:list_2.length-1,
                  selectValue_2:list_2[list_2.length-1],
                  })
                  
              }else{//滑动选择天
                this.setState({
                  selectIndex_2:index,
                  selectValue_2:list[index],
                })
              }
            })
    }

    //滑动选择省市县
    selectCity(li,itemHeight,level){
        //以下数据中有值的变量只是页面一加载时用,手指触摸需要全部更新
        let list =  this.state['list_'+level]; 
        let initY,//手指接触时的坐标
            endY,//手指离开时的坐标
            moveY,//translateY
            selectIndex,//当前被选中的索引
            selectValue,//被选中的值
            initLen = list.length-3,//初始化
            Y,//移动过程中的纵轴差值
            maxIndex=list.length-1;//当前list最大索引

        //默认选中数据中最后一个值
        li.style['-webkit-transform']='translate3d(0,'+(-initLen*itemHeight)+'px,0)';
  
        li.addEventListener('touchstart',(e)=>{
          e.preventDefault()
          //更新list,maxIndex,initLen
          list =  this.state['list_'+level]; 
          maxIndex=list.length-1;
          initLen = list.length-3;//初始化
          selectIndex=this.state['selectIndex_'+level]//当前选中的值
          moveY=Number(li.style['-webkit-transform'].split(',')[1].replace('px',''))//得到translateY的值
          initY = e.targetTouches[0].pageY;
          
        })
  
        li.addEventListener('touchmove',(e)=>{
          let curY = e.targetTouches[0].pageY;
          Y=curY-initY
          li.style['-webkit-transform']='translate3d(0,'+(moveY+Y)+'px,0)'
        })
  
        li.addEventListener('touchend',(e)=>{
          endY = e.changedTouches[0].pageY;
          let res = Number(endY-initY)/itemHeight,
              index,//滑动后的索引 
              disIndex,//滑动前后索引差值
              curIndex; //实际应该的滑动距离单位值
          if(Math.abs(res-parseInt(res)>0)){
              if(res>0){//下滑
                disIndex=parseInt(res)+1
                index=selectIndex-parseInt(res)-1
              }else{//上滑
                disIndex=parseInt(res)-1
                index=selectIndex-parseInt(res)+1
              }
          }else{
            disIndex=parseInt(res)
            index=selectIndex-parseInt(res)
          }
  
          //设置最大以及最小滑动距离以及索引值
          if(index<=0){//下滑超出最小索引
            index =0;
            disIndex=0;
            curIndex=2*itemHeight;
          }else if(index>=maxIndex){//上滑超出最大索引
            index=maxIndex;
            disIndex=0;
            curIndex=-initLen*itemHeight;
          }else{//正常范围内滑动
            curIndex = moveY + disIndex*itemHeight
          }
          li.style['-webkit-transform']='translate3d(0,'+curIndex+'px,0)';
            if(level==0){//滑动选择省份
                //根据选中的省更新市县
                let list_1=[],list_2=[];
                for(let val of CityMap[index].districts){
                  list_1.push({name:val.name,adcode:val.adcode})
                }
                let city = CityMap[index].districts
                console.log(city)
                if(city[city.length-1].districts.length>0){//默认最后一个市下有数据
                  for(let val of city[city.length-1].districts){
                    list_2.push({name:val.name,adcode:val.adcode})
                  }
                  let initLen_2=list_1.length-3,
                      initLen_3=list_2.length-3;
                  this.refs['second'].style['-webkit-transform']='translate3d(0,'+(-initLen_2*itemHeight)+'px,0)';
                  this.refs['thrid'].style['-webkit-transform']='translate3d(0,'+(-initLen_3*itemHeight)+'px,0)';
                  this.setState({
                    selectIndex_0:index,
                    selectValue_0:list[index].name,
                    list_1,
                    list_2,
                    selectIndex_1:list_1.length-1,
                    selectIndex_2:list_2.length-1,
                    selectValue_1:list_1[list_1.length-1].name,
                    selectValue_2:list_2[list_2.length-1].name,
                    })
                }else{//县一级无数据
                  let initLen_2=list_1.length-3;
                  this.refs['second'].style['-webkit-transform']='translate3d(0,'+(-initLen_2*itemHeight)+'px,0)';
                  this.setState({
                    selectIndex_0:index,
                    selectValue_0:list[index].name,
                    list_1,
                    list_2:[],
                    selectIndex_1:list_1.length-1,
                    selectIndex_2:'',
                    selectValue_1:list_1[list_1.length-1].name,
                    selectValue_2:'',
                    })
                }
              }else if(level==1){//滑动选择市
                let {list_0,selectIndex_0}=this.state,list_2=[];
                // //根据市的adcode  找出对应的县,并且默认选中最后一个
                var country = CityMap[selectIndex_0].districts[index].districts //选中市下的所有县,有的没有数据,像西沙群岛
                if(country.length>0){
                  for(let val of country){
                    list_2.push({name:val.name,adcode:val.adcode})
                  }  
                  let initLen_3=list_2.length-3;
                  this.refs['thrid'].style['-webkit-transform']='translate3d(0,'+(-initLen_3*itemHeight)+'px,0)';
                  this.setState({
                    selectIndex_1:index,
                    selectValue_1:list[index].name,
                    list_2,
                    selectIndex_2:list_2.length-1,
                    selectValue_2:list_2[list_2.length-1].name,
                    })
                }else{//县一级没有数据
                  this.setState({
                    selectIndex_1:index,
                    selectValue_1:list[index].name,
                    list_2:[],
                    selectIndex_2:'',
                    selectValue_2:'',
                    })
                }              
              }else{//滑动选择县
                this.setState({
                  selectIndex_2:index,
                  selectValue_2:list[index].name,
                })
              }
            })
    }

    //滑动选择传入的自定义数据
    select(li,itemHeight){
        //以下数据中有值的变量只是页面一加载时用,手指触摸需要全部更新
        let list =  this.state.list_0; 
        let initY,//手指接触时的坐标
            endY,//手指离开时的坐标
            moveY,//translateY
            selectIndex,//当前被选中的索引
            selectValue,//被选中的值
            initLen = list.length-3,//初始化
            Y,//移动过程中的纵轴差值
            maxIndex=list.length-1;//当前list最大索引

        //默认选中最大日期或者当天日期
        li.style['-webkit-transform']='translate3d(0,'+(-initLen*itemHeight)+'px,0)';
  
        li.addEventListener('touchstart',(e)=>{
          e.preventDefault()
          //更新
          selectIndex=this.state.selectIndex_0//当前选中的值
          moveY=Number(li.style['-webkit-transform'].split(',')[1].replace('px',''))//得到translateY的值
          initY = e.targetTouches[0].pageY;
          
        })
  
        li.addEventListener('touchmove',(e)=>{
          let curY = e.targetTouches[0].pageY;
          Y=curY-initY
          li.style['-webkit-transform']='translate3d(0,'+(moveY+Y)+'px,0)'
        })
  
        li.addEventListener('touchend',(e)=>{
          endY = e.changedTouches[0].pageY;
          let res = Number(endY-initY)/itemHeight,
              index,//滑动后的索引 
              disIndex,//滑动前后索引差值
              curIndex; //实际应该的滑动距离
          if(Math.abs(res-parseInt(res)>0)){
              if(res>0){//下滑
                disIndex=parseInt(res)+1
                index=selectIndex-parseInt(res)-1
              }else{//上滑
                disIndex=parseInt(res)-1
                index=selectIndex-parseInt(res)+1
              }
          }else{
            disIndex=parseInt(res)
            index=selectIndex-parseInt(res)
          }
  
          //设置最大以及最小滑动距离以及索引值
          if(index<=0){//下滑超出最小索引
            index =0;
            disIndex=0;
            curIndex=2*itemHeight;
          }else if(index>=maxIndex){//上滑超出最大索引
            index=maxIndex;
            disIndex=0;
            curIndex=-initLen*itemHeight;
          }else{//正常范围内滑动
            curIndex = moveY + disIndex*itemHeight
          }
          li.style['-webkit-transform']='translate3d(0,'+curIndex+'px,0)';
          console.log(index)
            this.setState({
                selectIndex_0:index,
                selectValue_0:list[index],
            })          
        })
    }

    //取消回调
    onCancel(){
      this.props.onCancel()
    }
    
    //确认回调
    confirm(){
        let {type}=this.props,
            {selectIndex_0,
                selectIndex_1,
                selectIndex_2,
                selectValue_0,
                selectValue_1,
                selectValue_2}=this.state,
                listData;
        !type?listData={first:selectValue_0,}:listData={
            first:selectValue_0,
            second:selectValue_1,
            thrid:selectValue_2
        }

        //只将选中的值传过去,具体值怎么用,看具体需求
        this.props.onConfirm(listData)
    }
  
    render() {
      let {
            list_0
            ,list_1
            ,list_2

            ,selectIndex_0
            ,selectIndex_1
            ,selectIndex_2
            
            ,selectValue_0
            ,selectValue_1
            ,selectValue_2}=this.state
            
            ,{isShow,type}=this.props
            ,allList=[list_0,list_1,list_2]
            ,selectIndex=[selectIndex_0,selectIndex_1,selectIndex_2];

      if(!type)floors=['first'];
      console.log(floors)
      if(isShow){
        return <div className='picker' onClick={()=>this.props.onCancel()}>
                <div className='_modal' onClick={(e) => {e.stopPropagation()}}>
                    <div className='header'>
                      <div className='concael' onClick={()=>this.props.onCancel()}>取消</div>
                      <div className='confirm' onClick={()=>this.confirm()}>确认</div>
                    </div>
                    <ul className={'content '+(!type?' content_2':'')}>
                      {
                        floors.map((val,id)=>{
                          return <li className={'block '+(!type?'block_2':'')} ref={val} key={id}>
                                  {
                                    allList[id].map((item,index)=>{
                                      return <div 
                                                  key={index} 
                                                  className='item' 
                                                  ref='item' 
                                                  style={index==selectIndex[id]?{fontSize:'20px'}:{fontSize:'14px'}}>{type=='city'?item.name:item}</div>})
                                  }
                          </li>
                        })
                      }
                      <div className='line'></div>
                    </ul>
                </div>
              </div>
      }else{
        return null
      }
     
    }
    
  }

  /**
   * 配置数据
   * @floors   数据层级
   * @CityMap  行政区域总数据
   * @getCityMap 请求高德api获取全国行政区域数据ajax
   */
  var floors = ['first','second','thrid'];

  var CityMap=[];

  var getCityMap = function(url,data,success){
    var ajax = new XMLHttpRequest()
    // get请求
    var param = '';
    for(var attr in data){
        param += attr + '=' + data[attr] + '&';
    }
    if(param){
        param = param.substring(0,param.length - 1);
    }
        ajax.open('get',url + '?' + param);
        ajax.send();
    ajax.onreadystatechange = function () {
        if (ajax.readyState==4&&ajax.status==200) {
            success(JSON.parse(ajax.responseText));
        }
    }
  }