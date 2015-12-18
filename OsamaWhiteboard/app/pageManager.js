(function () {
    PageManager = function (opt) {
        this.origin = location.origin;
        this.previewImageURL = "https://api.qunitjs.com/jquery-wp-content/themes/jquery/images/logo-qunit@2x.png";
        this.pdfURL = "https://modelica.org/events/modelica2012/authors-guide/example-abstract.pdf";

        this.pageWidth = 595;
        this.pageHeight = 841;
        this.pageCount = 27;
        this.pageNumber = 1;
    };

    PageManager.prototype.setPageNumber = function (val) {
        if (val < 1) {
            this.pageNumber = 1;
            return;
        }

        if (val > this.pageCount) {
            this.pageNumber = this.pageCount;
            return;
        }

        this.pageNumber = val || 1;
    };

    PageManager.prototype.toPrePage = function () {
        this.pageNumber = this.pageNumber == 1 ? 1 : this.pageNumber - 1;
    };

    PageManager.prototype.toNextPage = function () {
        this.pageNumber = this.pageNumber == this.pageCount ? this.pageCount : this.pageNumber + 1;
    };

    PageManager.prototype.imagePage = function () {
        return {
            contentName: "testContent",
            id: this.pageNumber,
            nextEnabled: this.pageNumber !== this.pageCount,
            previousEnabled: this.pageNumber !== 1,
            pdfPage: this.pageNumber,
            slideIndex: this.pageNumber - 1,
            slideCount: this.pageCount,
            type: TabeebContentType.Image, // type: 0
            url: this.previewImageURL,
            width: this.pageWidth,
            height: this.pageHeight
        };
    };

    PageManager.prototype.pdfPage = function () {
        return {
            contentName: "testContent",
            id: this.pageNumber,
            nextEnabled: this.pageNumber !== this.pageCount,
            previousEnabled: this.pageNumber !== 1,
            pdfPage: this.pageNumber,
            slideIndex: this.pageNumber - 1,
            slideCount: this.pageCount,
            type: TabeebContentType.Pdf, // type: 0
            url: this.pdfURL,
            width: this.pageWidth,
            height: this.pageHeight
        };
    };

    PageManager.prototype.pdfGallery = function () {
        var thumbnails = [];
        for (var i = 1; i < this.pageCount; i++) {
            thumbnails.push({
                pageId: i,
                pdfPage: i,
                pdfURL: this.pdfURL,
                contentType: TabeebContentType.Pdf,
                order: i,
            });
        }

        return thumbnails;
    }
})();