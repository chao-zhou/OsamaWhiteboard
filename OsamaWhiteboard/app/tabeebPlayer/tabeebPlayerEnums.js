/**
 * Created by cody on 7/8/15.
 */

/**
 * @readonly
 * @enum {string}
 */
var TabeebEvent =
{
    // Drawing
    undo: "undo", // Undo drawing operation occurred. No parameters
    redo: "redo", // Redo drawing operation occurred. No parameters
    annotationAdded: "annotationAdded", // Annotation added to drawing. Parameters: { type: TabeebAnnotationType, layerId: string,
                                        // IF STROKE:
                                        // stroke: { color: string, width: number, endpoints: [ { start: { x: number, y: number }, end: { x, y } } ] }
                                        // IF ERASED STROKE:
                                        // erasedStroke: { width: number, endpoints: [ { start: { x: number, y: number }, end: { x, y } } ] }
                                        // IF TEXT:
                                        // textInfo: { text: string, color: string, fontSize: number, point: { x: number, y: number } }
    annotationDeleted: "annotationDeleted", // Annotation removed from the drawing.
                                            // Parameters: annotation
    annotationRestored: "annotationRestored", // Annotation restored (with a Redo operation) to the drawing
    // Parameters: annotation

    // Navigation
    previousMedia: "previousMedia", // Previous Media button was clicked. Host should call setContent with new data. No parameters
    nextMedia: "nextMedia", // Next Media button was clicked. Host should call setContent with new data. No parameters

    // General status updates
    contentDisplayed: "contentDisplayed", // The media for the latest setContent call is visible to the user. No parameters
    annotationsDisplayed: "annotationsDisplayed", // The latest added annotations have been displayed

    // Misc
    loaded: "loaded", // Plugin DOM content has loaded. No parameters
    error: "error", // { message: "string" }
    galleryRequested: "galleryRequested",
    setMedia: "setMedia",
    deletePage: "deletePage",
    audioRecordingAdded: "audioRecordingAdded",
    penColorChanged: "penColorChanged",
    strokeStarted: "strokeStarted",
    strokeEnded: "strokeEnded",
    textContentChanged: "textContentChanged",
    participantUpdated: "participantUpdated",
    annotationsUpdated: "annotationsUpdated",
    screenModeChanged: "screenModeChanged",
    drawModeChanged: "drawModeChanged",
    contentModeChanged: "contentModeChanged",
    inviteUser: "inviteUser",
    inviteExternalUser: "inviteExternalUser",
    connectToPresentation: "connectToPresentation",
    disconnectFromPresentation: "disconnectFromPresentation",
    requestPresenterChange: "requestPresenterChange",
    completelyLoaded: "completelyLoaded",
    optionsUpdated: "optionsUpdated",
    annotationSelected: "annotationSelected",
    annotationUnselected: "annotationUnselected"
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebContentType =
{
    Image: 0,
    Video: 1,
    Text: 2,
    Pdf: 3
};

/**
 * @readonly
 * @enum {Number}
 */
var TabeebAnnotationMode = {
    Normal: 0,
    HideAll: 1,
    ReadOnly: 2
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebAnnotationType =
{
    Stroke: 0,
    ErasedStroke: 1,
    LaserStroke: 2,
    Text: 3,
    Audio: 4,
    Callout: 5,
    Hotspot: 6,
    Line: 100,
    Rectangle: 101,
    Ellipse: 102,
    Rectangle_Filled: 103,
    Ellipse_Filled: 104,
    ArrowEnd: 105,
    ArrowBoth: 106
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebDrawModeType =
{
    Pen: 0,
    Eraser: 1,
    Pointer: 2,
    Text: 3,
    Selection: 4,
    Cursor: 5
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebScreenModeType =
{
    Draw: 0,
    Navigation: 1,
    Gallery: 2,
    Disabled: 3,
    Text: 4,
    Spectator: 5 /* spectator of Presenter */
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebAssetType =
{
    Unknown: 0,
    Image: 1,
    Video: 2,
    Preview: 3
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebWhiteBoardType =
{
    Normal: 0,
    Text: 1
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebFinalizeStrokePolicy = {
    AllStrokes: 0,
    FirstAndLastStroke: 1
};

var TabeebPresenterEvent = {
    updatePresenterState: "updatePresenterState"
};

/**
 * @readonly
 * @enum {string}
 */
var TabeebSpectatorEvent =
{
    galleryPressed: "galleryPressed",
    setMediaIndex: "setMediaIndex",
    audioSeeked: "audioSeeked",
    audioPaused: "audioPaused",
    audioStart: "audioStart",
    videoSeeked: "videoSeeked",
    videoPaused: "videoPaused",
    videoStart: "videoStart",
    // For when you first join or presenter mode just begins
    presenterState: "presenterState",
    muteChanged: "muteChanged",
    volumeChanged: "volumeChanged",
    hotspotAudioEvent: "hotspotAudioEvent",
    hotspotDialogOpened: "hotspotDialogOpened",
    hotspotDialogClosed: "hotspotDialogClosed",
    hotspotDialogCommentClicked: "hotspotDialogCommentClicked",
    laserPointerMoved: "laserPointerMoved",
    largeVideoToggled: "largeVideoToggled",
    userAudioMutedChanged: "userAudioMutedChanged"
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebPresenterMode =
{
    None: 0,
    Presenter: 1,
    Spectator: 2
};
