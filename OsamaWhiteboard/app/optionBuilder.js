(function () {
    OptionBuilder = function (opt) {
        this.option = function () {
            return $.extend(this.defaultOpt, opt);
        }
    }

    OptionBuilder.prototype.defaultOpt = {
        undo: function () { console.log("undo"); },
        redo: function () { console.log("redo"); },
        annotationAdded: function () { console.log("annotationAdded"); },
        annotationDeleted: function () { console.log("annotationDeleted"); },
        annotationRestored: function () { console.log("annotationRestored"); },
        annotationUpdateRestored: function () { console.log("annotationUpdateRestored"); },
        previousMedia: function () { console.log("previousMedia"); },
        nextMedia: function () { console.log("nextMedia"); },
        contentDisplayed: function () { console.log("contentDisplayed"); },
        annotationsDisplayed: function () { console.log("annotationsDisplayed"); },
        loaded: function () { console.log("loaded"); },
        error: function () { console.log("error"); },
        galleryRequested: function () { console.log("galleryRequested"); },
        setMedia: function (event, index) { console.log("setMedia"); },
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
    };
})();