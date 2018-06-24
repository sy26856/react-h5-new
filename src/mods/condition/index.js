
//define(function (require, exports, module) {

define("mods/condition/index", function(require, exports, module){

	var VModule = require("component/VModule");


	var page = VModule.render({
		init:function(isEdit, content, photos ){

			var isSupperUpload = this.util.isInYuantuApp();
			this.isInit = 1;
			if(isEdit){
				this.conditionCache = this.cache.getCacheModule("yuantu-condition");
				this.state = {
					loading:false,
					success:true,
					isEdit:isEdit,
					maxPhotosNumber:9,
					isSupperUpload:isSupperUpload,
					photos:this.conditionCache.get("photos").value || [],
					content:this.conditionCache.get("content").value || []
				};
			}else{
				this.state = {
					loading:false,
					success:true,
					isEdit:isEdit,
					isSupperUpload:isSupperUpload,
					photos:photos || [],
					maxPhotosNumber:9,
					content:content || ""
				}
			}


			this.module = this.initModule( this.state, '#J_ConditionModule');
			this.photoList = $('#J_ConditionModule');
			this.regEvent();

		},
		regEvent:function(){
			var util = this.util
			var self = this;

			this.photoList.delegate(".J_AddPhotoBtn","click", function(){
				// self.addPhoto("http://image.yuantutech.com/user/0b0e7a27918afa6b74d649eea58d7495-612-612.jpg")
				util.brige("callPhotoUpload", {}, function(result){
					if(result && result.ret == "SUCCESS"){
						try{
							var photoResult = JSON.parse(result.data);
							if(photoResult.success && photoResult.data && photoResult.data.name){
								self.addPhoto( self.buildPhotoUrl( photoResult.data ) );
							}else{
								util.alert("图片上传失败，请重试");	
							}
						}catch(e){
							util.alert("返回数据错误");	
						}
						
					}else{
						util.alert("图片上传失败");	
					}

				}, function(data){
					util.alert(data.msg || "调用图片上传组件失败");
				})
			})
			this.photoList.delegate("textarea", "input", function(){
				self.conditionCache.set("content", $(this).val());
				self.setState({content:$(this).val()})
				// alert($(this).val())
			})

			this.photoList.delegate(".del", "click", function(e){
				var url = $(this).data("url");
				if(url){
					self.removePhoto( url )
				}			
			})

			//预览大图
			this.photoList.delegate(".J_PhotoItem", "click", function(e){
				// console.log(e.target.classList)
				//阻止 .del 冒泡上来
				if($(e.target).hasClass('J_PhotoItem')){
				// if(e.target.classList && e.target.classList.value.indexOf("J_PhotoItem") != -1){
					var url = $(this).data("url");
					self.util.brige("imageBrowser", {
						current:url,
						urls:self.getPhotos().split(",")
					}, ()=>{}, ()=>{
						self.util.alert("无法查看大图，请升级到最新客户端");
					});
				}
			})

		},
		getSmallPhotoUrl:function(url){
			var suffix = url.match(/\.(\w+)$/)
			suffix = suffix ? suffix[0] : "";
			if(suffix){
				suffix = "_120x120"+suffix;
			}
			return url.replace("image.yuantutech.com", "112.124.118.39/image")+suffix;
		},
		buildPhotoUrl:function(data){
			return "http://image.yuantutech.com/"+data.path+data.name;
		},
		getContent:function(){
			return this.isInit ? this.state.content : ""
		},
		getPhotos:function(){
			return this.isInit ? this.state.photos.join() : "";
		},
		removePhoto:function(url){
			var index = this.state.photos.indexOf(url)
			if(index != -1){
				this.state.photos.splice(index, 1);
				this.conditionCache.set("photos", this.state.photos);
				this.setState( this.state );
			}
		},
		addPhoto:function( url ){
			this.state.photos.push( url )
			this.setState( this.state )
			this.conditionCache.set("photos", this.state.photos);
		},


		renderPhotoList(state){
			var photos = state.photos;
			var isEdit = state.isEdit;
			if(photos.length == 0 && !isEdit){
				return `<div class="tip">没有图片描述</div>`
			}else{
				return photos.map((url)=>{
						return `<div class="photo J_PhotoItem" data-url="${url}" style="background-image:url(${this.getSmallPhotoUrl(url)})">
							${this.util.is(isEdit, `<span class="del" data-url="${url}"></span>`)}
						</div>`
					}).join("")
			}

		},
		renderNoSupper:function(){
			return `<div class="ui-tips center">
                    下载<a href="http://nocache-s.yuantutech.com/tms/fb/app-download.html?target=_blank" target="_blank">慧医客户端</a>，可添加/查看病情图片描述
                </div>
                `
		},
		render:function( state ){
			return `
				<div class="page condition-module">
			        <div class="ui-form ui-border-tb">
			            <div class="ui-form-item ui-form-item-textarea ui-form-item-show ui-border-b">
			                <label>病情描述：</label>
			                ${
			                	state.isEdit ? 
			                		`<textarea placeholder="请详细描述您的病情，症状，治疗经过以及想要获得的帮助" maxlength="300" class="edit">${state.content}</textarea>`
			                	: 
			                		`<div class="condition-text">${state.content || `<span class="tip">没有病情描述</span>`}</div>`
			                }
			            </div>
			        </div>
			        <div class="ui-form ui-border-tb">
			            <div class="ui-form-item ui-form-photo ui-form-item-show ui-border-b">
			                <label>图片描述：</label>
			                <div class="photo-small-list">
			                	${
			                		state.isSupperUpload ? this.renderPhotoList(state) : this.renderNoSupper()
			                	}
			                	${
			                		state.isEdit && state.isSupperUpload && state.photos.length < state.maxPhotosNumber ? 
			                		`<div class="photo-add J_AddPhotoBtn"></div>` : ""
			                	}
			                </div>
			            </div>
			        </div>
			    </div>
			`
		},
		renderError(){
			return ""
		}
	});

	// page.init();

	module.exports = page;
});
