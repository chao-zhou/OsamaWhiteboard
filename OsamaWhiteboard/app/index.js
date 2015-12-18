(function () {
    var optBuilder = new OptionBuilder(option);
    tabeebPlayer = $(".whiteboardPlugin")
          .tabeebPlayer(optBuilder.option())
          .data("tabeebPlayer");
})();