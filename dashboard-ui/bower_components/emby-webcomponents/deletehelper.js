define(["connectionManager", "confirm", "appRouter", "globalize"], function(connectionManager, confirm, appRouter, globalize) {
    "use strict";

    function alertText(options) {
        return new Promise(function(resolve, reject) {
            require(["alert"], function(alert) {
                alert(options).then(resolve, resolve)
            })
        })
    }

    function deleteItem(options) {
        var item = options.item,
            itemId = item.Id,
            parentId = item.SeasonId || item.SeriesId || item.ParentId,
            serverId = item.ServerId,
            msg = globalize.translate("sharedcomponents#ConfirmDeleteItem"),
            title = globalize.translate("sharedcomponents#HeaderDeleteItem"),
            apiClient = connectionManager.getApiClient(item.ServerId);
        return confirm({
            title: title,
            text: msg,
            confirmText: globalize.translate("sharedcomponents#Delete"),
            primary: "cancel"
        }).then(function() {
            return apiClient.deleteItem(itemId).then(function() {
                options.navigate && (parentId ? appRouter.showItem(parentId, serverId) : appRouter.goHome())
            }, function(err) {
                var result = function() {
                    return Promise.reject(err)
                };
                return alertText(globalize.translate("sharedcomponents#ErrorDeletingItem")).then(result, result)
            })
        })
    }
    return {
        deleteItem: deleteItem
    }
});