"use strict";

//---------------------------------------
// Video service
//---------------------------------------
/**
 * @param {jQuery} $videoContainer
 * @param {jQuery} $canvasElement
 * @param {TabeebModules} modules
 * @constructor
 */
function TabeebVideoService ($videoContainer, $canvasElement, modules) {
	var that = null;
	var $this = null;
	var $videoElement = null;
	/**@type {TabeebCanvasService}*/
	var $canvasService = null;
	/**@type {jQuery}*/
	var $controlBar = null;
	var lastTimeUpdate = -1;
	var MIN_UPDATE_INTERVAL = 0.0;
	/**@type {HTMLVideoElement}*/
	var videoElement = null;
	var currentPlayerTech = TabeebVideoService.PlayerTech.None;
	var videoPlayer = null;
	var playerSize = {width: 0, height: 0};
	var lastPlayer = null;
	var isVideoPlayerLoaded = false;
	var metadataLoaded = false;
	var progressCount = 0;
	var ready = false;

	vjs_original.MediaError.defaultMessages[4] = 'Your browser/device does not support the video file type. Please check back in a few minutes for the video to be encoded.';

	init.call(this);

	function init () {
		that = this;
		$this = $(that);
		$canvasService = $(modules.canvasService);
	}

	function getVideoJSTech (url) {
		if (TabeebVideoService.isYouTubeUrl(url))
			return "youtube";
		if (TabeebVideoService.isVimeoUrl(url))
			return "vimeo";
		return null;
	}

	this.onready = function (callback) {
		if (ready)
			callback();
		else
		{
			$this.one(TabeebVideoService.VideoServiceEventType.videoPlayerReady, function () { callback(); });
		}
	};

	function setupVideoJSPlayer (url) {
		var deferred = $.Deferred();

		var isYouTubeUrl = TabeebVideoService.isYouTubeUrl(url);

		var videoJSTech = getVideoJSTech(url);

		var newPlayer = videoJSTech;

		// No need to dispose
		if (newPlayer == lastPlayer && videoPlayer != null)
		{

			console.log("Setting src", url);
			videoPlayer.src(url);
			that.pause();
			$videoContainer.find(".vjs-play-control").removeClass("vjs-playing").addClass("vjs-paused");
			$videoContainer.find(".tabeebVideoPlayer").removeClass("vjs-playing");
		}
		else
		{
			destroyVideoPlayer();

			var videoJSOptions = {
				controls: true,
				autoplay: modules.options.autoPlayVideos,
				width: "100%",
				height: "100%",
				ytcontrols: false,
				preload: "metadata"
			};

			if (videoJSTech == "vimeo")
				videoJSOptions.src = url;

			$videoElement = $("<video class='tabeebVideoPlayer video-js vjs-default-skin' preload='metadata' data-setup='{}'><p class='vjs-no-js'>No support for HTML5 video</p></video>");
			$videoContainer.append($videoElement);
			videoElement = $videoElement[0];

			if (videoJSTech)
				videoJSOptions.techOrder = [videoJSTech];

			console.log("VideoJS options", videoJSOptions);

			videoPlayer = VideoJS(videoElement, videoJSOptions, function () {
				isVideoPlayerLoaded = true;
				this.on('loadedmetadata', function () {
					ready = true;

					if (videoJSTech === "vimeo") {
						setTimeout(function () {
							$this.trigger($.Event(TabeebVideoService.VideoServiceEventType.videoPlayerReady));
						}, 5000);
					}
					else
					{
						$this.trigger($.Event(TabeebVideoService.VideoServiceEventType.videoPlayerReady));
					}

				});
				this.src(url);
				this.pause();
				deferred.resolve(true);
				bindVideoEvents(this);
			});
		}

		// Setting this will allow youtube to play on Android / iOS
		//if (TabeebVideoService.isYouTubeUrl(url))
		videoPlayer.tech.playVideoIsAllowed = true;

		lastPlayer = newPlayer;

		return deferred.promise();
	}

	/**
	 * @param {String} url
	 * @returns {*}
	 */
	function setupAzureVideoPlayer (url) {
		var deferred = $.Deferred();

		var newPlayer = "AMP";
		if (lastPlayer == newPlayer)
		{
			if (videoPlayer.currentSrc() != url)
			{
				videoPlayer.src([
					{
						src: url, type: "application/vnd.ms-sstr+xml"
					},
					{
						src: getMP4UrlFromManifest(url)
					}
				]);
			}

			that.setCurrentTime(0);
		}
		else
		{
			destroyVideoPlayer();
			$videoElement = $("<video id='video1' class='tabeebVideoPlayer azuremediaplayer amp-default-skin'><p class='vjs-no-js'>No support for HTML5 video</p></video>");
			$videoContainer.append($videoElement);
			videoElement = $videoElement[0];

			var ampOptions = {
				"nativeControlsForTouch": false,
				autoplay: modules.options.autoPlayVideos,
				controls: true,
				width: "100%",
				height: "100%",
				poster: "",
				techOrder: ["azureHtml5JS", "flashSS", "html5", "silverlightSS"],
				streamingFormats: ["SMOOTH"]
			};

			videoPlayer = amp('video1', ampOptions, function () {
				isVideoPlayerLoaded = true;
				deferred.resolve(true);
				this.on('loadedmetadata', function () {
					ready = true;
					$this.trigger($.Event(TabeebVideoService.VideoServiceEventType.videoPlayerReady));
				});

				this.src([
					{
						src: url, type: "application/vnd.ms-sstr+xml"
					},
					{
						src: getMP4UrlFromManifest(url)
					}
				]);

				bindVideoEvents(this);
			});

		}

		lastPlayer = newPlayer;

		return deferred.promise();
	}

	/**
	 * @param {String} url
	 * @returns {String}
	 */
	function getMP4UrlFromManifest (url) {
		return url.replace(".ism/manifest", "_H264_1000kbps_AAC_und_ch2_96kbps.mp4");
	}

	function setVideoJSError (msg) {
		if (msg)
			$(".vjs-error-display").show().html(msg);
		else
			$(".vjs-error-display").hide();
	}

	function bindVideoEvents (videoPlayer) {
		//        videoPlayer.controlBar.lockShowing();
		//        videoPlayer.controlBar.fullscreenToggle.hide();
		videoPlayer.on("timeupdate", onPlayerTimeUpdated);
		//        videoPlayer.on("seeking", onPlayerSeeked);
		videoPlayer.on("seeked", onPlayerSeeked);
		videoPlayer.on("pause", onPlayerPaused);
		videoPlayer.on("play", onPlayerResumed);
		videoPlayer.on("volumechange", onPlayerVolumeChanged);
		videoPlayer.on("loadedmetadata", onMetaDataLoaded);
		videoPlayer.on("progress", onProgress);
		videoPlayer.one('ready', function () {
			if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) && isYouTube)
			{
				$canvasElement.hide();
				$videoContainer.addClass("nocontrolsiOS");
			}
		});

		$canvasService.on(TabeebCanvasService.CanvasServiceEventType.mediaChanged, function () {
			$videoContainer.hide();
			if (videoPlayer)
			{
				try
				{
					videoPlayer.pause();
				}
				catch (ex) {
					console.warn("Suppressed error", ex);
				}
			}
		});

	}

	function destroyVideoPlayer () {
		isVideoPlayerLoaded = false;
		ready = false;
		if (videoPlayer)
		{
			try
			{
				videoPlayer.dispose();
			}
			catch (ex)
			{
			}
			videoPlayer = null;
		}

		if ($videoElement != null)
			$videoElement.remove();

		currentPlayerTech = TabeebVideoService.PlayerTech.None;
	}

	function onMetaDataLoaded (event) {
		metadataLoaded = true;
		setVideoJSError(null);
	}

	function onPlayerVolumeChanged (event) {
		$this.trigger($.Event(TabeebVideoService.VideoServiceEventType.volumeChanged, {volume: videoPlayer.volume()}));
	}

	function onPlayerPaused () {
		$this.trigger(TabeebVideoService.VideoServiceEventType.videoPaused, {time: that.getCurrentPlaybackTime()});
	}

	function onProgress (event) {
		if (!metadataLoaded)
			progressCount++;

		if (progressCount == 10 && !metadataLoaded)
		{
			console.warn("The metadata is at the end of file, we'll have to load the entire video to play it.");
			setVideoJSError("<p style='font-size: 20px;'>The video is currently being processed in the cloud. Please check back in a few minutes.</p>");
		}
	}

	function onPlayerResumed () {
		$canvasElement.show();
		$videoContainer.removeClass("nocontrolsiOS");
		$this.trigger(TabeebVideoService.VideoServiceEventType.videoPlayed, {time: that.getCurrentPlaybackTime()});
	}

	function onPlayerSeeked (event) {
		$this.trigger(TabeebVideoService.VideoServiceEventType.videoTimeSeeked, {time: that.getCurrentPlaybackTime()});
	}

	function onPlayerTimeUpdated () {
		var newTime = that.getCurrentPlaybackTime();
		if (Math.abs(newTime - lastTimeUpdate) >= MIN_UPDATE_INTERVAL)
		{
			$this.trigger(TabeebVideoService.VideoServiceEventType.videoTimeUpdated, {time: newTime});
			lastTimeUpdate = newTime;
		}
	}

	this.resize = function (width, height) {
		// Size the video directly over the canvas
		playerSize.height = height - TabeebVideoService.VIDEO_CONTROL_BAR_HEIGHT + TabeebVideoService.VIDEO_CONTROL_BAR_TRACKING_BAR_HEIGHT;
		playerSize.width = width;
		var position = $canvasElement.position();
		$videoContainer.css({left: position.left + 1, top: position.top + 1});
		$videoContainer.width(playerSize.width);
		$videoContainer.height(playerSize.height);

		var $player = $videoContainer.find(".tabeebVideoPlayer");
		$player.width(playerSize.width);
		$player.height(playerSize.height);
	};

	var playAgain = true;

	/**
	 * Plays the url (YouTube video or video file). If no URL, the currently loaded video is played
	 * @param url
	 */
	this.play = function (url) {
		progressCount = 0;

		if (!url || url.length == 0)
		{
			videoPlayer.play();
			return;
		}

		//destroyVideoPlayer();
		$videoContainer.show();

		var isYouTube = TabeebVideoService.isYouTubeUrl(url);

		var videoSetupFunction = isManifest(url) ? setupAzureVideoPlayer : setupVideoJSPlayer;

		videoSetupFunction.call(that, url).then(function () {
			try
			{
				$controlBar = $videoContainer.find(".vjs-control-bar");
				// Hide on iOS since iOS will not let us start videos without natural click event inside the YouTube iFrame
				if (isYouTube && TabeebInputService.isTouchDevice())
				{
					$canvasElement.hide();
					$videoContainer.addClass("nocontrolsiOS");
				}

			}
			catch (exception)
			{
				console.error(exception);
			}
		});
	};

	function setVideoError (msg) {
		$videoContainer.find(".vjs-error-display div").text(msg).parent().show();
	}

	/**
	 * @param {String} url
	 * @returns {boolean}
	 */
	function isManifest (url) {
		return url.toLowerCase().indexOf("/manifest") + "/manifest".length == url.length;
	}

	this.setVolume = function (volume) {
		videoPlayer.volume(volume);
	};

	this.resume = function () {
		if (videoPlayer)
			videoPlayer.play();
	};

	this.pause = function () {
		if (videoPlayer && isVideoPlayerLoaded)
			videoPlayer.pause();
	};

	this.isPlaying = function () {
		if (!videoPlayer)
			return false;
		else
			return !videoPlayer.paused();
	};

	this.setCurrentTime = function (time) {
		try
		{
			if (videoPlayer != null && isVideoPlayerLoaded)
				videoPlayer.currentTime(time);
		} catch (e)
		{
		}
	};

	this.hide = function () {
		if (videoPlayer && isVideoPlayerLoaded)
			videoPlayer.pause();
		$videoContainer.hide();
	};

	this.getCurrentPlaybackTime = function () {
		if (videoPlayer == null)
			return -1;

		return videoPlayer.currentTime();
	};

	this.dispose = function () {
		console.log("Destroying Video Service");
		destroyVideoPlayer();
	};

	this.getVideoPlayer = function () { return videoPlayer; };

	this.tapPlay = function (event) {
		//        videoPlayer.tech.playVideoIsAllowed = true;
		//        $videoContainer.click();
		//        videoPlayer.play();
	};
}

