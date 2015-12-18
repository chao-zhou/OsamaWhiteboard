!function(){function addEventListener(element,event,cb){element.addEventListener?element.addEventListener(event,cb,!0):element.attachEvent(event,cb)}function setInnerText(element,text){if("undefined"==typeof element)return!1;var textProperty="innerText"in element?"innerText":"textContent";try{element[textProperty]=text}catch(anException){element.setAttribute("innerText",text)}}VideoJS.Youtube=VideoJS.MediaTechController.extend({init:function(player,options,ready){if(this.player_=player,this.featuresProgressEvents=!1,this.featuresTimeupdateEvents=!1,this.featuresPlaybackRate=!0,VideoJS.MediaTechController.call(this,player,options,ready),this.isIos=/(iPad|iPhone|iPod)/g.test(navigator.userAgent),this.isAndroid=/(Android)/g.test(navigator.userAgent),this.playVideoIsAllowed=!(this.isIos||this.isAndroid),(this.isIos||this.isAndroid)&&(this.player_.options().autoplay=!1),"undefined"!=typeof options.source)for(var key in options.source)options.source.hasOwnProperty(key)&&(player.options()[key]=options.source[key]);this.userQuality=VideoJS.Youtube.convertQualityName(player.options().quality),this.playerEl_=player.el(),this.playerEl_.className+=" vjs-youtube",this.qualityButton=document.createElement("div"),this.qualityButton.setAttribute("class","vjs-quality-button vjs-menu-button vjs-control"),this.qualityButton.setAttribute("tabindex",0);var qualityContent=document.createElement("div");qualityContent.setAttribute("class","vjs-control-content"),this.qualityButton.appendChild(qualityContent),this.qualityTitle=document.createElement("span"),this.qualityTitle.setAttribute("class","vjs-control-text"),qualityContent.appendChild(this.qualityTitle),"undefined"!==player.options().quality&&setInnerText(this.qualityTitle,player.options().quality||"auto");var qualityMenu=document.createElement("div");if(qualityMenu.setAttribute("class","vjs-menu"),qualityContent.appendChild(qualityMenu),this.qualityMenuContent=document.createElement("ul"),this.qualityMenuContent.setAttribute("class","vjs-menu-content"),qualityMenu.appendChild(this.qualityMenuContent),this.id_=this.player_.id()+"_youtube_api",this.el_=VideoJS.Component.prototype.createEl("iframe",{id:this.id_,className:"vjs-tech",scrolling:"no",marginWidth:0,marginHeight:0,frameBorder:0}),this.el_.setAttribute("allowFullScreen",""),this.playerEl_.insertBefore(this.el_,this.playerEl_.firstChild),/MSIE (\d+\.\d+);/.test(navigator.userAgent)){var ieVersion=Number(RegExp.$1);this.addIframeBlocker(ieVersion)}else/(iPad|iPhone|iPod|Android)/g.test(navigator.userAgent)||(this.el_.className+=" onDesktop",this.addIframeBlocker());this.parseSrc(player.options().src),this.playOnReady=this.player_.options().autoplay&&this.playVideoIsAllowed,this.forceHTML5=!("undefined"!=typeof this.player_.options().forceHTML5&&this.player_.options().forceHTML5!==!0),this.updateIframeSrc();var self=this;player.ready(function(){if(self.player_.options().controls){var controlBar=self.playerEl_.querySelectorAll(".vjs-control-bar")[0];controlBar&&controlBar.appendChild(self.qualityButton)}self.playOnReady&&!self.player_.options().ytcontrols&&("undefined"!=typeof self.player_.loadingSpinner&&self.player_.loadingSpinner.show(),"undefined"!=typeof self.player_.bigPlayButton&&self.player_.bigPlayButton.hide()),player.trigger("loadstart")}),this.on("dispose",function(){this.ytplayer&&this.ytplayer.destroy(),this.player_.options().ytcontrols||this.player_.off("waiting",this.bindedWaiting),this.playerEl_.querySelectorAll(".vjs-poster")[0].style.backgroundImage="none",this.el_.parentNode&&this.el_.parentNode.removeChild(this.el_),this.qualityButton.parentNode&&this.qualityButton.parentNode.removeChild(this.qualityButton),"undefined"!=typeof this.player_.loadingSpinner&&this.player_.loadingSpinner.hide(),"undefined"!=typeof this.player_.bigPlayButton&&this.player_.bigPlayButton.hide(),this.iframeblocker&&this.playerEl_.removeChild(this.iframeblocker)})}}),VideoJS.Youtube.prototype.updateIframeSrc=function(){var params={enablejsapi:1,iv_load_policy:3,playerapiid:this.id(),disablekb:1,wmode:"transparent",controls:this.player_.options().ytcontrols?1:0,html5:this.player_.options().forceHTML5?1:null,playsinline:this.player_.options().playsInline?1:0,showinfo:0,rel:0,autoplay:this.playOnReady?1:0,loop:this.player_.options().loop?1:0,list:this.playlistId,vq:this.userQuality,origin:window.location.protocol+"//"+window.location.host},isLocalProtocol="file:"===window.location.protocol||"app:"===window.location.protocol;isLocalProtocol&&delete params.origin;for(var prop in params)!params.hasOwnProperty(prop)||"undefined"!=typeof params[prop]&&null!==params[prop]||delete params[prop];var self=this;if(this.videoId||this.playlistId){if(this.el_.src="https://www.youtube.com/embed/"+(this.videoId||"videoseries")+"?"+VideoJS.Youtube.makeQueryString(params),this.player_.options().ytcontrols?this.player_.controls(!1):!this.videoId||"undefined"!=typeof this.player_.poster()&&0!==this.player_.poster().length||setTimeout(function(){self.player_.poster("https://img.youtube.com/vi/"+self.videoId+"/0.jpg")},100),this.bindedWaiting=function(){self.onWaiting()},this.player_.on("waiting",this.bindedWaiting),VideoJS.Youtube.apiReady)this.loadYoutube();else if(VideoJS.Youtube.loadingQueue.push(this),!VideoJS.Youtube.apiLoading){var tag=document.createElement("script");tag.onerror=function(e){self.onError(e)},tag.src="https://www.youtube.com/iframe_api";var firstScriptTag=document.getElementsByTagName("script")[0];firstScriptTag.parentNode.insertBefore(tag,firstScriptTag),VideoJS.Youtube.apiLoading=!0}}else this.el_.src="about:blank",setTimeout(function(){self.triggerReady()},500)},VideoJS.Youtube.prototype.onWaiting=function(){"undefined"!=typeof this.player_.bigPlayButton&&this.player_.bigPlayButton.hide()},VideoJS.Youtube.prototype.addIframeBlocker=function(ieVersion){this.iframeblocker=VideoJS.Component.prototype.createEl("div"),this.iframeblocker.className="iframeblocker",this.iframeblocker.style.position="absolute",this.iframeblocker.style.left=0,this.iframeblocker.style.right=0,this.iframeblocker.style.top=0,this.iframeblocker.style.bottom=0,ieVersion&&9>ieVersion?this.iframeblocker.style.opacity=.01:this.iframeblocker.style.background="rgba(255, 255, 255, 0.01)";var self=this;addEventListener(this.iframeblocker,"mousemove",function(e){self.player_.userActive()||self.player_.userActive(!0),e.stopPropagation(),e.preventDefault()}),addEventListener(this.iframeblocker,"click",function(){self.paused()?self.play():self.pause()}),this.playerEl_.insertBefore(this.iframeblocker,this.el_.nextSibling)},VideoJS.Youtube.prototype.parseSrc=function(src){if(this.srcVal=src,src){var regId=/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,match=src.match(regId);this.videoId=match&&11===match[2].length?match[2]:null;var regPlaylist=/[?&]list=([^#\&\?]+)/;match=src.match(regPlaylist),null!==match&&match.length>1?this.playlistId=match[1]:this.playlistId&&delete this.playlistId;var regVideoQuality=/[?&]vq=([^#\&\?]+)/;match=src.match(regVideoQuality),null!==match&&match.length>1&&(this.userQuality=match[1],setInnerText(this.qualityTitle,VideoJS.Youtube.parseQualityName(this.userQuality)))}},VideoJS.Youtube.prototype.src=function(src){if("undefined"!=typeof src){if(this.parseSrc(src),"about:blank"===this.el_.src)return void this.updateIframeSrc();delete this.defaultQuality,null!==this.videoId&&(this.player_.options().autoplay&&this.playVideoIsAllowed?this.ytplayer.loadVideoById({videoId:this.videoId,suggestedQuality:this.userQuality}):this.ytplayer.cueVideoById({videoId:this.videoId,suggestedQuality:this.userQuality}),this.playerEl_.querySelectorAll(".vjs-poster")[0].style.backgroundImage="url(https://img.youtube.com/vi/"+this.videoId+"/0.jpg)",this.player_.poster("https://img.youtube.com/vi/"+this.videoId+"/0.jpg"))}return this.srcVal},VideoJS.Youtube.prototype.load=function(){},VideoJS.Youtube.prototype.play=function(){null!==this.videoId&&(this.player_.options().ytcontrols||this.player_.trigger("waiting"),this.isReady_?(this.ytplayer.setVolume(100*this.player_.volume()),this.volumeVal>0?this.ytplayer.unMute():this.ytplayer.mute(),this.playVideoIsAllowed&&this.ytplayer.playVideo()):this.playOnReady=!0)},VideoJS.Youtube.prototype.pause=function(){this.ytplayer&&this.ytplayer.pauseVideo()},VideoJS.Youtube.prototype.paused=function(){return this.ytplayer?this.lastState!==YT.PlayerState.PLAYING&&this.lastState!==YT.PlayerState.BUFFERING:!0},VideoJS.Youtube.prototype.currentTime=function(){return this.ytplayer&&this.ytplayer.getCurrentTime?this.ytplayer.getCurrentTime():0},VideoJS.Youtube.prototype.setCurrentTime=function(seconds){this.ytplayer.seekTo(seconds,!0),this.player_.trigger("timeupdate"),this.player_.trigger("seeking"),this.isSeeking=!0},VideoJS.Youtube.prototype.playbackRate=function(){return this.ytplayer&&this.ytplayer.getPlaybackRate?this.ytplayer.getPlaybackRate():1},VideoJS.Youtube.prototype.setPlaybackRate=function(suggestedRate){if(this.ytplayer&&this.ytplayer.setPlaybackRate){this.ytplayer.setPlaybackRate(suggestedRate);var self=this;setTimeout(function(){self.player_.trigger("ratechange")},100)}},VideoJS.Youtube.prototype.duration=function(){return this.ytplayer&&this.ytplayer.getDuration?this.ytplayer.getDuration():0},VideoJS.Youtube.prototype.currentSrc=function(){return this.srcVal},VideoJS.Youtube.prototype.ended=function(){return this.ytplayer?this.lastState===YT.PlayerState.ENDED:!1},VideoJS.Youtube.prototype.volume=function(){return this.ytplayer&&isNaN(this.volumeVal)&&(this.volumeVal=this.ytplayer.getVolume()/100,this.volumeVal=isNaN(this.volumeVal)?1:this.volumeVal,this.player_.volume(this.volumeVal)),this.volumeVal},VideoJS.Youtube.prototype.setVolume=function(percentAsDecimal){"undefined"!=typeof percentAsDecimal&&percentAsDecimal!==this.volumeVal&&(this.ytplayer.setVolume(100*percentAsDecimal),this.volumeVal=percentAsDecimal,this.player_.trigger("volumechange"))},VideoJS.Youtube.prototype.muted=function(){return this.mutedVal},VideoJS.Youtube.prototype.setMuted=function(muted){muted?(this.storedVolume=this.volumeVal,this.ytplayer.mute(),this.player_.volume(0)):(this.ytplayer.unMute(),this.player_.volume(this.storedVolume)),this.mutedVal=muted,this.player_.trigger("volumechange")},VideoJS.Youtube.prototype.buffered=function(){if(this.ytplayer&&this.ytplayer.getVideoBytesLoaded){var loadedBytes=this.ytplayer.getVideoBytesLoaded(),totalBytes=this.ytplayer.getVideoBytesTotal();if(!loadedBytes||!totalBytes)return 0;var duration=this.ytplayer.getDuration(),secondsBuffered=loadedBytes/totalBytes*duration,secondsOffset=this.ytplayer.getVideoStartBytes()/totalBytes*duration;return VideoJS.createTimeRange(secondsOffset,secondsOffset+secondsBuffered)}return VideoJS.createTimeRange(0,0)},VideoJS.Youtube.prototype.supportsFullScreen=function(){return"function"!=typeof this.el_.webkitEnterFullScreen||!/Android/.test(VideoJS.USER_AGENT)&&/Chrome|Mac OS X 10.5/.test(VideoJS.USER_AGENT)?!1:!0},VideoJS.Youtube.isSupported=function(){return!0},VideoJS.Youtube.canPlaySource=function(srcObj){return"video/youtube"===srcObj.type},VideoJS.Youtube.canControlVolume=function(){return!0},VideoJS.Youtube.loadingQueue=[],VideoJS.Youtube.prototype.loadYoutube=function(){var self=this;this.ytplayer=new YT.Player(this.id_,{events:{onReady:function(e){e.target.vjsTech.onReady(),self.player_.trigger("ratechange")},onStateChange:function(e){e.target.vjsTech.onStateChange(e.data)},onPlaybackQualityChange:function(e){e.target.vjsTech.onPlaybackQualityChange(e.data)},onError:function(e){e.target.vjsTech.onError(e.data)}}}),this.ytplayer.vjsTech=this},VideoJS.Youtube.makeQueryString=function(args){var array=["modestbranding=1"];for(var key in args)args.hasOwnProperty(key)&&array.push(key+"="+args[key]);return array.join("&")},window.onYouTubeIframeAPIReady=function(){for(var yt;yt=VideoJS.Youtube.loadingQueue.shift();)yt.loadYoutube();VideoJS.Youtube.loadingQueue=[],VideoJS.Youtube.apiReady=!0},VideoJS.Youtube.prototype.onReady=function(){this.isReady_=!0,this.triggerReady(),this.player_.trigger("loadedmetadata"),this.player_.trigger("durationchange"),this.player_.trigger("timeupdate"),"undefined"==typeof this.player_.loadingSpinner||this.isIos||this.isAndroid||this.player_.loadingSpinner.hide(),this.player_.options().muted&&this.setMuted(!0),!this.videoId&&this.playlistId&&(this.videoId=this.ytplayer.getPlaylist()[0],this.player_.poster("https://img.youtube.com/vi/"+this.videoId+"/0.jpg")),this.playOnReady&&(this.playOnReady=!1,this.play())},VideoJS.Youtube.prototype.updateQualities=function(){function setupEventListener(el){addEventListener(el,"click",function(){var quality=this.getAttribute("data-val");self.ytplayer.setPlaybackQuality(quality),self.userQuality=quality,setInnerText(self.qualityTitle,VideoJS.Youtube.parseQualityName(quality));var selected=self.qualityMenuContent.querySelector(".vjs-selected");selected&&VideoJS.Youtube.removeClass(selected,"vjs-selected"),VideoJS.Youtube.addClass(this,"vjs-selected")})}var qualities=this.ytplayer.getAvailableQualityLevels(),self=this;if(qualities.indexOf(this.userQuality)<0&&setInnerText(self.qualityTitle,VideoJS.Youtube.parseQualityName(this.defaultQuality)),0===qualities.length)this.qualityButton.style.display="none";else{for(this.qualityButton.style.display="";this.qualityMenuContent.hasChildNodes();)this.qualityMenuContent.removeChild(this.qualityMenuContent.lastChild);for(var i=0;i<qualities.length;++i){var el=document.createElement("li");el.setAttribute("class","vjs-menu-item"),setInnerText(el,VideoJS.Youtube.parseQualityName(qualities[i])),el.setAttribute("data-val",qualities[i]),qualities[i]===this.quality&&VideoJS.Youtube.addClass(el,"vjs-selected"),setupEventListener(el),this.qualityMenuContent.appendChild(el)}}},VideoJS.Youtube.prototype.onStateChange=function(state){if(state!==this.lastState){switch(state){case-1:this.player_.trigger("durationchange");break;case YT.PlayerState.ENDED:var stopPlaying=!0;this.playlistId&&!this.player_.options().loop&&(stopPlaying=0===this.ytplayer.getPlaylistIndex()),stopPlaying&&(this.player_.options().ytcontrols||(this.playerEl_.querySelectorAll(".vjs-poster")[0].style.display="block","undefined"!=typeof this.player_.bigPlayButton&&this.player_.bigPlayButton.show()),this.player_.trigger("ended"));break;case YT.PlayerState.PLAYING:this.playerEl_.querySelectorAll(".vjs-poster")[0].style.display="none",this.playVideoIsAllowed=!0,this.updateQualities(),this.player_.trigger("timeupdate"),this.player_.trigger("durationchange"),this.player_.trigger("playing"),this.player_.trigger("play"),this.isSeeking&&(this.player_.trigger("seeked"),this.isSeeking=!1);break;case YT.PlayerState.PAUSED:this.player_.trigger("pause");break;case YT.PlayerState.BUFFERING:this.player_.trigger("timeupdate"),this.player_.options().ytcontrols||this.player_.trigger("waiting");break;case YT.PlayerState.CUED:}this.lastState=state}},VideoJS.Youtube.convertQualityName=function(name){switch(name){case"144p":return"tiny";case"240p":return"small";case"360p":return"medium";case"480p":return"large";case"720p":return"hd720";case"1080p":return"hd1080"}return"auto"},VideoJS.Youtube.parseQualityName=function(name){switch(name){case"tiny":return"144p";case"small":return"240p";case"medium":return"360p";case"large":return"480p";case"hd720":return"720p";case"hd1080":return"1080p"}return"auto"},VideoJS.Youtube.prototype.onPlaybackQualityChange=function(quality){if("undefined"!=typeof this.defaultQuality||(this.defaultQuality=quality,"undefined"==typeof this.userQuality)){switch(this.quality=quality,setInnerText(this.qualityTitle,VideoJS.Youtube.parseQualityName(quality)),quality){case"medium":this.player_.videoWidth=480,this.player_.videoHeight=360;break;case"large":this.player_.videoWidth=640,this.player_.videoHeight=480;break;case"hd720":this.player_.videoWidth=960,this.player_.videoHeight=720;break;case"hd1080":this.player_.videoWidth=1440,this.player_.videoHeight=1080;break;case"highres":this.player_.videoWidth=1920,this.player_.videoHeight=1080;break;case"small":this.player_.videoWidth=320,this.player_.videoHeight=240;break;case"tiny":this.player_.videoWidth=144,this.player_.videoHeight=108;break;default:this.player_.videoWidth=0,this.player_.videoHeight=0}this.player_.trigger("ratechange")}},VideoJS.Youtube.prototype.onError=function(error){this.player_.error(error)},VideoJS.Youtube.addClass=function(element,classToAdd){-1===(" "+element.className+" ").indexOf(" "+classToAdd+" ")&&(element.className=""===element.className?classToAdd:element.className+" "+classToAdd)},VideoJS.Youtube.removeClass=function(element,classToRemove){var classNames,i;if(-1!==element.className.indexOf(classToRemove)){for(classNames=element.className.split(" "),i=classNames.length-1;i>=0;i--)classNames[i]===classToRemove&&classNames.splice(i,1);element.className=classNames.join(" ")}};var style=document.createElement("style"),def=" .vjs-youtube .vjs-poster { background-size: 100%!important; }.vjs-youtube .vjs-poster, .vjs-youtube .vjs-loading-spinner, .vjs-youtube .vjs-big-play-button, .vjs-youtube .vjs-text-track-display{ pointer-events: none !important; }.vjs-youtube.vjs-user-active .iframeblocker { display: none; }.vjs-youtube.vjs-user-inactive .vjs-tech.onDesktop { pointer-events: none; }.vjs-quality-button > div:first-child > span:first-child { position:relative;top:7px }";style.setAttribute("type","text/css"),document.getElementsByTagName("head")[0].appendChild(style),style.styleSheet?style.styleSheet.cssText=def:style.appendChild(document.createTextNode(def)),Array.prototype.indexOf||(Array.prototype.indexOf=function(elt){var len=this.length>>>0,from=Number(arguments[1])||0;for(from=0>from?Math.ceil(from):Math.floor(from),0>from&&(from+=len);len>from;from++)if(from in this&&this[from]===elt)return from;return-1})}();