/**
 * Created by cody on 9/25/15.
 */

function TabeebChatManager () {
	/**
	 * @type {Array.<TabeebChatMessage>}
	 */
	this.messages = [];
}

TabeebChatManager.prototype.find = function (msgOrId) {
	var id = msgOrId.hasOwnProperty("id") ? msgOrId.id : msgOrId;

	for (var i = 0; i < this.messages.length; i++) {
		var msg = this.messages[i];
		if (msg.id == id)
			return msg;
	}
	return null;
};

/**
 * @param {TabeebChatMessage} chatMessage
 * @returns {TabeebChatManager}
 */
TabeebChatManager.prototype.addChatMessage = function (chatMessage) {
	if (this.find(chatMessage))
		return;

	this.messages.push(chatMessage);
	$(this).trigger($.Event(TabeebChatManager.Events.messageAdded, {message: chatMessage}));
	return this;
};

/**
 * @param {Array.<TabeebChatMessage>} chatMessages
 * @returns {TabeebChatManager}
 */
TabeebChatManager.prototype.addChatMessages = function (chatMessages) {
	var self = this;
	chatMessages.forEach(function(msg) { self.messages.push(msg); });
	$(this).trigger($.Event(TabeebChatManager.Events.messagesAdded, {messages: chatMessages}));
	return this;
};

TabeebChatManager.prototype.clear = function () {
	this.messages.length = 0;
	$(this).trigger($.Event(TabeebChatManager.Events.messagesCleared, {}));
	return this;
};

TabeebChatManager.prototype.last = function () {
	if (this.messages.length == 0)
		return null;

	return this.messages[this.messages.length - 1];
};

TabeebChatManager.Events = {
	messageAdded: "messageAdded",
	messagesAdded: "messagesAdded",
	messagesCleared: "messagesCleared"
};