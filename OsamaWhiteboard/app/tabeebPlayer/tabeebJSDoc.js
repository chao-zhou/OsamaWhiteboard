/**
 * Created by cody on 9/25/15.
 */

/**
 * @constructor
 * @property {String} id
 * @property {String} displayName
 * @property {String} avatarUrl
 * @property {Boolean} annotationsMuted
 * @property {Boolean} thisUser
 */
function TabeebUser () {}

/**
 * @constructor
 * @property {String} id
 * @property {String} userId
 * @property {String} message
 * @property {Date} timeStamp
 */
function TabeebChatMessage () {}

/**
 * @constructor
 * @property {TabeebHUDService} hudService
 * @property {TabeebUserManager} userManager
 * @property {TabeebChatManager} chatManager
 * @property {TabeebAnnotationManager} annotationManager
 * @property {TabeebPresenterManager} presenterManager
 * @property {TabeebSidebarService} sidebarService
 * @property {TabeebGalleryService} galleryService
 * @property {TabeebCanvasService} canvasService
 * @property {TabeebAudioService} audioService
 * @property {TabeebInviteDialog} inviteDialog
 * @property {TabeebCanvasHotspotManager} hotspotManager
 * @property {TabeebPlayer} player
 * @property {$.fn.tabeebPlayer.defaults} options
 * @property {TabeebAnnotationManager} globalAnnotationManager
 * @property {TabeebVideoService} videoService
 * @property {TabeebSocialTab} socialTab
 * @property {TabeebActivitesPanel} activitiesService
 * @property {TabeebPaletteService} paletteService
 * @property {PDFManager} pdfManager
 * @property {TabeebUndoManager} undoManager
 * @property {TabeebHUDControlBar} controlbarHUD
 * @property {TabeebHUDNavigationBar} navigationHUD
 */
function TabeebModules () {}

/**
 * @constructor
 * @property {String} audioName
 * @property {Boolean} audioPaused
 * @property {Number} currentTime
 * @property {Boolean} videoPaused
 * @property {Array} mutedUserIds
 * @property {String} slideIndex
 * @property {Boolean} isScreenSharing
 * @property {Array} hotspotDialogAnnotationId
 * @property {Array} mutedAudioUserIds
 * @property {Number} volume
 * @property {Boolean} inGallery
 */
function TabeebPresenterState () {}

/**
 * @constructor
 * @property {String} title
 * @property {TabeebWhiteBoardType} whiteboardType
 * @property {TabeebContentType} type
 * @property {String} url
 * @property {String} id
 * @property {Boolean} nextEnabled
 * @property {Boolean} previousEnabled
 * @property {Array.<TabeebAnnotation>} annotations
 * @property {String} text
 * @property {Number} slideIndex
 * @property {Number} slideCount
 * @property {Number} pdfPage
 * @property {String} contentName
 * @property {Number} [width]
 * @property {Number} [height]
 * @property {Boolean} [hideAllAnnotations]
 */
function TabeebContent () {}