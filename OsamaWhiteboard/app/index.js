(function () {
    var optBuilder = new OptionBuilder(option);
    tabeebPlayer = $(".whiteboardPlugin")
          .tabeebPlayer(optBuilder.option())
          .data("tabeebPlayer");


    $(window).on("resize", onWindowResize);

    function onWindowResize() {
        tabeebPlayer.handleResize();
    }

    onWindowResize();
})();