(function () {
    var tabeebPlayer = $(".whiteboardPlugin")
          .tabeebPlayer({
              loaded: onLoaded
          })
          .data("tabeebPlayer");;

    function onLoaded() {

        var origin = location.origin;

        var imageToUrlThatLooksLikePdf = origin + "/app/res/test.png";
        var urlToPdf = origin + "/app/res/test.pdf";

        var pdfWidth = 595;
        var pdfHeight = 841;
        var pdfPageNumber = 1;

        // First set content of image, providing width and height of PDF page (so it can scale properly)
        var tabeebContent = {
            contentName: "testContent",
            id: "testContent",
            nextEnabled: false,
            previousEnabled: false,
            pdfPage: null,
            slideIndex: 0,
            slideCount: 1,
            type: TabeebContentType.Image, // type: 0
            url: imageToUrlThatLooksLikePdf,
            width: pdfWidth,
            height: pdfHeight
        };
        tabeebPlayer.setContent(tabeebContent);

        // Call this when your PDF is ready.
        debugger
        tabeebPlayer.swapOutImageForPdf(urlToPdf, pdfPageNumber);
    }
})();