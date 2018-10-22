define(["connectionManager", "serverNotifications", "events", "globalize", "emby-button"], function(connectionManager, serverNotifications, events, globalize, EmbyButtonPrototype) {
    "use strict";

    function addNotificationEvent(instance, name, handler) {
        var localHandler = handler.bind(instance);
        events.on(serverNotifications, name, localHandler), instance[name] = localHandler
    }

    function removeNotificationEvent(instance, name) {
        var handler = instance[name];
        handler && (events.off(serverNotifications, name, handler), instance[name] = null)
    }

    function showPicker(button, apiClient, itemId, likes, isFavorite) {
        return apiClient.updateFavoriteStatus(apiClient.getCurrentUserId(), itemId, !isFavorite)
    }

    function onClick(e) {
        var button = this,
            id = button.getAttribute("data-id"),
            serverId = button.getAttribute("data-serverid"),
            apiClient = connectionManager.getApiClient(serverId),
            likes = this.getAttribute("data-likes"),
            isFavorite = "true" === this.getAttribute("data-isfavorite");
        likes = "true" === likes || "false" !== likes && null, showPicker(button, apiClient, id, likes, isFavorite).then(function(userData) {
            setState(button, userData.Likes, userData.IsFavorite)
        })
    }

    function onUserDataChanged(e, apiClient, userData) {
        var button = this;
        userData.ItemId === button.getAttribute("data-id") && setState(button, userData.Likes, userData.IsFavorite)
    }

    function setState(button, likes, isFavorite, updateAttribute) {
        var icon = button.querySelector("i");
        isFavorite ? (icon && (icon.innerHTML = "&#xE87D;", icon.classList.add("ratingbutton-icon-withrating")), button.classList.add("ratingbutton-withrating")) : (icon && (icon.innerHTML = "&#xE87D;", icon.classList.remove("ratingbutton-icon-withrating")), button.classList.remove("ratingbutton-withrating")), !1 !== updateAttribute && (button.setAttribute("data-isfavorite", isFavorite), button.setAttribute("data-likes", null === likes ? "" : likes))
    }

    function setTitle(button) {
        button.title = globalize.translate("sharedcomponents#Favorite");
        var text = button.querySelector(".button-text");
        text && (text.innerHTML = button.title)
    }

    function clearEvents(button) {
        button.removeEventListener("click", onClick), removeNotificationEvent(button, "UserDataChanged")
    }

    function bindEvents(button) {
        clearEvents(button), button.addEventListener("click", onClick), addNotificationEvent(button, "UserDataChanged", onUserDataChanged)
    }
    var EmbyRatingButtonPrototype = Object.create(EmbyButtonPrototype);
    EmbyRatingButtonPrototype.createdCallback = function() {
        EmbyButtonPrototype.createdCallback && EmbyButtonPrototype.createdCallback.call(this)
    }, EmbyRatingButtonPrototype.attachedCallback = function() {
        EmbyButtonPrototype.attachedCallback && EmbyButtonPrototype.attachedCallback.call(this);
        var itemId = this.getAttribute("data-id"),
            serverId = this.getAttribute("data-serverid");
        if (itemId && serverId) {
            var likes = this.getAttribute("data-likes"),
                isFavorite = "true" === this.getAttribute("data-isfavorite");
            likes = "true" === likes || "false" !== likes && null, setState(this, likes, isFavorite, !1), bindEvents(this)
        }
        setTitle(this)
    }, EmbyRatingButtonPrototype.detachedCallback = function() {
        EmbyButtonPrototype.detachedCallback && EmbyButtonPrototype.detachedCallback.call(this), clearEvents(this)
    }, EmbyRatingButtonPrototype.setItem = function(item) {
        if (item) {
            this.setAttribute("data-id", item.Id), this.setAttribute("data-serverid", item.ServerId);
            var userData = item.UserData || {};
            setState(this, userData.Likes, userData.IsFavorite), bindEvents(this)
        } else this.removeAttribute("data-id"), this.removeAttribute("data-serverid"), this.removeAttribute("data-likes"), this.removeAttribute("data-isfavorite"), clearEvents(this)
    }, document.registerElement("emby-ratingbutton", {
        prototype: EmbyRatingButtonPrototype,
        extends: "button"
    })
});