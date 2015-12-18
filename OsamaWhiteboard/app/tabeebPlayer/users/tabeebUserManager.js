/**
 * Created by cody on 9/25/15.
 */

function TabeebUserManager () {
	/**@type {Array.<TabeebUser>}*/
	this.users = [];
}

/**
 * @param {String} id
 * @returns {TabeebUser}
 */
TabeebUserManager.prototype.find = function (id) {
	for (var i = 0; i < this.users.length; i++)
	{
		var user = this.users[i];
		if (user.id == id)
			return user;
	}
	return null;
};

/**
 * @param {TabeebUser} user
 */
TabeebUserManager.prototype.addUser = function (user) {

	if (!user.hasOwnProperty('id'))
		console.warn("Adding user without id", user);

	var existingUser = this.find(user.id);
	if (existingUser != null) {
		$.extend(existingUser, user);
		$(this).trigger($.Event(TabeebUserManager.Events.userUpdated, {user: user}));
	}
	else
	{
		this.users.push(user);
		$(this).trigger($.Event(TabeebUserManager.Events.userAdded, {user: user}));
	}
};

TabeebUserManager.prototype.removeUser = function (idOrUser) {
	var id = idOrUser.hasOwnProperty('id') ? idOrUser.id : idOrUser;
	var user = this.find(id);
	var index = this.users.indexOf(user);
	if (index >= 0)
	{
		this.users.splice(index, 1);
		$(this).trigger($.Event(TabeebUserManager.Events.userRemoved, {user: user}));
	}
};

TabeebUserManager.prototype.setMuted = function (idOrUser, isMuted) {
	var id = idOrUser.hasOwnProperty('id') ? idOrUser.id : idOrUser;
	var user = this.find(id);
	if (isMuted == null)
		isMuted = !user.annotationsMuted;

	user.annotationsMuted = isMuted;
	$(this).trigger($.Event(TabeebUserManager.Events.userMuteChanged, {user: user, isMuted: isMuted}));
};

TabeebUserManager.prototype.clear = function () {
	this.users.length = 0;
	$(this).trigger($.Event(TabeebUserManager.Events.usersCleared));
};

/**
 * @returns {TabeebUser}
 */
TabeebUserManager.prototype.getThisUser = function () {
	for (var i = 0; i < this.users.length; i++)
	{
		var user = this.users[i];
		if (user.thisUser === true)
			return user;
	}
	return null;
};

TabeebUserManager.Events = {
	userAdded: "userAdded",
	userRemoved: "userRemoved",
	userUpdated: "userUpdated",
	userMuteChanged: "userMuteChange",
	usersCleared: "usersCleared"
};