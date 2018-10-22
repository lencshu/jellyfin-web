! function() {
    "use strict";

    function getApiClient(serverId) {
        return connectionManager ? Promise.resolve(connectionManager.getApiClient(serverId)) : Promise.reject()
    }

    function executeAction(action, data, serverId) {
        return getApiClient(serverId).then(function(apiClient) {
            switch (action) {
                case "cancel-install":
                    var id = data.id;
                    return apiClient.cancelPackageInstallation(id);
                case "restart":
                    return apiClient.restartServer();
                default:
                    return clients.openWindow("/"), Promise.resolve()
            }
        })
    }
    var connectionManager;
    self.addEventListener("notificationclick", function(event) {
        var notification = event.notification;
        notification.close();
        var data = notification.data,
            serverId = data.serverId,
            action = event.action;
        if (!action) return clients.openWindow("/"), void event.waitUntil(Promise.resolve());
        event.waitUntil(executeAction(action, data, serverId))
    }, !1)
}();