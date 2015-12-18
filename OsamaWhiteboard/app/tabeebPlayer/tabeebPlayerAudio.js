'use strict';

/**
 * Created by Cody on 4/28/15.
 *
 * Used for audio recording and playback
 */

/**
 * @param {TabeebAnnotationManager} annotationMgr
 * @param {jQuery} $audioContainer
 * @param {jQuery} $videoServiceIn
 * @param {TabeebModules} modules
 * @param optionsIn
 * @constructor
 */
function TabeebAudioService (annotationMgr, $audioContainer, $videoServiceIn, modules, optionsIn) {
	var defaultOptions = {
		displayGalleryInVideoMode: true,
		displayPlayerInVideoMode: false
	};

	var options = $.extend(defaultOptions, optionsIn);

	var $pluginContainer = $audioContainer.parents(".tabeebPluginContainer");

	var $audioToggle = $pluginContainer.find(".tabeebAudioGalleryContainerToggle");
	var $audioGalleryContainer = $audioContainer.find(".tabeebAudioGalleryContainer");
	var $audioPlayerContainer = $audioContainer.find(".tabeebAudioPlayerContainer");
	var $audioElement = $audioPlayerContainer.find("audio");
	var $videoService = $videoServiceIn;
	var $badge = $pluginContainer.find(".tabeebAudioAnnotationBadge");
	var videoService = $videoService[0];
	var $this = $(this);
	var currentAudioLength = 0;

	/**@type {Audio}*/
	var lastRecordedAudio = null;
	var lastRecordedAudioPlaybackUrl = null;

	var audioInfo = null;

	var pausedTimeToAdd = 0;

	var currentParentAnnotation = null;

	var mutedUserIds = [];

	var recordingState = TabeebAudioService.RecordingState.Stopped;

	/**@type {AudioContext}*/
	var audioContext = null;
	/**@type {Recorder}*/
	var audioRecorder = null;
	var jsNode = null;

	var inVideoMode = false;
	var currentVideoTime = 0;
	var currentVideoTimeWhenRecordingStarted = 0;

	var recordStartTime = null;

	var that = this;

	// Used for visualization (unused as of now)
	var analyser = null;

	// Audio objects http://www.w3schools.com/tags/ref_av_dom.asp
	var soundboard = {};

	bindVideoEvents();
	bindAudioGalleryEvents();
	bindAudioElementEvents();

	function toggleAudioContainer () {
		$audioGalleryContainer.toggleClass("active");
		$audioToggle.toggleClass("active");
	}

	this.isBrowserCompatible = function () {
		return navigator.getUserMedia || navigator.webkitGetUserMedia;
	};

	this.getPlaybackAudio = function () {
		return lastRecordedAudio;
	};

	function displayUnsupportedBrowserError () {
		alert("Audio recording is not supported in your brwoser.");
	}

	this.canRecordAudio = function () {
		try {
			var AudioContext = (window.AudioContext ||
			window.webkitAudioContext ||
			window.mozAudioContext ||
			window.oAudioContext ||
			window.msAudioContext);

			navigator.getUserMedia = ( navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia);

			var audioContext = new AudioContext();
			return audioContext.createMediaStreamSource !== undefined;
		}
		catch (ex) {
			return false;
		}
	};

	/**
	 * @returns {boolean}
	 */
	function initAudioAndStartRecording () {
		AdapterJS.webRTCReady(function (isUsingPlugin) {

			try
			{
				window.AudioContext = (window.AudioContext ||
				window.webkitAudioContext ||
				window.mozAudioContext ||
				window.oAudioContext ||
				window.msAudioContext);

				navigator.getUserMedia = ( navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia);

				getUserMedia({audio: true, video: false}, initStream, function (err) {
					console.error(err);
					displayUnsupportedBrowserError();
				});
			} catch (ex) {
				displayUnsupportedBrowserError();
			}
		});

		//if (navigator.getUserMedia)
		//{
		//	navigator.getUserMedia(
		//		{
		//			audio: true
		//		},
		//		initStream,
		//		function (error) { console.error(error); }
		//	);
		//}
		//else
		//{
		//	alert("Audio recording is not supported in your browser currently.\nSupported Browsers: Chrome, Firefox");
		//	return false;
		//}

		audioContext = new AudioContext();

		analyser = audioContext.createAnalyser();
		jsNode = audioContext.createScriptProcessor(1024, 1, 1);
		analyser.smoothingTimeConstant = 0.3;
		analyser.fftSize = 1024;

		return true;
	}

	this.option = function (optionName, optionValue) {
		if (options.hasOwnProperty(optionName))
		{
			if (optionValue)
				options[optionName] = optionValue;
			else
				return options[optionName];
		}
		return null;
	};

	function shouldShowAudioContainer () {
		if (!options.displayGalleryInVideoMode && inVideoMode)
			return false;
		else
			return true;
	}

	this.showAudioContainer = function (flag) {
		if (flag && Object.keys(soundboard).length > 0 && shouldShowAudioContainer())
		{
			$audioGalleryContainer.show();
		}
		else
		{
			$audioGalleryContainer.hide();
		}
	};

	this.isAudioContainerVisible = function () {
		return $audioGalleryContainer.is(":visible");
	};

	function toggleAudioPlayer (flag) {
		if (!flag)
		{
			flag = !$audioPlayerContainer.is(":visible");
		}

		if (flag && !inVideoMode)
		{
			$audioPlayerContainer.show();
			$audioGalleryContainer.hide();
			$pluginContainer.addClass("tabeebPlayingAudio");
		}
		else
		{
			$audioPlayerContainer.hide();
			$audioGalleryContainer.show();
			$pluginContainer.removeClass("tabeebPlayingAudio");
		}
	}

	function initStream (stream) {
		var input = audioContext.createMediaStreamSource(stream);
		audioRecorder = new Recorder(input);

		input.connect(analyser);
		analyser.connect(jsNode);
		jsNode.connect(audioContext.destination);

		jsNode.onaudioprocess = function () {
			if (recordingState != TabeebAudioService.RecordingState.Recording) return;

			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			var values = 0;

			var length = array.length;
			for (var i = 0; i < length; i++)
			{
				values += array[i];
			}

			var average = values / length;
			$this.trigger($.Event(TabeebAudioService.AudioEvent.recordingVolumeChanged, {volume: average}));
		};

		startRecordingAudio();
	}

	function setRecordingState (newRecordingState) {
		var previousState = recordingState;
		recordingState = newRecordingState;

		//if (recordingState == TabeebAudioService.RecordingState.Recording)
		//    $microphoneButton.addClass("active");
		//else
		//    $microphoneButton.removeClass("active");

		var event = $.Event(TabeebAudioService.AudioEvent.stateChanged,
			{
				oldState: previousState,
				state: newRecordingState
			}
		);
		$this.trigger(event);
	}

	var BinaryFileReader = {
		read: function (file, callback) {
			var reader = new FileReader;

			var fileInfo = {
				name: file.name,
				type: file.type,
				size: file.size,
				file: null
			};

			reader.onload = function () {
				fileInfo.file = new Uint8Array(reader.result);
				callback(null, fileInfo);
			};

			reader.onerror = function () {
				callback(reader.error);
			};

			reader.readAsArrayBuffer(file);
		}
	};

	function buffersLoaded () {
		audioRecorder.exportWAV(
			function (blob) {
				//// save to the db
				BinaryFileReader.read(blob, function (err, audioInfo) {
					$this.trigger(
						$.Event(TabeebAudioService.AudioEvent.recordingFinished,
							{
								// audio data
								timestamp: currentVideoTimeWhenRecordingStarted,
								audioType: audioInfo.type,
								size: audioInfo.size,
								audioData: audioInfo.file,
								parentAnnotation: currentParentAnnotation,
								duration: getTimeSinceRecording()
							})
					);
					currentParentAnnotation = null;
				});
			});
	}

	this.getCurrentAudioOwnerUserId = function () {
		return $audioElement[0].userId;
	};

	function bindVideoEvents () {
		$videoService.on(TabeebVideoService.VideoServiceEventType.videoTimeUpdated, onVideoTimeUpdated);
		$videoService.on(TabeebVideoService.VideoServiceEventType.videoTimeSeeked, onVideoSeek);
		$videoService.on(TabeebVideoService.VideoServiceEventType.videoPaused, onVideoPause);
		$videoService.on(TabeebVideoService.VideoServiceEventType.videoPlayed, onVideoPlay);
	}

	function bindAudioElementEvents () {
		$audioElement.on('play', function () {
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioStarted,
					{
						currentTime: $audioElement[0].currentTime,
						inVideo: false,
						resuming: true,
						audio: this
					})
			)
		});
		$audioElement.on('pause', function () {
			// Only trigger this event if the audio isn't pausing because it has reached the end
			if (this.currentTime < this.duration)
				$this.trigger($.Event(TabeebAudioService.AudioEvent.audioPaused, {
						currentTime: $audioElement[0].currentTime,
						inVideo: false,
						audio: this
					})
				);
		});
		$audioElement.on('volumechange', function () {
			$this.trigger($.Event(TabeebAudioService.AudioEvent.volumeChanged,
					{
						volume: this.volume,
						inVideo: false,
						audio: this
					})
			);
		});
		$audioElement.on('seeked seeking', function () {
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioSeeked,
					{
						currentTime: $audioElement[0].currentTime,
						inVideo: false,
						audio: this
					})
			);
		});
		$audioElement.on('timeupdate', function () {
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioTimeUpdated,
				{
					currentTime: $audioElement[0].currentTime,
					inVideo: false,
					audio: this
				}));
		})
	}

	function onVideoPlay (event, timeObj) {
		currentVideoTime = timeObj.time;
		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;

			var audio = soundboard[name];
			var duration = audio.duration;
			var playtime = audio.videoPlayTime;

			if (currentVideoTime >= playtime && currentVideoTime < playtime + duration)
			{
				console.log("Starting audio: " + name);
				audio.currentTime = currentVideoTime - playtime;
				audio.play();
				$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioStarted, audio, {
					currentTime: currentVideoTime,
					inVideo: true
				}));
			}
		}
	}

	function onVideoPause () {
		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;

			soundboard[name].pause();
		}
	}

	function onVideoSeek (event, timeObj) {
		currentVideoTime = timeObj.time;
		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;

			var audio = soundboard[name];
			if (!audio.paused)
			{
				var newTime = currentVideoTime - audio.videoPlayTime;
				if (newTime < 0 || newTime >= audio.duration)
					audio.pause();
				else
					audio.currentTime = currentVideoTime - audio.videoPlayTime;
			}
		}
	}

	function onVideoTimeUpdated (event, timeObj) {
		currentVideoTime = timeObj.time;

		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;

			var audio = soundboard[name];
			var duration = audio.duration;
			var playtime = audio.videoPlayTime;

			if (!isAudioMuted(audio))
				audio.volume = 1;
			else
				audio.volume = 0;

			//audio is playing
			if (!audio.paused)
			{
				if (currentVideoTime > playtime + duration)
				{
					console.log("Pausing audio: " + name);
					audio.pause();
					$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioEnded, audio, {
						currentTime: currentVideoTime
					}));
				}
			}
			else
			{
				if (currentVideoTime >= playtime && currentVideoTime < playtime + duration && videoService.isPlaying())
				{
					console.log("Starting audio: " + name);
					audio.currentTime = currentVideoTime - playtime;
					audio.play();
					$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioStarted, audio, {
						currentTime: currentVideoTime,
						inVideo: true
					}));
				}
			}
		}
	}

	this.setAnnotations = function () {
		clearSoundboard();

		var annotations = annotationMgr.getAnnotationsByType(TabeebAnnotationType.Audio);

		var count = 0;

		// Filter out audio annotations and load them
		for (var i = 0; i < annotations.length; i++)
		{
			if (annotations[i].type != TabeebAnnotationType.Audio)
				continue;

			that.addToSoundboard(annotations[i]);
			count++;
		}

		setBadgeCount(count);

		if (count == 0)
			$audioGalleryContainer.hide();

		this.setAudioThumbnails();
	};

	function setBadgeCount (audioCount) {
		var count = audioCount || that.getAudioCount();
		if (count == 0)
			$badge.hide();
		else
			$badge.show().text(count);
	}

	function clearSoundboard () {
		// Stop all audio files
		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;
			var audio = soundboard[name];
			audio.pause();
		}

		if ($audioElement.length > 0)
		{
			$audioElement.attr('src', '');
			if ($audioElement.is(":visible"))
				toggleAudioPlayer(false);
		}

		soundboard = {};
	}

	this.playAudioWithElement = function (audioName, currentTime) {
		var audio = soundboard[audioName];
		toggleAudioPlayer(true);
		$audioElement.attr('src', audio.currentSrc);
		$audioElement.load();
		$audioElement.data('audioName', audioName);
		$audioElement[0].play();
		$audioElement[0].annotationId = audioName;
		$audioElement[0].userId = audio.userId;

		if (currentTime >= 0)
			$audioElement.one('canplay', function () { $audioElement[0].currentTime = currentTime; });

		$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioStarted, audio));
	};

	this.updateMutedUserIds = function (newMutedUserIds) {
		mutedUserIds = newMutedUserIds
	};

	this.playbackCurrentRecording = function () {
		var justCreated = false;
		if (!lastRecordedAudio)
		{
			lastRecordedAudio = new Audio(lastRecordedAudioPlaybackUrl);
			lastRecordedAudio.ontimeupdate = onAudioPlaybackTimeUpdated;
			justCreated = true;
		}

		console.log("Last Audio", lastRecordedAudio.paused);

		if (lastRecordedAudio.paused)
			lastRecordedAudio.play();
		else
			lastRecordedAudio.pause();
		return justCreated;
		//console.error("Not implemented");
	};

	function onAudioPlaybackTimeUpdated () {
		$this.trigger($.Event(TabeebAudioService.AudioEvent.recordingTimeUpdated, {currentTime: this.currentTime}));
	}

	function isAudioMuted (audio) {
		return (mutedUserIds.indexOf(audio.userId) >= 0);
	}

	this.isAudioReady = function (audioName) {
		if (audioName == null)
			return false;

		return soundboard[audioName].ready === true;
	};

	this.playAudioAnnotation = function (audioName) {
		if (!options.displayPlayerInVideoMode && inVideoMode)
		{
			var audio = soundboard[audioName];
			videoService.setCurrentTime(audio.videoPlayTime);
			videoService.play();
			$audioGalleryContainer.removeClass("active");
			return;
		}

		//Play the audio
		$audioGalleryContainer.removeClass("active");
		$audioElement.addClass("active");
		$audioToggle.removeClass("active");
		that.playAudioWithElement(audioName);
	};

	this.onready = function (audioName, callback) {
		if (this.isAudioReady(audioName))
			callback();
		else
		{
			$this.one(TabeebAudioService.AudioEvent.audioReady + audioName, function () { callback(); });
		}
	};

	function bindAudioGalleryEvents () {
		$audioToggle.on('click', toggleAudioContainer);

		$audioGalleryContainer.on('click', '.tabeebAudioPlayButton', function () {
			var $audioItem = $(this);
			var $parent = $audioItem.parent();
			var audioName = $parent.data("audioname");

			that.playAudioAnnotation(audioName);
		});

		$audioElement.on('ended', function () {
			var audioName = $(this).data('audioName');
			$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioEnded, soundboard[audioName], {currentTime: $(this)[0].currentTime}));
			toggleAudioPlayer(false);
		});

		$audioElement.on('seeked', function () {
			var audioName = $(this).data('audioName');
			$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioEnded, soundboard[audioName], {currentTime: $(this)[0].currentTime}));
		});

		$audioGalleryContainer.on('click', '.tabeebAudioDeleteButton', function () {
			var $audioItem = $(this);
			var $parent = $audioItem.parent();
			var annotationId = $parent.data("audioname");

			if (confirm("This audio will be permanently deleted. Continue?"))
				$this.trigger($.Event(TabeebAudioService.AudioEvent.audioDeleted, {annotationId: annotationId}));
		})
	}

	function createTabeebAudioEvent (eventName, audioObj, eventProperties) {
		return $.Event(eventName, $.fn.extend({audio: audioObj}, eventProperties ? eventProperties : {}));
	}

	this.dispose = function () {
		$this = null;
		that = null;
		$audioElement.remove();
		clearSoundboard();
	};

	this.setCurrentTime = function (time) {
		console.log("Setting current audio time", time);
		$audioElement[0].currentTime = time;
	};

	this.getCurrentAudio = function () {
		return $audioElement[0];
	};

	this.getCurrentTime = function () {
		return $audioElement[0].currentTime;
	};

	this.setVolume = function (volume) {
		$audioElement[0].volume = volume;
	};

	this.setAudioThumbnails = function () {
		var html = "<div style='width: auto; white-space: nowrap; font-size: inherit; font-family: inherit !important;'>";

		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;

			var audio = soundboard[name];
			var caption = audio.caption;
			var annotation = annotationMgr.find(audio.annotationId);

			html += '<div class="tabeebAudioItem" data-audioName="' + name + '" data-annotationId="' + audio.annotationId + '">';
			{
				html += '<div class="tabeebAudioPlayButton icon-play"></div>';

				//                if (audio.userId == options.userId)
				html += '<span class="tabeebAudioDeleteButton tabeeb-icon-sm icon-trash-empty tabeebGalleryDeleteButton"></span>';

				console.log("Audio Duration", audio.duration);

				if (inVideoMode)
					html += '<span>' + caption + '<br>' + formatSeconds(parseInt(audio.videoPlayTime)) + '</span>';
				else
					html += '<span>' + caption + '<br>' + formatSeconds(parseInt(annotation.duration/1000)) + '</span>';
				//html += '<span>' + audio.videoPlayTime + '</span>';
			}
			html += '</div>';
			// todo: Get date of audio creation
		}

		html += '</div>';
		$audioGalleryContainer.html(html);
	};

	function formatSeconds (seconds) {
		var date = new Date(1970, 0, 1);
		date.setSeconds(seconds);
		return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
	}

	var intervalId = 0;

	this.startRecording = function (parentAnnotation) {
		console.log("Start recording.");

		var audioService = this;
		currentParentAnnotation = parentAnnotation;

		if (!audioContext || RTCBrowserType.isFirefox())
		{
			initAudioAndStartRecording();
			return;
		}

		if (audioService.getState() == TabeebAudioService.RecordingState.Recording)
			throw "Audio Recording has already been started. Stop or pause recording before starting audio recording.";

		//Clear audio recorder if not coming from a paused state to a recording state
		if (audioService.getState() == TabeebAudioService.RecordingState.Stopped)
			audioRecorder.clear();

		startRecordingAudio();
	};

	function startRecordingAudio () {
		var wasPaused = (recordingState == TabeebAudioService.RecordingState.Paused);
		setRecordingState(TabeebAudioService.RecordingState.Recording);

		audioRecorder.record();

		currentVideoTimeWhenRecordingStarted = currentVideoTime;

		var event = $.Event(TabeebAudioService.AudioEvent.recordingStarted, {});
		$this.trigger(event);

		intervalId = setInterval(updateRecordingTime, 250);

		if (wasPaused)
		{
			recordStartTime = new Date().getTime();
			recordStartTime -= pausedTimeToAdd;
		}
		else
		{
			recordStartTime = new Date().getTime();
		}

		return true;
	}

	this.getRecordingDuration = function () {
		return getTimeSinceRecording();
	};

	function getTimeSinceRecording () {
		var then = recordStartTime;
		var now = new Date().getTime();
		return now - then;
	}

	function updateRecordingTime () {
		currentAudioLength = parseFloat(getTimeSinceRecording());

		console.log("Current Audio Length", currentAudioLength);

		$this.trigger($.Event(TabeebAudioService.AudioEvent.recordingTimeUpdated, {currentTime: currentAudioLength / 1000}));
	}

	/**
	 * @param {TabeebAnnotation} parentAnnotation
	 * @param {Boolean} dontSendAudioInfo
	 */
	this.stopRecording = function (parentAnnotation, dontSendAudioInfo) {
		setRecordingState(TabeebAudioService.RecordingState.Stopped);

		// Delay ending audio since the end of audio files are getting truncated
		setTimeout(function () {
			audioRecorder.stop();

			processAudio(!dontSendAudioInfo);

			var event = $.Event(TabeebAudioService.AudioEvent.recordingStopped, {recordingLength: getTimeSinceRecording()});
			$this.trigger(event);

			clearInterval(intervalId);
		}, 300);
	};

	function sendAudioInfo () {
		$this.trigger(
			$.Event(TabeebAudioService.AudioEvent.recordingFinished,
				{
					// audio data
					timestamp: currentVideoTimeWhenRecordingStarted,
					audioType: audioInfo.type,
					size: audioInfo.size,
					audioData: audioInfo.file,
					parentAnnotation: currentParentAnnotation,
					duration: currentAudioLength
				})
		);
		currentParentAnnotation = null;
	}

	function processAudio (sendAudio) {

		lastRecordedAudio = null;
		var audioCallback = sendAudio ? null : function (audioUrl) {
			lastRecordedAudioPlaybackUrl = audioUrl;
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioPlaybackReady));
		};

		audioRecorder && audioRecorder.exportWAV(
			function (blob) {
				BinaryFileReader.read(blob, function (err, audioinfo) {
					audioInfo = audioinfo;
					if (sendAudio)
						sendAudioInfo();
				});
			},
			null,
			audioCallback);
	}

	this.clearRecording = function () {
		if (lastRecordedAudio == null) return;

		lastRecordedAudioPlaybackUrl = null;
		lastRecordedAudio = null;
		audioRecorder.clear();

		$this.trigger($.Event(TabeebAudioService.AudioEvent.audioPlaybackCleared));
		setRecordingState(TabeebAudioService.RecordingState.Stopped);
	};

	this.pauseRecording = function () {
		if (recordingState == TabeebAudioService.RecordingState.Paused)
			return;

		pausedTimeToAdd = getTimeSinceRecording();
		setRecordingState(TabeebAudioService.RecordingState.Paused);
		clearInterval(intervalId);
		audioRecorder.stop();
	};

	this.addToSoundboard = function (annotation) //url, startTimeRelativeToVideo, annotation, annotationId, ownerUserId)
	{
		if (annotation.parentId)
			return;

		var name = annotation.id.toString();

		var audio = new Audio(annotation.url);

		audio.annotationId = annotation.id;
		audio.userId = annotation.layerId;
		audio.videoPlayTime = annotation.timestamp;
		audio.caption = annotation.caption;
		audio.playing = false;

		$(audio).on("canplaythrough", function () {
			audio.ready = true;
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioReady, {audioName: name}));
			// Trigger this event for tabeebAudioService internal use only
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioReady + name, {audioName: name}));
		});

		soundboard[name] = audio;

		setBadgeCount();

		this.showAudioContainer(true);
	};

	this.getAudioDuration = function (annotation) {
		return soundboard[annotation.id].duration;
	};

	this.getAudioCount = function () {
		var count = 0;
		for (var key in soundboard)
		{
			count++;
		}
		return count;
	};

	this.resumeAudioElement = function () {
		$audioElement[0].play();
	};

	this.resume = function (name) {
		soundboard[name].play();
		soundboard[name].playing = true;
	};

	this.play = function (name) {
		soundboard[name].play();
		soundboard[name].playing = true;

		$this.trigger(
			$.Event(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioStarted, soundboard[name],
					{
						audio: soundboard[name],
						resuming: false
					})
			));
	};

	this.pause = function (name) {
		if (soundboard[name] != null)
		{
			soundboard[name].pause();
			soundboard[name].playing = false;
		}

		if ($audioElement[0])
			$audioElement[0].pause();

		$this.trigger(
			$.Event(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioPaused, soundboard[name],
					{
						currentTime: soundboard[name] ? soundboard[name].currentTime : $audioElement[0].currentTime
					})
			));
	};

	this.setVideoMode = function (flag) {
		inVideoMode = flag;

		// Hide or show the audio gallery
		if (inVideoMode)
			$audioGalleryContainer.hide();
		else
			$audioGalleryContainer.show();
	};

	this.getState = function () { return recordingState; };

	/**
	 * @param {jQuery} $relativeElement
	 */
	this.resize = function ($relativeElement) {
		var bottom = Math.max(0, parseFloat($relativeElement.parent().outerHeight()) - parseFloat($relativeElement.outerHeight()) - parseFloat($relativeElement.css("top")));
		if (inVideoMode)
		{
			bottom -= TabeebVideoService.VIDEO_CONTROL_BAR_HEIGHT + TabeebVideoService.VIDEO_CONTROL_BAR_TRACKING_BAR_HEIGHT;
		}

		$audioGalleryContainer.add($audioPlayerContainer).css(
			{
				left: $relativeElement.css("left"),
				bottom: bottom
				//                top: Math.min(maxTop, parseFloat($relativeElement.css("top")) + parseFloat($relativeElement.outerHeight()))
			}
		).css("max-width", $relativeElement.outerWidth());

		$audioGalleryContainer.find(".tabeebAudioPlayButton:before").css("line-height", $audioGalleryContainer.height() * 0.75);
	};
}

/**
 * @readonly
 * @enum {number}
 */
TabeebAudioService.RecordingState =
{
	Stopped: 0,
	Recording: 1,
	Paused: 2
};
/**
 * @readonly
 * @enum {string}
 */
TabeebAudioService.AudioEvent =
{
	stateChanged: "statechanged",
	recordingStopped: "recordstop",
	recordingPaused: "recordpaused",
	recordingStarted: "recordstart",
	recordingFinished: "recordfinished",
	recordingTimeUpdated: "recordingTimeUpdated",
	recordingVolumeChanged: "recordingVolumeChanged",
	audioStarted: "audiostart",
	audioPaused: "audiopause",
	audioEnded: "audioend",
	audioDeleted: "audiodeleted",
	audioSeeked: "audioSeeked",
	volumeChanged: "volumeChanged",
	audioTimeUpdated: "audioTimeUpdated",
	audioReady: "audioReady",
	audioPlaybackReady: "audioPlaybackReady",
	audioPlaybackCleared: "audioPlaybackCleared"
};