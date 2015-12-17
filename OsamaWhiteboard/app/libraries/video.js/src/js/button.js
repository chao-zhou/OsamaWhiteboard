/* Button - Base class for all buttons
================================================================================ */
/**
 * Base class for all buttons
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @class
 * @constructor
 */
vjs_original.Button = vjs_original.Component.extend({
  /**
   * @constructor
   * @inheritDoc
   */
  init: function(player, options){
    vjs_original.Component.call(this, player, options);

    this.emitTapEvents();

    this.on('tap', this.onClick);
    this.on('click', this.onClick);
    this.on('focus', this.onFocus);
    this.on('blur', this.onBlur);
  }
});

vjs_original.Button.prototype.createEl = function(type, props){
  var el;

  // Add standard Aria and Tabindex info
  props = vjs_original.obj.merge({
    className: this.buildCSSClass(),
    'role': 'button',
    'aria-live': 'polite', // let the screen reader user know that the text of the button may change
    tabIndex: 0
  }, props);

  el = vjs_original.Component.prototype.createEl.call(this, type, props);

  // if innerHTML hasn't been overridden (bigPlayButton), add content elements
  if (!props.innerHTML) {
    this.contentEl_ = vjs_original.createEl('div', {
      className: 'vjs-control-content'
    });

    this.controlText_ = vjs_original.createEl('span', {
      className: 'vjs-control-text',
      innerHTML: this.localize(this.buttonText) || 'Need Text'
    });

    this.contentEl_.appendChild(this.controlText_);
    el.appendChild(this.contentEl_);
  }

  return el;
};

vjs_original.Button.prototype.buildCSSClass = function(){
  // TODO: Change vjs-control to vjs-button?
  return 'vjs-control ' + vjs_original.Component.prototype.buildCSSClass.call(this);
};

  // Click - Override with specific functionality for button
vjs_original.Button.prototype.onClick = function(){};

  // Focus - Add keyboard functionality to element
vjs_original.Button.prototype.onFocus = function(){
  vjs_original.on(document, 'keydown', vjs_original.bind(this, this.onKeyPress));
};

  // KeyPress (document level) - Trigger click when keys are pressed
vjs_original.Button.prototype.onKeyPress = function(event){
  // Check for space bar (32) or enter (13) keys
  if (event.which == 32 || event.which == 13) {
    event.preventDefault();
    this.onClick();
  }
};

// Blur - Remove keyboard triggers
vjs_original.Button.prototype.onBlur = function(){
  vjs_original.off(document, 'keydown', vjs_original.bind(this, this.onKeyPress));
};
