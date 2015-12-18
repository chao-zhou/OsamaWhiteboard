"use strict";

function TabeebConnect(optionsIn) {
    var defaults =
    {
        boshUrl: '/http-bind',
        chromeExtensionId: '0',
        conferenceId: 'conference',
        debug: false,
        domain: window.location.hostname,
        getVideoElementForUser: null,
        mainVideoElement: '',
        userId: '',
        onReady: function () { }
    };
    var localStream = null;
    var options = $.extend({}, defaults, optionsIn);
    var users = [];
    var webrtc = null;

    setup();

    $(document).bind('keypress', function (event) {
        if (!event.ctrlKey)
            return;

        if (event.which == 49) {// Ctrl + 1
            console.log("Users", users);
        }
        if (event.which == 50) {
            reattachVideos();
        }
    });

    var service = {
        connect: connect,
        disconnect: disconnect,
        isAudioMuted: isAudioMuted,
        isVideoMuted: isVideoMuted,
        muteAudio: muteAudio,
        muteVideo: muteVideo,
        reattachVideos: reattachVideos,
        shareScreen: shareScreen,
        shareVideo: shareVideo,
        unmuteAudio: unmuteAudio,
        unmuteVideo: unmuteVideo
    };
    return service;

    ////////////////////// IMPLEMENTATION ////////////////////// 
    function attachMediaStream(user, video) {
        var stream = user.localStream ? user.localStream : user.remoteStream;
        console.info('RTC: attachMediaStream', user, video, stream);

        if (video === null || typeof video === 'undefined') {
            console.error('Unable to attach video stream. No video element found for user: ' + user.id);
            return;
        }
        if (stream === null || typeof video === 'undefined') {
            console.error('Unable to attach video stream. No stream found for user: ' + user.id);
            return;
        }

        var $video = $(video);
        RTC.attachMediaStream($video, stream);
        $video.show();
    }

    function attachMediaToUser(user) {
        if (options.getVideoElementForUser === null || typeof options.getVideoElementForUser !== 'function') {
            console.error('Unable to attach video stream. getVideoElementForUser is not a function.');
        }

        var videoElement = options.getVideoElementForUser(user.userid);
        console.info('RTC: attachMediaToUser', user, videoElement);

        attachMediaStream(user, videoElement);
    }

    function bindHandlers() {
        $(document).bind('webrtc.connectionEstablished', onConnectionEstablished);
        $(document).bind('webrtc.userJoined', onUserJoined);
        $(document).bind('webrtc.localStreamReady', onLocalStreamReady);
        $(document).bind('remotestreamadded.jingle', onRemoteStreamAdded);
    }

    function cleanup() {
        localStream = null;
        users = [];
        webrtc = null;
    }

    function connect() {
        webrtc = new webRtc(options);
        webrtc.connect(options.conferenceId, options.userId);
    }

    function disconnect() {
        if (localStream) localStream.stop();
        webrtc.disconnect();
        cleanup();
    }

    function getActiveUsers() {
        return users.filter(function (user) { return (user.remoteStream != null || user.localStream != null); });
    }

    function getLocalUser() {
        var filteredUsers = users.filter(function (obj) { return obj.userid === options.userId; });
        return filteredUsers.length > 0 ? filteredUsers[0] : null;
    }

    function getUserByConnection(connectionId) {
        var filteredUsers = users.filter(function (obj) { return obj.id === connectionId; });
        return filteredUsers.length > 0 ? filteredUsers[0] : null;
    }

    function getUserById(userId) {
        var filteredUsers = users.filter(function (obj) { return obj.userid === userId; });
        return filteredUsers.length > 0 ? filteredUsers[0] : null;
    }

    function getUserBySid(sid) {
        console.info('RTC: getting user by sid:', sid)
        var filteredUsers = users.filter(function (obj) { return obj.sid === sid; });
        return filteredUsers.length > 0 ? filteredUsers[0] : null;
    }

    function isAudioMuted() {
        if (!localStream)
            return true;

        var isMuted = true;

        localStream.getAudioTracks().forEach(
            function (track) {
                if (track.enabled) isMuted = false;
            });
        return isMuted;
    }

    function isVideoMuted() {
        if (!localStream)
            return true;

        var isMuted = true;

        localStream.getVideoTracks().forEach(
            function (track) {
                if (track.enabled) isMuted = false;
            });
        return isMuted;
    }

    function muteAudio() {
        setAudioEnabled(false);
    }

    function muteVideo() {
        setVideoEnabled(false);
    }

    function onConnectionEstablished(event, connection) {
        var user = getUserByConnection(connection.id);
        console.info('RTC: onConnectionEstablished: ', connection, user);

        if (user) {
            user.remoteStream = connection.remoteStream;
            user.sid = connection.sid;
            if (userIsLocal(user) === false) attachMediaToUser(user);
        }
        else console.warn('No user was found for established connection: ' + connection);

        console.info(users);
    }

    function onLocalStreamReady(event, stream) {
        localStream = stream;
        console.info('RTC: localStream: ', localStream);
        console.info('RTC: localStream video tracks: ', localStream.getVideoTracks());
        console.info('RTC: localStream audio tracks: ', localStream.getAudioTracks());
        setLocalStreamToUser(getLocalUser());

        options.onReady.call();
    }

    function onRemoteStreamAdded(event, sid, data) {
        console.info('RTC: onRemoteStreamAdded', data, sid);
        if (RTC.browser == 'firefox') { //hack for firefox
            var user = getUserBySid(sid);
            if (user) {
                var video = options.getVideoElementForUser(user.userid);
                RTC.attachMediaStream($(video), data.stream);
                waitForRemoteVideo(video, sid);
            }
            else {
                console.warn('RTC: cant find user by sid: ', sid, 'users:', users);
                //setTimeout(function () { $(document).trigger('remotestreamadded.jingle', [data, sid]); }, 10000);
            }
        }
    }

    function onUserJoined(event, user) {
        users.push(user);
        var isLocalUser = userIsLocal(user);
        console.info('RTC: onUserJoined: ', user, 'user is local:', isLocalUser);
        //if (isLocalUser) setLocalStreamToUser(user);
        reattachVideos();
    }

    function reattachVideos() {
        var users = getActiveUsers();
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var videoElement = options.getVideoElementForUser(user.userid);
            attachMediaToUser(user, videoElement);
        }
    }

    function setAudioEnabled(enabled) {
        console.info('RTC: setAudioEnabled: ', enabled);
        localStream.getAudioTracks().forEach(
            function (track) {
                track.enabled = enabled;
            });
    }

    function setLocalStreamToUser(localUser) {
        console.info('RTC: setLocalStreamToUser', localUser, localStream);
        if (localUser && localStream) {
            localUser.localStream = localStream;
            //muteVideo();
            attachMediaToUser(localUser);
        }
    }

    function setup() {
        bindHandlers();
    }

    function setVideoEnabled(enabled) {
        console.info('RTC: setVideoEnabled: ', enabled);
        localStream.getVideoTracks().forEach(
            function (track) {
                track.enabled = enabled;
            });
    }

    function shareScreen() {
        // TODO
    }

    function shareVideo() {
        // TODO
    }

    function unmuteAudio() {
        setAudioEnabled(true);
    }

    function unmuteVideo() {
        setVideoEnabled(true);
    }

    function userIsLocal(user) {
        console.info('RTC: checking if user is local userid:', user.userid, 'local id:', options.userId);
        return user.userid === options.userId;
    }

    function waitForRemoteVideo(video, sid) {
        var sess = connection.jingle.sessions[sid];
        console.info('RTC: waitForremotevideo', sess.peerconnection.iceConnectionState, sess.peerconnection.signalingState);

        var videoTracks = sess.remoteStream.getVideoTracks();
        if (videoTracks.length === 0 || video[0].currentTime > 0) {
            $(document).trigger('callactive.jingle', [video, sid]);
            RTC.attachMediaStream($(video), sess.remoteStream); // hack: why do i have to do this for FF?
        }
        else {
            setTimeout(function () { waitForRemoteVideo(video, sid); }, 100);
        }
    }
}

