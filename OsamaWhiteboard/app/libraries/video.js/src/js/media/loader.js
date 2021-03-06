/**
 * The Media Loader is the component that decides which playback technology to load
 * when the player is initialized.
 *
 * @constructor
 */
vjs_original.MediaLoader = vjs_original.Component.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs_original.Component.call(this, player, options, ready);

    // If there are no sources when the player is initialized,
    // load the first supported playback technology.
    if (!player.options_['sources'] || player.options_['sources'].length === 0) {
      for (var i=0,j=player.options_['techOrder']; i<j.length; i++) {
        var techName = vjs_original.capitalize(j[i]),
            tech = window['VideoJS'][techName];

        // Check if the browser supports this technology
        if (tech && tech.isSupported()) {
          player.loadTech(techName);
          break;
        }
      }
    } else {
      // // Loop through playback technologies (HTML5, Flash) and check for support.
      // // Then load the best source.
      // // A few assumptions here:
      // //   All playback technologies respect preload false.
      player.src(player.options_['sources']);
    }
  }
});
