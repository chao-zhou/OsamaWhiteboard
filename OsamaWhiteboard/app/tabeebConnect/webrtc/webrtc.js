var RTC = setupRTC();
var RTCPeerconnection = RTC.peerconnection;
function webRtc(opts) {
    var config = {
        constraints: ['audio', 'video'],
        debug: false,
        domain: window.location.hostname,
        //remoteVideosEl: '',
        boshUrl: '/http-bind'
    };
    /**
     * @type {Strophe.Connection}
     */
    var connection;
    var localStream = null;
    var peers = {};
    var room;
    var self = this;
    var userid;

    setup();

    var service = {
        connect: connect,
        disconnect: disconnect
    };
    return service;

    ////////////////////// IMPLEMENTATION ////////////////////// 

    function bindEventHandlers() {
        // listen for ungraceful disconnect
        $(window).bind('beforeunload', terminateConnection);

        // setup jingle event handlers    
        $(document).bind('mediaready.jingle', onMediaReady);
        $(document).bind('mediafailure.jingle', onMediaFailure);
        $(document).bind('callincoming.jingle', onCallIncoming);
        $(document).bind('callactive.jingle', onCallActive);
        $(document).bind('callterminated.jingle', onCallTerminated);
        $(document).bind('iceconnectionstatechange.jingle', onIceConnectionStateChange);
        $(document).bind('mute.jingle', onMute);
        $(document).bind('unmute.jingle', onUnmute);
    }

    function connect(contentName, user) {
        room = contentName;
        userid = user;

        startLocalMedia();

        connection = new Strophe.Connection(config.boshUrl);
        if (config.debug) {
            connection.rawInput = function (data) { console.info('RTC: RECV: ' + data); };
            connection.rawOutput = function (data) { console.info('RTC: SEND: ' + data); };
        }
        $(document).one('mediaready.jingle', function()
        {
            connection.jingle.pc_constraints = RTC.pc_constraints;
            connection.connect(config.domain, null, onConnectionStatus);
        });
    }

    function disconnect() {
        if (localStream) localStream.stop();
        if (connection && connection.connected) connection.disconnect();
        terminateConnection();
    }

    function getStatusString(status) {
        switch (status) {
            case Strophe.Status.ERROR:
                return "ERROR";
            case Strophe.Status.CONNECTING:
                return "CONNECTING";
            case Strophe.Status.CONNFAIL:
                return "CONNFAIL";
            case Strophe.Status.AUTHENTICATING:
                return "AUTHENTICATING";
            case Strophe.Status.AUTHFAIL:
                return "AUTHFAIL";
            case Strophe.Status.CONNECTED:
                return "CONNECTED";
            case Strophe.Status.DISCONNECTED:
                return "DISCONNECTED";
            case Strophe.Status.DISCONNECTING:
                return "DISCONNECTING";
            case Strophe.Status.ATTACHED:
                return "ATTACHED";
            default:
                return "unknown";
        }
    }

    function getConnectionFromSession(session) {
        var from = session.peerjid.split('/');
        return {
            id: from[from.length - 1],
            remoteStream: session.remoteStream,
            sid: session.sid
        };
    }

    function getUserFromPresence(pres) {
        var presence = xmlToJson(pres);
        var from = presence['@attributes'].from.split('/');
        return {
            affiliation: presence.x.item['@attributes'].affiliation,
            id: from[from.length - 1],
            localStream: null,
            remoteStream: null,
            role: presence.x.item['@attributes'].role,
            sid: null,
            userid: presence['@attributes'].userid
        };
    }

    function joinContent() {
        contentName = room + '@conference.' + config.domain;
        nickname = Strophe.getNodeFromJid(connection.jid);

        connection.addHandler(onPresence.bind(), null, 'presence', null, null, contentName, { matchBare: true });
        connection.addHandler(onPresenceUnavailable.bind(), null, 'presence', 'unavailable', null, contentName, { matchBare: true });

        pres = $pres({ to: contentName + '/' + nickname, userid: userid }).c('x', { xmlns: 'http://jabber.org/protocol/muc' });
        connection.send(pres);
    };

    function loadConfig(options) {
        for (item in options) config[item] = options[item];
    }

    function onCallActive(event, video, sid) {
    }

    function onCallIncoming(event, sid) {
        var session = connection.jingle.sessions[sid];
        session.sendAnswer();
        session.accept();
    }

    function onCallTerminated(event, sid, reason) {
    }

    function onConnectionStatus(status, message) {
        console.info('RTC: connection status: ' + getStatusString(status), message);
        if (status === Strophe.Status.CONNECTED) {
            console.info('RTC: connection jid: ', connection.jid);
            waitToJoin();
        }
    }

    function onIceConnectionStateChange(event, sid, session) {
        console.info('RTC: ice state for', sid, session.peerconnection.iceConnectionState);
        console.info('RTC: sig state for', sid, session.peerconnection.signalingState);
        // works like charm, unfortunately only in chrome and FF nightly, not FF22 beta
        if (session.peerconnection.signalingState == 'stable' &&
            (session.peerconnection.iceConnectionState == 'connected' || session.peerconnection.iceConnectionState == 'completed')) {
            console.info('RTC: onIceConnectionStateChange', event, sid, session);
            $(document).trigger('webrtc.connectionEstablished', getConnectionFromSession(session));
        }
    }

    function onMediaFailure() {
        console.warn('could not get media');
    }

    function onMediaReady(event, stream) {
        localStream = stream;
        connection.jingle.localStream = stream;
        $(document).trigger('webrtc.localStreamReady', stream);
    }

    function onMute(event, sid, content) {
        console.info('RTC: session', sid, 'mute:', content);
    }

    function onPresence(pres) {
        console.info('RTC: onPresence', pres);
        var from = pres.getAttribute('from'),
            type = pres.getAttribute('type');

        if (type != null) return true;
        if ($(pres).find('>x[xmlns="http://jabber.org/protocol/muc#user"]>status[code="201"]').length) {
            var create = $iq({ type: 'set', to: contentName })
                .c('query', { xmlns: 'http://jabber.org/protocol/muc#owner' })
                .c('x', { xmlns: 'jabber:x:data', type: 'submit' });
            connection.send(create);
        }

        var user = getUserFromPresence(pres);
        if (from == contentName + '/' + nickname) {
            user.localStream = localStream;
            for (var peer in peers) {
                connection.jingle.initiate(peer, contentName + '/' + nickname);
            }
            console.info('RTC: joinedRoom peers: ', peers);
        }
        else {
            peers[from] = 1;
        }

        $(document).trigger('webrtc.userJoined', user);
        return true;
    };

    function onPresenceUnavailable(pres) {
        console.info('RTC: onPresenceUnavailable');
        var from = $(pres).attr('from');
        connection.jingle.terminateByJid(from);
        delete peers[from];
        return true;
    }

    function onUnmute(event, sid, content) {
        console.info('RTC: session', sid, 'unmute:', content);
    }

    function setup() {
        loadConfig(opts);
        bindEventHandlers();
    }

    function showVideo() {
        return config.constraints.indexOf('video') > -1;
    }

    function startLocalMedia() {
        console.info('RTC: startLocalMedia with constraints: ', config.constraints);
        getUserMediaWithConstraints(config.constraints);
    }

    function terminateConnection() {
        if (connection && connection.connected) {
            $.ajax({
                type: 'POST',
                url: config.boshUrl,
                async: false,
                cache: false,
                contentType: 'application/xml',
                data: "<body rid='" + connection.rid +
                        "' xmlns='http://jabber.org/protocol/httpbind' sid='" + connection.sid +
                        "' type='terminate'><presence xmlns='jabber:client' type='unavailable'/></body>",
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.info('RTC: signout error', textStatus + ' (' + errorThrown + ')');
                }
            });
        }
    }

    function waitToJoin() {
        console.info('RTC: ...waiting to join room.');
        if (localStream && connection.connected && Strophe.getNodeFromJid(connection.jid) != null) joinContent();
        else setTimeout(function () { waitToJoin(); }, 150);
    }

    function xmlToJson(xml) {
        var obj = {};
        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        }
        else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }
        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = xmlToJson(item);
                }
                else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        }
        return obj;
    };
}