TabeebConnect.clientCanConnect = function () {
    console.info('RTC: Client support webRtc: ', DetectRTC.isWebRTCSupported);
    return DetectRTC.isWebRTCSupported && RTCBrowserType.isChrome() && !TabeebInputService.isTouchDevice();
};

TabeebConnect.clientCanShareScreen = function () {
    console.info('RTC: Client has chrome screenshare extension enabled: ', DetectRTC.hasChromeScreenShareExtension);
    return DetectRTC.hasChromeScreenShareExtension;
};

TabeebConnect.installChromeScreenShareExtension = function () {
    chrome.webstore.install();
};

function checkClientExtension(chromeExtensionId) {
    console.info('RTC: Checking extensions...');
    if (typeof chrome === 'undefined' || !chrome.runtime) {
        DetectRTC.hasChromeScreenShareExtension = false;
        return;
    }
    chrome.runtime.sendMessage(
        chromeExtensionId,
        { getVersion: true },
        function (response) {
            if (!response || !response.version) {
                DetectRTC.hasChromeScreenShareExtension = false;
                console.warn('Looking for chrome screenshare extension id: ' + chromeExtensionId + '. Extension not installed?: ', chrome.runtime.lastError);
                return;
            }
            DetectRTC.hasChromeScreenShareExtension = true;
            console.info('RTC: Looking for chrome screenshare extension. Found. Ext Id: ', chromeExtensionId);
        }
    );
}

DetectRTC.load(
    function () {
        console.info('RTC: DetectRTC: ', DetectRTC);
        // TODO: get this extension id into config
        checkClientExtension('adegdgcakdkmpacfffmjbjhagnkoncpj');
    });