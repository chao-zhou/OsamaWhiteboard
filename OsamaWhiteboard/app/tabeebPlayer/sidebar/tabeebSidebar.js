/**
 * Created by cody on 9/25/15.
 */

/**
 * @param {String} pluginBaseUrl
 * @param {jQuery} $pluginContainer
 * @param {jQuery} $pluginTriggerElement
 * @param {TabeebModules} modules
 * @param {TabeebSidebarService.defaults} optionsIn
 * @constructor
 */
function TabeebSidebarService (pluginBaseUrl, $pluginContainer, $pluginTriggerElement, modules, optionsIn) {

	//<editor-fold name="Variables">

	/**@type {TabeebSidebarService.defaults}*/
	var options = $.extend(TabeebSidebarService.defaults, optionsIn.sidebarOptions); // Make own (deep) copy
	/**@type {jQuery}*/
	var $sidebar = null;
	var selectedTab = options.defaultTab;

	var socialTab = null;
	var activitiesPanel = null;

	var loaded = false;

	//</editor-fold>

	var service = {
		resize: resize,
		getWidth: getWidth,
		setSelectedTab: setSelectedTab,
		dispose: dispose,
		toggle: toggle,
		isActive: shouldBeSideBySideWithCanvas
	};

	init();

	return service;

	//<editor-fold name="Initialization">

	function init () {
		$sidebar = $pluginContainer.find(".tabeebSidebarContainer");

		if (TabeebInputService.isTouchDevice())
		{
			options.width = options.mobileWidth;
		}

		$sidebar.load(pluginBaseUrl + 'sidebar/tabeebSidebar.html', onHTMLLoaded);

		if (options.enabled === false)
			return;

		bindEvents();
	}

	function onHTMLLoaded () {
		loaded = true;
		socialTab = new TabeebSocialTab($sidebar, $pluginTriggerElement, modules);
		activitiesPanel = new TabeebActivitesPanel($sidebar, $pluginTriggerElement, modules);
		modules.socialTab = socialTab;
		modules.activitiesService = activitiesPanel;
		setSelectedTab(options.defaultTab);

		$sidebar.find("[data-tab-change]").on("click", onTabChangeClick);
	}

	function bindEvents () {
		$(modules.presenterManager).on(TabeebPresenterManager.Events.presentationStarted + ' ' + TabeebPresenterManager.Events.presentationEnded, onPresentationEvent);
	}

	//<//editor-fold>

	//<editor-fold name="Public Methods">

	function toggle () {
		if (shouldBeSideBySideWithCanvas())
		{
			$pluginContainer.removeClass("sidebar");
		}
		else
		{
			$pluginContainer.toggleClass("sidebar");
		}
		resize();
	}

	function dispose () {
		if (socialTab)
			socialTab.dispose();
	}

	function resize () {
		if (!loaded)
			return;

		$sidebar.css({
			'min-width': options.minWidth + 'px',
			'width': options.width + 'px'
		});

		if (shouldBeSideBySideWithCanvas())
		{
			$pluginContainer.removeClass("sidebar");
			$sidebar.show();
		}
		else
		{
			$sidebar.hide();
		}
		if (socialTab)
			socialTab.resize();
		if (activitiesPanel)
			activitiesPanel.resize();
	}

	function getWidth () {
		if (options.enabled && $sidebar.is(":visible"))
			return parseFloat($sidebar.width());
		else
			return 0;
	}

	function setSelectedTab (tab) {
		var oldSelectedTab = selectedTab;
		selectedTab = tab;
		$sidebar.attr('data-tab', tab);
		var $tab = $sidebar.find(".tabeebSidebarTab[data-tab-name='" + tab + "']");
		if ($tab.length == 0)
		{
			console.warn("Unable to find tab", tab);
			return
		}
		$sidebar.find(".tabeebSidebarTab").hide();
		$tab.show();
		resize();
	}

	//</editor-fold>

	//<editor-fold name="Events">

	function onTabChangeClick (event) {
		var $this = $(this);
		var tabName = $this.attr("data-tab-change");
		setSelectedTab(tabName);
	}

	function onPresentationEvent () {
		resize();
		setSelectedTab("social");
	}

	//</editor-fold>

	/**
	 * @returns {boolean}
	 */
	function shouldBeSideBySideWithCanvas () {
		var pluginContainerWidth = parseInt($pluginContainer.width());
		var requiredPluginWidth = options.width * options.widthRatioRequiredToBeVisible;
		return (pluginContainerWidth >= requiredPluginWidth);
	}
}

TabeebSidebarService.defaults = {
	//defaultTab: 'activities',
	defaultTab: 'social',
	enabled: true,
	width: 400,
	mobileWidth: 350, //will usually apply to ipad landscape
	minWidth: 300,
	widthRatioRequiredToBeVisible: 2.5 // 3 * defaults.width
};

TabeebSidebarService.Events = {
	selectedTabChanged: "tabchange"
};