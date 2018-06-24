# react 开发规范
### react 架构模型
![](http://upload-images.jianshu.io/upload_images/604678-78348f70f6ad52c3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 目录结构

```
- BaseComponent => 基础组件类的封装，对 React.Component 进行二次封装，包括 loading 机制，错误处理机制
- component => 公共组件的封装，一些常用的基础组件的封装（有一些老的页面组件也放在这，这是因为老版本没有 pageComponent，故放在了这）
- hoc => 用于自动刷新（手机端浏览器，返回后不能自动刷新）
- lib => 一些库函数，工具函数
- module => 基础模块，如：数据请求接口
- pageComponent => 页面组件，方便单页面进行组件化（当一个页面比较复杂的时候，需要进行组件化，但是这部分组件往往复用率比较低，这时候如果放到公共的组件库中，就会加大维护成本）
- "pageName" => 页面的命名规范遵循和页面名称一致的一个文件夹，然后在里面进行新建 js 文件进行组件开发
```
### 项目相关工具

* `webpack`
* `less`
* `git`
* `nodejs`
* `babel`

### 环境、开发、调试

1. `git clone 项目地址`
2. `sudo npm(cnpm) install`
3. `npm run rs`
4. `浏览器访问 http://localhost:8080/ ` Server指向 ./src-react 目录
5. `修改 host 文件使用，我们的域名进行本地开发测试`
    * 127.0.0.1	a.uat.yuantutech.com 
    * 127.0.0.1	a.daily.yuantutech.com 
    * 127.0.0.1	a.s.yuantutech.com 
    * 127.0.0.1	a.test.yuantutech.com
6. `把浏览器访问 localhost 改为 a.uat.yuantutech.com`

### 关于 git branch

##### 开发新功能

`git checkout -b daily/a.b.c`  升级b  比如当前线上版本号`1.0.0` 新功能的版本应该为 `1.1.0`.
##### 修改bug

`git checkout -b daily/a.b.c`  升级c  比如当前线上版本号`1.0.0` 新功能的版本应该为 `1.0.1`.

#### 切换完新版本后

* 修改 package.json 中的版本号
* `npm run dev`
* 然后就可以进行开发了

### 版本发布规则

#### 测试环境

* `npm run dev` // 打包测试环境代码
* `git add . `  // 添加到 git 本地缓存区
* `git commit -m 'xxx'  ` // 添加到 git 本地仓库
* `git push origin daily/x.x.x  ` // 把本地代码提交到服务器 
* 这时候就可以打开浏览器，`访问 uat.yuantutech.com/yuantu/x.x.x/xxx.html` 

#### 线上代码发布
* `npm run dist `  // 打包线上环境代码
* `git add . `  // 添加到 git 本地缓存区
* `git commit -m 'xxx'  ` // 添加到 git 本地仓库
* `git push origin daily/x.x.x  ` // 把本地代码提交到服务器 
* `git tag publish/x.x.x  ` // 添加版本 tag
* `git push origin publish/x.x.x  ` // 把 tag 提交到远程
* 这时候已经发布版本完成，`访问 s.yuantutech.com/yuantu/x.x.x/xxx.html` 
* 最后需要把代码合并到主分支
* `git checkout master` // 切到主分支
* `git merge daily/x.x.x ` // 把代码合到主分支
* `npm run dev`
* `git push origin master`

### less 命名空间

* 当你新建一个页面后，需要进行样式的自定义时，需要在本 less 文件中包一个模块名称相同的 class 选择器
* 然后给页面组件的顶层的元素的 className 加上这个 class(将各个页面样式隔离,防止样式污染)

例如：有一个页面叫 page-name.js

page-name.less
```
.page-name {
    // 这里面写你的样式
}
```

page-name.js
```
...
export default class PageName extends Smart... {
    render () {
        return <div className="page-name">
        </div>
    }
}
```

### 关于数据加载

* 数据加载，没有特殊情况统一把接口调用放入以下文件（jsonp）
    * UserCenter => 普通接口调用
    * Aolsee => 广告类接口调用

### 关于 url 中参数 target=_blank 说明
* 此参数用于告诉客户端，此页面需要过场动画，为必填项
### SPMB

页面名称|html|spmb
---|---|---
绑定健康档案|jd-bindHealthRecord.html|
健康档案|jd-healthRecord.html|
健康档案|jd-healthRecord-details.html|
就诊人列表|jd-patientList.html|
医生|chat-details.html|
慧医|index-area.html|100.1000
医院概况|corp-info.html|100.1001
选择科室|reg-type.html|100.1002
选择科室|sections.html|100.1003
选择医生|select-doctor.html|100.1003
家庭医生|family-doctors.html|100.1004
选择时间|select-scheduling.html|100.1004
我的家庭医生|my-doctors.html|100.1004
就诊人列表|family-patient.html|100.1004
服务包详情|service-pack.html|100.1004
选择时间|styletest.html|100.1004
信息确认|info-confirm-29.html|100.1005
信息确认|info-confirm-2.html|100.1005
应用列表|application-list.html|100.1006
医院列表|appointment-hospital.html|100.1019
医院列表|register-hospital.html|100.1019
慧医|index-area2.html|100.1050
  |index.html|100.1050
我的预约/挂号|my-reservation.html|100.1100
支付|register-details-pay.html|100.1101
预约/挂号详情|register-details-2.html|100.1101
正在登入...|wechat-login.html|100.1104
缴费|pay-list.html|100.1200
医生|doctor.html|100.1211
科室|dept.html|100.1212
医院选择|leaf-corp.html|100.1243
隐私声明|privacy.html|100.1252
报告单|report.html|100.1300
报告单|report-29.html|100.1300
报告单详情|report-detail-29.html|100.1301
报告单详情|report-detail.html|100.1301
疾病详情|disease-detail.html|100.1311
填写疾病信息|create-consultation.html|100.1314
选择医生|reg-select.html|100.1340
选择医生|appointment-select.html|100.1380
填写疾病诊断|search-disease.html|100.1473
搜索|search-index.html|100.1473
充值|recharge.html|100.1487
住院充值|hospitalize-recharge.html|100.1488
我的|my.html|100.1500
订单详情|patient-order.html|100.1501
就诊人|patient-one-info-29.html|100.1501
就诊人列表|patient-list.html|100.1501
就诊人列表|patient-list-29.html|100.1501
信息确认|add-patientConfirm-29.html|100.1502
更换绑定就诊卡|bind-card-change-29.html|100.1502
身份校验|add-patientVerifyId-29.html|100.1502
添加就诊人|add-patient-29.html|100.1502
输入卡的信息|add-patientByCard-29.html|100.1502
添加就诊人|add-patientById-29.html|100.1502
绑定就诊卡|add-patientByIdBindCard-29.html|100.1502
就诊人|add-patient.html|100.1502
账单|bill.html|100.1510
brigetest|hybrid-test.html|100.1511
账单详情|bill-detail.html|100.1511
就诊评价|evaluate.html|100.1512
追加评价|evaluate-extra.html|100.1513
就诊评价页|show-evaluate.html|100.1514
我关注的医生|my-follow.html|100.1515
关于我们|about.html|100.1521
支付结果查询|pay-status.html|100.1521
提交反馈|feedback.html|100.1524
  |result-otstatistics.html|100.1526
检测结果|result-wf.html|100.1526
体重体脂统计|result-wfstatistics.html|100.1526
平台预约挂号规则|rule.html|100.1526
耳温分析参考|et-consult.html|100.1526
体温分析参考|ot-consult.html|100.1526
帮助与反馈|feedback-index.html|100.1528
问题详情|feedback-issue.html|100.1529
法律须知|law.html|100.1530
重置密码|forget-pwd-2.html|100.1531
找回／重置密码|forget-pwd.html|100.1532
授权登入|oauth-login.html|100.1540
资讯|news.html|100.1540
登录|sign-in.html|100.1541
注册|register.html|100.1550
爽约记录|black-list.html|100.1552
爽约记录详细|black-detail.html|100.1552
健康档案|health-record.html|100.1555
添加健康档案|health-record-2.html|100.1560
健康档案|health-record-detail.html|100.1700
绑定就诊卡|bind-card.html|100.1701
填写疾病信息|patient-audio.html|100.1702
就诊卡详情|patient-card-detail.html|100.1702
资讯详情|news-detail.html|100.1706
搜索医生/科室|search.html|100.1709
全部医生/科室|search-detail.html|100.1711
健康档案详情|health-record-detail-2.html|100.1730
健康档案|health-record-list-2.html|100.1731
健康档案|health-record-list.html|100.1731
我的订单|order-list.html|100.1775
我的订单|insurance-list.html|100.1775
我的问诊|my-inquisition.html|100.1800
订单详情|inquire-details.html|100.1800
住院记录|inhos-records.html|100.1800
日清单列表|inhos-daily-list.html|100.1801
日清单明细|inhos-daily-detail.html|100.1802
缴费详情|pay-detail.html|100.1853
设置|setting.html|100.1853
测试页面|my-test.html|100.1853
候诊列队|waiting-queue.html|100.1900
视频问诊|video-select.html|100.1900
视频问诊|video-inter.html|100.1900
青岛市妇女儿童医院|query-area.html|100.1900
候诊区|queue-list.html|100.1901
排队叫号详情|queue-list-detail.html|100.1902
医生列表|doctor-list.html|100.1911
医生简介|doctor-profile.html|100.1911
javascriptcore|javascript-core.html|100.2999
常见问题|qa-list.html|100.3000
导航|navigation.html|100.3001
意见反馈|feedback-query.html|100.3010
反馈详情|feedback-detail.html|100.3011
血氧检测结果|result-oxy.html|111.1000
血压统计|result-bpstatistics.html|111.1000
血压检测结果|result-bp.html|111.1000
血氧统计|result-oxystatistics.html|111.1000
血糖检测结果|result-bs.html|111.1000
视频引导|video.html|111.1000
检测结果|result-ot.html|111.1000
血糖统计|result-bstatistics.html|111.1000
体重体脂测量分析参考|wf-consult.html|111.1000
血糖分析参考|bs-consult.html|111.1005
血压分析参考|bp-consult.html|111.1005
血氧分析参考|oxygen-consult.html|1111.000  

#### spm埋点操作规范
##### 1.页面spm埋点获取(每次合并主分支请进行该操作)
1. `cd到h5-cli项目`  
2. `命令行输入cnpm run rspm`  
3. `生成spm.text文本,将文本内容复制过来替换上方SPMB的相应内容`
   * spmb的位置如果是空的,表示这个页面还没有设置mate[name='spm-id'] 
   * 如果等于0,表示这个页面有这个标签,但是没有content属性或者有content属性但没有这个spmb值

##### 2.修改更新spm
* 1.执行上一步还会生成spm.json文件
* 2.格式化json文件,按照json格式,更新你页面的spmb,保存
* 3.命令行输入(c)npm run wspm 即可完成更新

##### 3.使用规范
spm B可能存在重复使用的问题，开发人员使用时请遵守以下约定

| 开发人员 | 使用范围 | 
| ------------ | ------------- | 
| 李兰 | 1000~1999  | 
| 王一平 | 2000~2999  | 
| 徐津基 | 3000~3999  | 


### jq + seajs 开发规范说明已移至wiki/jq+sea.js页面


