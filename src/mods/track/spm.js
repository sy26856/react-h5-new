;(function(){
	//C \u70b9\u9ed8\u8ba4\u503c
	var DEFUALT_C = "1000";
	//\u81ea\u5b9a\u4e49\u5c5e\u6027spm
	var SPM_ELEMENTS_KEY = "data-spm";
	//\u67e5\u8be2\u503c
	var SPM_ELEMENTS_KEY_QUERY = "[data-spm]";
	//\u81ea\u5b9a\u4e49ID key
	var SPM_ELEMENTS_CUSTOM = "data-spm-id";
	var BID = 0;
	var ab = ab();
	var A = ab.a;
	var B = ab.b;
	var timeout = null;

	document.addEventListener('DOMNodeInserted',update,false);
	document.addEventListener('DOMAttrModified',update,false);
	document.addEventListener('DOMNodeRemoved',update,false);

	//\u6784\u5efa\u52a8\u6001\u7684dom spm
	function update(e){
		var target = e.target || e.srcElement;
		var arr = ["SCRIPT","LINK", "META", "TITLE"];
		if( arr.indexOf( target.tagName) == -1 ){
			timeout && clearTimeout(timeout);
			timeout = setTimeout(function(){
				builderSPM(A, B)
			}, 500);
		}else{
			// console.log("\u8df3\u8fc7"+ target.tagName)
		}
	}

	//\u83b7\u53d6 AB
	function ab(){
		var meta = document.querySelectorAll("meta[name=spm-id]");
		var ab = "";
		var a = 0;
		var b = 0;
		if( meta && meta.length && (ab = meta[0].content.split("."))){
			a = ab[0];
			b = ab[1];
		}

		return {a:a, b:b}
	}

	// var elements = document.querySelectorAll("[data-spm]");
	// elements
	//\u5bf9\u6bcf\u4e2a\u57cb\u70b9\u8bbe\u7f6e spm
	function builderSPM(a, b){
		// var t = Date.now();
		var elements = document.querySelectorAll(SPM_ELEMENTS_KEY_QUERY+",a");

		// Array.from(elements).map(function(element){
		Array.prototype.slice.call(elements).map(function(element){
			var tagName = element.tagName;

			var childs = null ;
			// console.log(tagName, (childs=element.querySelectorAll(SPM_ELEMENTS_KEY_QUERY), ch?ilds.length))
			if( tagName != "A" && (childs=element.querySelectorAll(SPM_ELEMENTS_KEY_QUERY+",a"), childs.length) ){
				//\u6bcf\u4e2a\u533a\u57df \u7684id\u9012\u589e\u4ece1 \u5f00\u59cb
				setSPMC(childs, a, b, element.getAttribute(SPM_ELEMENTS_KEY), 0);
			}else{
				setSPM(element, a, b, 1000, getElementSPMD(element) || ++BID);
			};
		});
		// console.log(  Date.now() - t )
	}
	//\u5bf9\u6709\u5b50\u5143\u7d20\u7684\u70b9\u8bbe\u7f6espm
	function setSPMC(elements, a, b, c, i){
		Array.prototype.slice.call(elements).map(function(element){
			setSPM(element, a, b, c,  getElementSPMD(element) || ++i);
		});
	}

	function setSPM(element, a, b, c, d){
		if(!element.getAttribute(SPM_ELEMENTS_CUSTOM)){
			var spm = buildspm(a, b, c, d);
			var url = null;
			element.setAttribute(SPM_ELEMENTS_CUSTOM, spm);
			//A\u6807\u7b7e\u5e76\u4e14\u6709href\u628aspm\u8ffd\u52a0\u5230\u53c2\u6570\u540e\u9762
			//如果是 href="tel:13682637304" 拨打电话的不要加spm
			if( element.tagName == "A" && element.href && element.href.indexOf("tel:") == -1){
				// url = new URL( element.href );
				// if( url.search == "" ){
				// 	url.search = "?spm="+spm;
				// }else{
				// 	url.search += "&spm="+spm;
				// }
				// element.href = url.toString();

				url = element.href;
				if(url.indexOf("?") == -1){
					url += "?spm="+spm;
				}else{
					url += "&spm="+spm;
				}
				element.href = url;

			}else{
				//\u7ed1\u5b9aclick\u4e8b\u4ef6
				element.addEventListener("click", function(){
					console.log(this.getAttribute("data-spm-id"));
				}, true);
			}
		}
	}

	//\u83b7\u53d6\u5143\u7d20\u7684\u57cb\u70b9\u503c
	function getElementSPMD( element ){
		return element.getAttribute(SPM_ELEMENTS_KEY);
	}

	function isSettingSPM(){
		return element.getAttribute(SPM_ELEMENTS_CUSTOM);
	}

	function buildspm(a, b, c, d){
		return [a,b,c,d].join(".");
	}
	/***
	function setEventTap(){
		document.addEventListener("touchstart", function(e){
			// console.log(e)
			var target = e.srcElement || e.target;

			//\u83b7\u53d6\u9700\u8981\u8bbe\u7f6espm\u7684 element
			var element = getSPMElement( target );

			if( element && element.getAttribute(SPM_ELEMENTS_CUSTOM)){
				var spm = getElementSPM( element );
				spm.concat([B,A]).reverse();
				setSPM( element, spm[0], spm[1], spm[2], spm[3]);
			}

		})
	}


	//\u83b7\u53d6\u70b9\u51fb\u5143\u7d20\u7684\u5230\u6839\u76ee\u5f55\u662f\u5426\u9700\u8981\u8bbe\u7f6e spm
	function getSPMElement( element ){

		var tagName = element.tagName;
		if( tagName  == "BODY"){
			return null;
		}

		if( (tagName == "A" && element.href) ||  getElementSPMD( element )) {
			return element;
		}else{
			return getSPMElement(element.parentElement);
		}

	}

	//\u5411\u4e0a\u67e5\u627e\u8865\u5168spm
	function getElementSPM(element, spm){

		spm = spm || [];
		var tagName = element.tagName;
		var spmd = null;

		if( (spmd = getElementSPMD(element)) ){
			spm.push( spmd );
		}

		if( !spmd &&  tagName == "A" && element.href){
			spm.push( ++BID );
		}

		if(element.tagName == "BODY"){
			return spm;
		}

		return getElementSPM(element.parentElement, spm);
	}
	*/

	function init(){
		//\u6784\u5efa\u9759\u6001\u7684dom spm
		builderSPM(A, B);

	}
	try{
		init();
	}catch(e){
		// alert(e.message);
		console.log("error")
	}
	if (typeof define === 'function') {

		// AMD. Register as an anonymous module.
		define("spm",function(){
			return init;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = init;
	} else {
		window.spm = init;
	}

})();
