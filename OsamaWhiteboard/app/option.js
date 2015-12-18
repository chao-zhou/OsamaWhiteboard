(function () {
    var pageManager = new PageManager();
    option = {
        previousMedia: function () {
            console.log("previousMedia");
            pageManager.toPrePage();
            tabeebPlayer.setContent(pageManager.pdfPage());
        },
        nextMedia: function () {
            console.log("nextMedia");
            pageManager.toNextPage();
            tabeebPlayer.setContent(pageManager.pdfPage());
        },
        loaded: function () {
            console.log("loaded");
            var page = pageManager.imagePage();
            tabeebPlayer.setContent(page);
            tabeebPlayer.onReady(function () {
                tabeebPlayer.swapOutImageForPdf(pageManager.pdfURL, pageManager.pageNumber);
            });
            //Delay 1 second to make sure player is ready.

        },
        error: function () { console.log("error"); },
        galleryRequested: function () {
            console.log("galleryRequested");
            tabeebPlayer.setThumbnails(pageManager.pdfGallery());
        },
        setMedia: function (event, index) {
            console.log("setMedia");
            pageManager.setPageNumber(index + 1);
            tabeebPlayer.setContent(pageManager.pdfPage());
        }
    };
})()