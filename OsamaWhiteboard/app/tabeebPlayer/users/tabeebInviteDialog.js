/**
 * Created by cody on 9/29/15.
 */

/**
 * @param {jQuery} $triggerElement
 * @param {TabeebUserManager} userMgr
 * @param {$.fn.tabeebPlayer.defaults} options
 * @returns {{show: show, hide: hide}}
 * @constructor
 */
function TabeebInviteDialog ($triggerElement, userMgr, options) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $popup = null;
	/**@type {jQuery}*/
	var $textInput = null;
	/**@type {jQuery}*/
	var $userResults = null;
	/**@type {jQuery}*/
	var $closeButton = null;

	var userResults = new TabeebUserManager();

	//</editor-fold>

	var service = {
		show: show,
		hide: hide,
		resize: resize,
		dispose: dispose
	};

	init();

	return service;

	//////////////////////////

	function init () {
		$.get(TabeebPlayerUtil.getPluginBaseUrl() + "users/tabeebInviteDialog.html", onHTMLLoaded);
	}

	function onHTMLLoaded (data) {
		$popup = $(data);
		$userResults = $popup.find(".tabeebUserList");
		$textInput = $popup.find(".userSearchInput");
		$closeButton = $popup.find(".tabeebCloseDialogButton");

		var $body = $("body");

		var dialogOptions = {
			dialogClass: "tabeebDialog",
			autoOpen: false,
			draggable: true,
			height: 300,
			width: 340,
			resizable: false,
			title: "Invite Users",
			maxHeight: Math.min(500, $body.innerHeight()),
			open: function () {
				resize();
				$(".tabeebDialog .ui-dialog-titlebar").remove();
			},
			close: function () {
				$textInput.val("");
			},
			resize: resize
		};

		$popup.dialog(dialogOptions);
		$popup.parent().draggable({
			containment: $body
		});

		bindEvents();
	}

	function bindEvents () {
		$textInput.on('input', onTextInputChanged);
		$(userResults).on(TabeebUserManager.Events.usersCleared, onUsersCleared);
		$(userResults).on(TabeebUserManager.Events.userAdded, onUserAdded);
		$closeButton.on('click', hide);
		$userResults.on('click', '.tabeebInviteUserButton', onInviteButtonClicked);
		$popup.find(".tabeebClearSearchButton").on('click', onClearButtonClicked);
	}

	//<editor-fold name="User Manager Events">

	function onUsersCleared () {
		$userResults.children().remove();
	}

	function onUserAdded (event) {
		/**@type {TabeebUser}*/
		var user = event.user;
		$userResults.append(createHTMLForUser(user));
	}

	//</editor-fold>

	function onInviteButtonClicked (event) {
		var $this = $(this);

		if ($this.attr("data-email") && $this.attr("data-email").length > 0)
		{
			var email = $this.attr("data-email");
			$triggerElement.trigger($.Event(TabeebEvent.inviteExternalUser, {email: email}));
			$this.parents('.tabeebUserResult').remove();
		}
		else
		{
			var userId = $this.attr('data-id');
			var user = userResults.find(userId);
			var displayName = user.displayName;
			$triggerElement.trigger($.Event(TabeebEvent.inviteUser, {userId: userId, displayName: displayName}));
			$this.parents('.tabeebUserResult').remove();
		}

		$textInput.val("");
	}

	function onClearButtonClicked () {
		$textInput.val('');
		userResults.clear();
	}

	//<editor-fold name="Public Methods">
	function dispose () {
		$popup.dialog('destroy');
	}

	function show () {
		$popup.dialog('open');
	}

	function hide () {
		$popup.dialog('close');
	}

	function resize () {
		$userResults.css({
			'max-height': parseFloat($popup.innerHeight()) - parseFloat($textInput.height()) - 50
		});
	}

	//</editor-fold>

	function search (searchText) {
		options.callbacks.searchUser(searchText).then(
			function (users) {
				if (users.length == 0)
				{
					if (TabeebPlayerUtil.validateEmail(searchText))
					{
						$userResults.append(createExternalInviteHTML(searchText));
					}
				}

				users.forEach(
					function (user) {
						var existingUsersInSession = userMgr.find(user.id);
						if (!existingUsersInSession)
							userResults.addUser(user);
					}
				);
			}
		);
	}

	function onTextInputChanged (event) {

		var searchText = $textInput.val();
		setTimeout(function () {
			if ($textInput.val() == searchText)
			{
				userResults.clear();
				var splits = searchText.split(",");
				splits.forEach(function (text) {
					search(text);
				});
			}
		}, 1000);
	}

	//<editor-fold name="HTML Helper Methods">

	function createExternalInviteHTML (email) {
		var html = '';

		html += '<div class="tabeebUserResult">';
		html += '<img src="' + options.defaultUserAvatarUrl + '" />';
		html += email;
		html += '<span class="tabeebInviteUserButton btn btn-sm btn-default" data-email="' + email + '">Invite</span>';
		html += '</div>';

		return html;
	}

	/**
	 * @param {TabeebUser} user
	 */
	function createHTMLForUser (user) {
		var html = '';

		html += '<div class="tabeebUserResult">';

		html += '<img src="' + user.avatarUrl + '" />';
		html += user.displayName;
		html += '<span class="tabeebInviteUserButton btn btn-sm btn-default" data-id="' + user.id + '">Invite</span>';

		html += '</div>';

		return html;
	}

	//</editor-fold>
}