/**
 * Created by cody on 10/13/15.
 */

/**
 * @param {jQuery} $sideBar
 * @param {jQuery} $triggerElement
 * @param {TabeebModules} modules
 * @constructor
 */
function TabeebActivitesPanel ($sideBar, $triggerElement, modules) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $panel = null;
	/**@type {jQuery}*/
	var $header = null;
	/**@type {jQuery}*/
	var $userFilter = null;
	/**@type {jQuery}*/
	var $userFilterList = null;

	//</editor-fold>

	var service = {
		resize: resize,
		focusOnAnnotation: focusOnAnnotation
	};

	init();

	return service;

	/////////////////////

	function init () {
		$panel = $sideBar.find(".tabeebActivitiesPanel");
		$header = $sideBar.find(".tabeebActivitiesHeader");
		$userFilter = $header.find(".tabeebActivitiesUserFilter");
		$userFilterList = $userFilter.find(".tabeebActivitiesFilterList");

		bindEvents();
	}

	function bindEvents () {
		var $annotationMgr = $(modules.globalAnnotationManager);
		$annotationMgr.on(TabeebAnnotationManager.Events.annotationAdded, onAnnotationAdded);
		$annotationMgr.on(TabeebAnnotationManager.Events.annotationRemoved, onAnnotationRemoved);
		$annotationMgr.on(TabeebAnnotationManager.Events.annotationsCleared, onAnnotationsCleared);
		$annotationMgr.on(TabeebAnnotationManager.Events.annotationUpdated, onAnnotationUpdated);
		$triggerElement.on(TabeebEvent.contentDisplayed, onContentDisplayed);

		var $userMgr = $(modules.userManager);
		$userMgr.on(TabeebUserManager.Events.userAdded, onUserAdded);

		$panel.on("click", ".tabeebActivityItem", onActivityItemClicked);
		$header.find(".tabeebCurrentPageButton").on("click", onCurrentPageButtonClicked);
		$header.find(".tabeebAllPagesButton").on("click", onAllPageButtonClicked);
		$userFilterList.on("click", "li", onUserFilterItemClicked);
		$panel.on("input click", ".tabeebActivitiesLockedControls *", onAnnotationLockInputClicked);
		$panel.on("click", ".tabeebToggleHiddenControls input", onToggleHiddenButtonClicked);
	}

	//<editor-fold name="Public Methods">

	function resize () {
		var maxHeight = $sideBar.parent().height();
		maxHeight -= $header.height();
		maxHeight -= 5;
		$panel.css("max-height", maxHeight);
	}

	function focusOnAnnotation (annotationId) {
		onActivityItemClicked(null, annotationId);
	}

	//</editor-fold>

	//<editor-fold name="Events">

	function onContentDisplayed (event) {
		applyFilter();
	}

	function onAnnotationLockInputClicked (event) {
		var $this = $(this);
		console.log("Locking ann");
		var annotationId = $this.parents(".tabeebActivityItem").attr("data-annotation-id");
		modules.annotationManager.setAnnotationLocked(annotationId, $this.is(":checked"));
		modules.globalAnnotationManager.setAnnotationLocked(annotationId, $this.is(":checked"));
		event.stopPropagation();
	}

	function onToggleHiddenButtonClicked () {
		var $this = $(this);

		var isChecked = $this.is(":checked");
		console.log("Hiding annotation", isChecked);
		var annotationId = $this.parents(".tabeebActivityItem").attr("data-annotation-id");
		modules.annotationManager.setAnnotationHidden(annotationId, isChecked);
		modules.globalAnnotationManager.setAnnotationHidden(annotationId, isChecked);
		event.stopPropagation();
	}

	function onUserFilterItemClicked () {
		var $this = $(this);
		var userId = $this.attr("data-userid");

		var $button = $userFilter.find("button");
		$button.html($this.text()).append(' <span class="caret"></span>');
		if (!userId)
			$button.removeAttr("data-userid");
		else
			$button.attr("data-userid", userId);
		applyFilter();
	}

	function onUserAdded (event) {
		/**@type {TabeebUser}*/
		var user = event.user;

		$userFilterList.append('<li data-userid="' + user.id + '"><a>' + user.displayName + '</a></li>');
	}

	function hideOtherPageActivities () {
		$panel.find(".tabeebActivityItem").each(function (index, item) {
			var $item = $(item);
			var annotationId = $item.attr("data-annotation-id");
			var annotation = modules.globalAnnotationManager.find(annotationId);
			var currentPage = modules.player.currentSlideIndex + 1;
			if (annotation.pageNumber != currentPage)
				$item.hide();
			else
				$item.show();
		});
	}

	function onCurrentPageButtonClicked () {
		if ($(this).hasClass("active")) return;
		$header.find(".tabeebAllPagesButton").removeClass("active");
		$(this).addClass("active");
		applyFilter();
	}

	function onAllPageButtonClicked () {
		if ($(this).hasClass("active")) return;
		$header.find(".tabeebCurrentPageButton").removeClass("active");
		$(this).addClass("active");
		applyFilter();
	}

	function onActivityItemClicked (event, annId) {
		var annotationId = annId == null ? $(this).attr("data-annotation-id") : annId;
		var annotation = modules.annotationManager.find(annotationId);
		if (annotation.hidden === true)
		{
			modules.player.selectAnnotation(annotationId);
		}
		else
		{
			modules.annotationManager.setAnnotationHidden(annotationId, true);
		}
	}

	//</editor-fold>

	//<editor-fold name="Annotation Events">

	function onAnnotationUpdated (event) {
		var annotation = event.annotation;
		var $container = getContainerByAnnotationId(annotation.id);
		$container.find(".tabeebActivitiesPageNumber").text("Page " + annotation.pageNumber);
		applyFilter();
	}

	function onAnnotationsCleared () {
		$panel.children().remove();
	}

	function onAnnotationAdded (event) {
		var annotation = event.annotation;
		var $html = $(createHTMLForAnnotation(annotation));
		$html.css("display", "none");
		$panel.prepend($html);
		applyFilter();
		if ($html.is(":visible"))
			$html.hide().show("blind");
	}

	function onAnnotationRemoved (event) {
		var annotation = event.annotation;

		var $container = getContainerByAnnotationId(annotation.id);
		if ($container.is(":visible"))
		{
			$container.hide("blind", null, function () {
				$container.remove();
			});
		}
		else
		{
			$container.remove();
		}
	}

	//</editor-fold>

	/**
	 * @param {String} annotationId
	 * @returns {jQuery}
	 */
	function getContainerByAnnotationId (annotationId) {
		return $panel.find("[data-annotation-id='" + annotationId + "']");
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 * @returns {string}
	 */
	function createHotspotCommentHTML (annotation) {
		var html = '';
		html += '<div class="tabeebActivitiesAlignWithAvatar tabeebPreviewMessage">';
		if (annotation.type == TabeebAnnotationType.Text)
		{
			/**@type {String}*/
			var text = TabeebPlayerUtil.escapeHtml(annotation.textInfo.text);
			if (text.length > 150)
				html += text.substring(0, 150) + "...";
			else
				html += text;
		}
		else if (annotation.type == TabeebAnnotationType.Audio)
		{
			html += createAudioPlayButtonHTML(annotation);
		}
		html += '</div>';
		return html;
	}

	function createAudioPlayButtonHTML (annotation) {
		return '<span class="tabeebActivitiesPlayButton icon-play"></span>' + '<span style="color: white;">' + formatSeconds(annotation.duration / 1000) + '</span>';
	}

	function isHotspotComment (annotation) {
		return annotation.parentId && (annotation.type == TabeebAnnotationType.Text || annotation.type == TabeebAnnotationType.Audio);
	}

	function formatSeconds (seconds) {
		var date = new Date(1970, 0, 1);
		date.setSeconds(seconds);
		return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
	}

	function getUserIdFilter () {
		return $userFilter.find("button").attr("data-userid");
	}

	function applyFilter () {
		var userId = getUserIdFilter();
		var $items = $panel.find(".tabeebActivityItem");
		var allPages = $header.find(".tabeebAllPagesButton").hasClass("active");

		if (!userId)
		{
			$items.show();
			if (!allPages)
				hideOtherPageActivities();
		}
		else
		{
			$items.each(function (index, item) {
				var $item = $(item);
				var userId2 = $item.attr("data-userid");

				if (userId2 == userId)
				{
					if (allPages)
						$item.show();
					else
					{
						var annotationId = $item.attr("data-annotation-id");
						var annotation = modules.globalAnnotationManager.find(annotationId);
						if (annotation.pageNumber == modules.player.currentSlideIndex + 1)
							$item.show();
						else
							$item.hide();
					}
				}
				else
					$item.hide();
			});
		}
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 * @returns {string}
	 */
	function getMessageForAnnotation (annotation) {
		if (annotation.type == TabeebAnnotationType.Hotspot)
		{
			if (annotation.timestamp >= 0)
				return 'added a Hotspot.<br>@' + formatSeconds(annotation.timestamp);
			else
				return 'added a Hotspot.';
		}
		if (isHotspotComment(annotation))
		{
			if (annotation.type == TabeebAnnotationType.Text)
				return 'commented on a Hotspot.';
			else if (annotation.type == TabeebAnnotationType.Audio)
				return 'left a voice message on a Hotspot.';
		}
		else if (annotation.type == TabeebAnnotationType.Audio)
			return 'added an audio annotation.';
		else
		{
			if (annotation.timestamp >= 0)
				return 'added a timed annotation.<br>@' + formatSeconds(annotation.timestamp);
			else
				return 'added an annotation.';
		}
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 * @returns {string}
	 */
	function createHTMLForAnnotation (annotation) {
		var user = modules.userManager.find(annotation.layerId);

		if (annotation.type == TabeebAnnotationType.ErasedStroke)
			return '';

		var html = '<li class="tabeebActivityItem" data-userid="' + user.id + '" data-annotation-id="' + annotation.id + '">';

		html += '<div class="tabeebActivitiesMessage">';
		html += '<div class="tabeebFlex">';

		if (user.avatarUrl && user.avatarUrl.length > 0)
			html += '<img class="tabeebRoundedUserAvatar" src="' + user.avatarUrl + '" />';
		else
			html += TabeebPlayerUtil.createHTMLForBlankAvatar(user.displayName).addClass("tabeebRoundedUSerAvatar")[0].outerHTML;

		html += user.displayName + ' ' + getMessageForAnnotation(annotation);
		html += '</div>';

		if (isHotspotComment(annotation))
		{
			html += createHotspotCommentHTML(annotation)
		}
		else if (annotation.type == TabeebAnnotationType.Audio)
		{
			html += '<div class="tabeebActivitiesAlignWithAvatar">';
			html += createAudioPlayButtonHTML(annotation);
			html += '</div>';
		}

		html += '</div>';

		//TODO: Implement this when timing is appropriate
		var color = annotation.getColor ? annotation.getColor() : null;
		if (color && color.length > 0)
		{
			// Not currently a requested feature, but makes it easier to find the annotation you want
			//html += '<div class="tabeebActivitiesLockedControls"><div class="tabeebPaletteColor" style="background-color: ' + color + ';"></div><input type="checkbox" /><span class="glyphicon glyphicon-lock"></span></div>';
			//html += '<div>' + annotation.id + '</div>';
			//html += '<div class="tabeebToggleHiddenControls"><input type="checkbox" /><span class="glyphicon glyphicon-eye-open"></span></div>';

			html += '<div class="tabeebActivitiesLockedControls"><input type="checkbox" /><span class="glyphicon glyphicon-lock"></span></div>';
		}

		html += '<div class="tabeebActivitiesPageNumber">' + 'Page ' + annotation.pageNumber + '</div>';

		var date = TabeebPlayerUtil.convertDateToString(annotation.dateCreated);

		function isToday (date) {
			var d = new Date();
			return date.getDate() == d.getDate() && date.getMonth() == d.getMonth() && date.getFullYear() == d.getFullYear();
		}

		if (isToday(annotation.dateCreated))
			html += '<div class="tabeebDateTime">' + date + '<span class="tabeebTodayIndicator"></span>';
		else
			html += '<div class="tabeebDateTime">' + date + '</div>';

		html += '</li>';
		return html;
	}
}