TabeebVideoService.getThumbnailForVideo = function (url, cb) {
	var videoId = TabeebVideoService.getYouTubeVideoId(url);

	if (videoId != null)
	{
		if (cb)
			cb("http://img.youtube.com/vi/" + videoId + "/hqdefault.jpg");
		//return "http://img.youtube.com/vi/" + videoId + "/default.jpg"; // Default
		return "http://img.youtube.com/vi/" + videoId + "/hqdefault.jpg"; // High quality
		//return "http://img.youtube.com/vi/" + videoId + "/mqdefault.jpg"; // Medium quality
		//return "http://img.youtube.com/vi/" + videoId + "/sddefault.jpg"; // Standard definition
		//return "http://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg"; // Maximum resolution
	}

	return null;
};

TabeebVideoService.getThumbnailForVideoVimeo = function (url, cb) {
	var urlSplit = url.split('/');
	var id = urlSplit[urlSplit.length - 1];
	$.ajax({
		type: 'GET',
		url: 'https://vimeo.com/api/v2/video/' + id + '.json',
		jsonp: 'callback',
		dataType: 'jsonp',
		success: function (data) {
			cb(data[0].thumbnail_large);
		},
		failure: function (error) {
			console.error(error);
			cb(null);
		}
	});
};

TabeebVideoService.getThumbnailUrl = function (url, cb) {
	if (this.isYouTubeUrl(url))
		return this.getThumbnailForVideo(url, cb);
	else if (this.isVimeoUrl(url))
		return this.getThumbnailForVideoVimeo(url, cb);
};

TabeebVideoService.isYouTubeUrl = function (url) {
	return (url.toLowerCase().indexOf("youtube.com") != -1);
};

TabeebVideoService.isVimeoUrl = function (url) {
	return (url.toLowerCase().indexOf("vimeo.com") >= 0)
};

TabeebVideoService.getYouTubeVideoId = function (url) {
	if (!TabeebVideoService.isYouTubeUrl(url))
		return null;

	// Extract the video ID
	return TabeebPlayerUtil.getQueryParameterByName(url, "v");
};

TabeebVideoService.VideoServiceEventType =
{
	videoTimeUpdated: "videoTimeUpdated",
	videoTimeSeeked: "videoTimeSeeked",
	videoPaused: "videoPaused",
	videoPlayed: "videoPlayed",
	volumeChanged: "volumeChanged",
	videoPlayerReady: "videoPlayerReady"
};

TabeebVideoService.VIDEO_CONTROL_BAR_HEIGHT = 36;
TabeebVideoService.VIDEO_CONTROL_BAR_TRACKING_BAR_HEIGHT = 6;

TabeebVideoService.PlayerTech =
{
	None: 0,
	Normal: 1,
	YouTube: 2
};
