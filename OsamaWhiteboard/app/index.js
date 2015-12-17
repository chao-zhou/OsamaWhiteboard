(function () {
    var tabeebPlayer = $(".whiteboardPlugin")
          .tabeebPlayer({
              undo: function () { console.log("undo");},
              redo: function () { console.log("redo"); },
              annotationAdded: function () { console.log("annotationAdded"); },
              annotationDeleted: function () { console.log("annotationDeleted"); },
              annotationRestored: function () { console.log("annotationRestored"); },
              annotationUpdateRestored: function () { console.log("annotationUpdateRestored"); },
              previousMedia: function () { console.log("previousMedia"); },
              nextMedia: function () { console.log("nextMedia"); },
              contentDisplayed: function () { console.log("contentDisplayed"); },
              annotationsDisplayed: function () { console.log("annotationsDisplayed"); },
              loaded: function () {
                  console.log("loaded");
                  loadPreviewImage();
              },
              error: function () { console.log("error"); },
              galleryRequested: function () { console.log("galleryRequested"); },
              setMedia: function () { console.log("setMedia"); },
              deletePage: function () { console.log("deletePage"); },
              audioRecordingAdded: function () { console.log("audioRecordingAdded"); },
              penColorChanged: function () { console.log("penColorChanged"); },
              textContentChanged: function () { console.log("textContentChanged"); },
              annotationsUpdated: function () { console.log("annotationsUpdated"); },
              userInvited: function () { console.log("userInvited"); },
              externalUserInvited: function () { console.log("externalUserInvited"); },
              connectToPresentation: function () { console.log("connectToPresentation"); },
              disconnectFromPresentation: function () { console.log("disconnectFromPresentation"); },
              onChatMessageAdded: function () { console.log("onChatMessageAdded"); },
              completelyLoaded: function () { console.log("completelyLoaded"); },
              onPresenterChangeRequest: function () { console.log("onPresenterChangeRequest"); },
              annotationSelected: function () { console.log("annotationSelected"); },
              annotationUnselected: function () { console.log("annotationUnselected"); }
          })
          .data("tabeebPlayer");;

    var origin = location.origin;

    var imageToUrlThatLooksLikePdf = origin + "/app/res/test.png";
    var urlToPdf = origin + "/app/res/test.pdf";

    var pdfWidth = 595;
    var pdfHeight = 841;
    var pdfPageNumber = 1;

    function loadPreviewImage() {
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

        //Delay 1 second to make sure player is ready.
        setTimeout(function () {
            swtichPDF();
        }, 1000);
    }

    function swtichPDF() {
        // Call this when your PDF is ready.
        tabeebPlayer.swapOutImageForPdf(urlToPdf, pdfPageNumber);
    }
})();