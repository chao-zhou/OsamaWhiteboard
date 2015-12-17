vjs_original.Flash.streamingFormats = {
  'rtmp/mp4': 'MP4',
  'rtmp/flv': 'FLV'
};

vjs_original.Flash.streamFromParts = function(connection, stream) {
  return connection + '&' + stream;
};

vjs_original.Flash.streamToParts = function(src) {
  var parts = {
    connection: '',
    stream: ''
  };

  if (! src) {
    return parts;
  }

  // Look for the normal URL separator we expect, '&'.
  // If found, we split the URL into two pieces around the
  // first '&'.
  var connEnd = src.indexOf('&');
  var streamBegin;
  if (connEnd !== -1) {
    streamBegin = connEnd + 1;
  }
  else {
    // If there's not a '&', we use the last '/' as the delimiter.
    connEnd = streamBegin = src.lastIndexOf('/') + 1;
    if (connEnd === 0) {
      // really, there's not a '/'?
      connEnd = streamBegin = src.length;
    }
  }
  parts.connection = src.substring(0, connEnd);
  parts.stream = src.substring(streamBegin, src.length);

  return parts;
};

vjs_original.Flash.isStreamingType = function(srcType) {
  return srcType in vjs_original.Flash.streamingFormats;
};

// RTMP has four variations, any string starting
// with one of these protocols should be valid
vjs_original.Flash.RTMP_RE = /^rtmp[set]?:\/\//i;

vjs_original.Flash.isStreamingSrc = function(src) {
  return vjs_original.Flash.RTMP_RE.test(src);
};

/**
 * A source handler for RTMP urls
 * @type {Object}
 */
vjs_original.Flash.rtmpSourceHandler = {};

/**
 * Check Flash can handle the source natively
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
vjs_original.Flash.rtmpSourceHandler.canHandleSource = function(source){
  if (vjs_original.Flash.isStreamingType(source.type) || vjs_original.Flash.isStreamingSrc(source.src)) {
    return 'maybe';
  }

  return '';
};

/**
 * Pass the source to the flash object
 * Adaptive source handlers will have more complicated workflows before passing
 * video data to the video element
 * @param  {Object} source    The source object
 * @param  {vjs_original.Flash} tech   The instance of the Flash tech
 */
vjs_original.Flash.rtmpSourceHandler.handleSource = function(source, tech){
  var srcParts = vjs_original.Flash.streamToParts(source.src);

  tech['setRtmpConnection'](srcParts.connection);
  tech['setRtmpStream'](srcParts.stream);
};

// Register the native source handler
vjs_original.Flash.registerSourceHandler(vjs_original.Flash.rtmpSourceHandler);
