/**
 * Created by cody on 9/25/15.
 */

/**
 * @param {jQuery} $sideBar
 * @param {jQuery} $triggerElement
 * @param {TabeebModules} modules
 * @constructor
 */
function TabeebSocialTab ($sideBar, $triggerElement, modules) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $userTab = null;
	/**@type {TabeebChatPanel}*/
	var chatPanel = null;
	/**@type {TabeebUsersPanel}*/
	var userPanel = null;
	/**@type {TabeebPresentationPanel}*/
	var presentationPanel = null;

	/**@type {TabeebUser}*/
	var thisUser = null;

	//</editor-fold>

	var service = {
		resize: resize,
		dispose: dispose
	};

	init();

	return service;

	function init () {
		$userTab = $sideBar.find(".tabeebSidebarUsersTab");
		presentationPanel = new TabeebPresentationPanel($sideBar, $triggerElement, modules.userManager, modules.presenterManager);
		chatPanel = new TabeebChatPanel($sideBar, $triggerElement, modules.userManager, modules.chatManager);
		userPanel = new TabeebUsersPanel($sideBar, $triggerElement, modules.inviteDialog, modules.userManager, modules.presenterManager);
	}

	//<editor-fold name="Public Methods">

	function dispose () {
		chatPanel.dispose();
		userPanel.dispose();
		presentationPanel.dispose();
	}

	function resize () {
		thisUser = modules.userManager.getThisUser();

		if (thisUser && modules.presenterManager && modules.presenterManager.getPresenterId() && modules.presenterManager.getPresenterId().length > 0 && modules.presenterManager.getPresenterId() != thisUser.id)
		{
			var $presentationPanel = $userTab.find(".tabeebPresentationPanel");
			var totalHeight = parseFloat($sideBar.innerHeight()) - 5;
			totalHeight -= getHeightOfNonPanelItems();
			var presentationPanelHeight = totalHeight * (1/5);
			var otherPanelHeights = totalHeight * (2/5) - 5;
			$presentationPanel.css({
				"height": presentationPanelHeight,
				"max-height": presentationPanelHeight
			});
			var $otherItems = $userTab.find(".tabeebSidebarPanel:not(.tabeebPresentationPanel)");
			$otherItems.css({
				"height": otherPanelHeights,
				"max-height": otherPanelHeights
			});
		}
		else
		{

			var $visibleItems = $userTab.find(".tabeebSidebarPanel:visible");
			var availableHeight = parseFloat($sideBar.innerHeight());
			availableHeight -= getHeightOfNonPanelItems();
			var height = availableHeight / $visibleItems.length;
			if ($visibleItems.length >= 3)
				height -= 5;
			$visibleItems.css({
				"height": height,
				"max-height": height
			});
		}

		presentationPanel.resize();
		userPanel.resize();
		chatPanel.resize();
	}

	//</editor-fold>

	function getHeightOfNonPanelItems () {
		var $notPanels = $userTab.children().first().find("> :not(.tabeebSidebarPanel):visible");
		var height = 0;
		for (var i = 0; i < $notPanels.length; i++) {
			var $item = $notPanels.eq(i);
			height += $item.height();
		}
		return height;
	}
}