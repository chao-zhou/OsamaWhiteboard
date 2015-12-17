/**
 * the method for registering a video.js plugin
 *
 * @param  {String} name The name of the plugin
 * @param  {Function} init The function that is run when the player inits
 */
vjs_original.plugin = function(name, init){
  vjs_original.Player.prototype[name] = init;
};
