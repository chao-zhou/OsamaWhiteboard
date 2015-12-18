/* jshint -W101 */
var config = {
    //    configLocation: './config.json', // see ./modules/HttpConfigFetch.js
    hosts: {
        domain: 'webrtcboston.collaborate.center',
        //anonymousdomain: 'guest.example.com',
        // authdomain: 'webrtcboston.collaborate.center',  // defaults to <domain>
        muc: 'conference.webrtcboston.collaborate.center', // FIXME: use XEP-0030
        bridge: 'jitsi-videobridge.webrtcboston.collaborate.center', // FIXME: use XEP-0030
        //jirecon: 'jirecon.webrtcboston.collaborate.center',
        //call_control: 'callcontrol.webrtcboston.collaborate.center',
        //focus: 'focus.webrtcboston.collaborate.center' - defaults to 'focus.webrtcboston.collaborate.center'
    },
    //  getroomnode: function (path) { return 'someprefixpossiblybasedonpath'; },
    //  useStunTurn: true, // use XEP-0215 to fetch STUN and TURN server
    //  useIPv6: true, // ipv6 support. use at your own risk
    useNicks: false,

    //tabeebConnect.js appends the roomname to this bosh
    bosh: '//webrtcboston.collaborate.center/http-bind?ROOM=', // FIXME: use xep-0156 for that

    clientNode: 'http://jitsi.org/jitsimeet', // The name of client node advertised in XEP-0115 'c' stanza
    //focusUserJid: 'focus@auth.webrtcboston.collaborate.center', // The real JID of focus participant - can be overridden here
    //defaultSipNumber: '', // Default SIP number

    // Desktop sharing method. Can be set to 'ext', 'webrtc' or false to disable.
    desktopSharingChromeMethod: 'ext',
    // The ID of the jidesha extension for Chrome.
    desktopSharingChromeExtId: 'adegdgcakdkmpacfffmjbjhagnkoncpj',
    // The media sources to use when using screen sharing with the Chrome
    // extension.
    desktopSharingChromeSources: ['screen', 'window'],
    // Required version of Chrome extension
    desktopSharingChromeMinExtVersion: '0.1',

    // The ID of the jidesha extension for Firefox. If null, we assume that no
    // extension is required.
    desktopSharingFirefoxExtId: null,
    // Whether desktop sharing should be disabled on Firefox.
    desktopSharingFirefoxDisabled: false,
    // The maximum version of Firefox which requires a jidesha extension.
    // Example: if set to 41, we will require the extension for Firefox versions
    // up to and including 41. On Firefox 42 and higher, we will run without the
    // extension.
    // If set to -1, an extension will be required for all versions of Firefox.
    desktopSharingFirefoxMaxVersionExtRequired: -1,
    // The URL to the Firefox extension for desktop sharing.
    desktopSharingFirefoxExtensionURL: null,

    // Disables ICE/UDP by filtering out local and remote UDP candidates in signalling.
    webrtcIceUdpDisable: false,
    // Disables ICE/TCP by filtering out local and remote TCP candidates in signalling.
    webrtcIceTcpDisable: false,

    openSctp: true, // Toggle to enable/disable SCTP channels
    disableStats: false,
    disableAudioLevels: false,
    channelLastN: -1, // The default value of the channel attribute last-n.
    adaptiveLastN: false,
    adaptiveSimulcast: false,
    enableRecording: false,
    enableWelcomePage: true,
    enableSimulcast: false, // blocks FF support
    logStats: false, // Enable logging of PeerConnection stats via the focus
    //    requireDisplayName: true,//Forces the participants that doesn't have display name to enter it when they enter the room.
    //    startAudioMuted: 10, //every participant after the Nth will start audio muted
    //    startVideoMuted: 10, //every participant after the Nth will start video muted
    //    defaultLanguage: "en",
    // To enable sending statistics to callstats.io you should provide Applicaiton ID and Secret.
    //    callStatsID: "",//Application ID for callstats.io API
    //    callStatsSecret: ""//Secret for callstats.io API
    /*noticeMessage: 'Service update is scheduled for 16th March 2015. ' +
     'During that time service will not be available. ' +
     'Apologise for inconvenience.'*/
};


var interfaceConfig = {
    CANVAS_EXTRA: 104,
    CANVAS_RADIUS: 7,
    SHADOW_COLOR: '#ffffff',
    INITIAL_TOOLBAR_TIMEOUT: 20000,
    TOOLBAR_TIMEOUT: 4000,
    DEFAULT_REMOTE_DISPLAY_NAME: "Fellow Jitster",
    DEFAULT_DOMINANT_SPEAKER_DISPLAY_NAME: "speaker",
    DEFAULT_LOCAL_DISPLAY_NAME: "me",
    SHOW_JITSI_WATERMARK: true,
    JITSI_WATERMARK_LINK: "https://jitsi.org",
    SHOW_BRAND_WATERMARK: false,
    BRAND_WATERMARK_LINK: "",
    SHOW_POWERED_BY: false,
    GENERATE_ROOMNAMES_ON_WELCOME_PAGE: true,
    APP_NAME: "Jitsi Meet",
    INVITATION_POWERED_BY: true,
    ACTIVE_SPEAKER_AVATAR_SIZE: 100,
    TOOLBAR_BUTTONS: ['authentication', 'microphone', 'camera', 'desktop',
        'recording', 'security', 'invite', 'chat', 'prezi', 'etherpad',
        'fullscreen', 'sip', 'dialpad', 'settings', 'hangup', 'filmstrip',
        'contacts'],
    // Determines how the video would fit the screen. 'both' would fit the whole
    // screen, 'height' would fit the original video height to the height of the
    // screen, 'width' would fit the original video width to the width of the
    // screen respecting ratio.
    VIDEO_LAYOUT_FIT: 'both',
    /**
     * Whether to only show the filmstrip (and hide the toolbar).
     */
    filmStripOnly: false
};
