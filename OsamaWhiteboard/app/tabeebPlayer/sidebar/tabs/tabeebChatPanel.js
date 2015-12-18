/**
 * Created by cody on 9/28/15.
 */

/**
 * @param {jQuery} $sideBar
 * @param {jQuery} $triggerElement
 * @param {TabeebChatManager} chatMgr
 * @param {TabeebUserManager} userMgr
 * @constructor
 */
function TabeebChatPanel ($sideBar, $triggerElement, userMgr, chatMgr) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $panel = null;
	/**@type {jQuery}*/
	var $chatMessageContainer = null;
	/**@type {jQuery}*/
	var $textInput = null;
	var $header = null;

	//</editor-fold>

	var service = {
		resize: resize,
		dispose: dispose
	};

	init();

	return service;

	function init () {
		$panel = $sideBar.find(".tabeebChatPanel");
		$chatMessageContainer = $sideBar.find(".tabeebChatMessagesContainer");
		$textInput = $sideBar.find(".chatMessageInput");
		$header = $panel.find(".tabeebChatPanelHeader");
		$(chatMgr).on(TabeebChatManager.Events.messageAdded, onChatMessageAdded);
		$(chatMgr).on(TabeebChatManager.Events.messagesAdded, onChatMessagesAdded);
		$(chatMgr).on(TabeebChatManager.Events.messagesCleared, onChatMessagesCleared);
		$textInput.on('keypress', onKeyPress);
		resize();
	}

	//<editor-fold name="Public Methods">

	function dispose () {

	}

	function resize () {
		var availableHeight = parseFloat($chatMessageContainer.parent().height()) - parseFloat($textInput.outerHeight()) - 12;
		var headerHeight = parseFloat($header.outerHeight());
		availableHeight -= headerHeight;

		$chatMessageContainer.css('max-height', availableHeight);
	}

	//</editor-fold>

	function onKeyPress (event) {
		if (event.which == 13)
		{ // ENTER key
			$triggerElement.trigger($.Event(TabeebChatPanel.Events.sendChatMessage, {text: $textInput.val()}));
			$textInput.val('');
			event.preventDefault();
		}
	}

	function scrollToBottom () {
		$chatMessageContainer.animate({'scroll-top': $chatMessageContainer[0].scrollHeight}, 'fast');
	}

	function removeDuplicateDates () {
		var $dates = $chatMessageContainer.find(".tabeebDateTime");
		if ($dates.length >= 2)
		{
			var $date1 = $($dates[$dates.length - 1]);
			var $date2 = $($dates[$dates.length - 2]);

			if ($date1.text() == $date2.text())
				$date1.remove();
		}
	}

	/**
	 * @param {TabeebChatMessage} chatMessage
	 */
	function addChatMessage (chatMessage) {
		var $message = $(createHTMLForChatMessage(chatMessage));
		$chatMessageContainer.append($message);
		removeDuplicateDates();
	}

	function onChatMessageAdded (event) {
		/**@type {TabeebChatMessage}*/
		var chatMessage = event.message;
		addChatMessage(chatMessage);

		removeDuplicateDates();
		scrollToBottom();
	}

	function onChatMessagesAdded (event) {
		/**@type {Array.<TabeebChatMessage>}*/
		var chatMessages = event.messages;
		chatMessages.forEach(function (msg) { addChatMessage(msg); });

		removeDuplicateDates();
		setTimeout(function () {
			scrollToBottom();
		}, 150);
	}

	function onChatMessagesCleared () {
		$chatMessageContainer.children().remove();
	}

	/**
	 * @param {Date} date
	 */
	function convertDateToString (date) {
		if (typeof(date) === 'string')
			date = new Date(date);

		var now = new Date();
		if (now.toDateString() == date.toDateString())
		{
			return date.toLocaleTimeString(navigator.language, {hour: '2-digit', minute: '2-digit'}) + ", today";
		}
		else
		{
			return date.toLocaleDateString();
		}
	}

	/**
	 * @param {TabeebChatMessage} chatMessage
	 */
	function createHTMLForChatMessage (chatMessage) {
		var html = '';
		var dateString = convertDateToString(chatMessage.timeStamp);
		html += '<li class="tabeebDateTime">' + dateString + '</li>';
		html += '<li class="tabeebChatMessage">';
		var user = userMgr.find(chatMessage.userId);
		var avatarUrl = user.avatarUrl;
		if (avatarUrl && avatarUrl.length > 0)
			html += '<div class="tabeebAvatar"><img src="' + avatarUrl + '" /></div>';
		else
			html += TabeebPlayerUtil.createHTMLForBlankAvatar(user.displayName).addClass("tabeebAvatar")[0].outerHTML;
		html += '<div class="tabeebChatMessageText"> ' + TabeebPlayerUtil.escapeHtml(chatMessage.message) + '<br><div class="tabeebChatName">- ' + user.displayName + '</div></div>';
		html += '</li>';
		return html;
	}
}

TabeebChatPanel.Events = {
	sendChatMessage: "sendChatMessage"
};