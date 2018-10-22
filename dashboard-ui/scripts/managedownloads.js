define(["syncJobList"], function(syncJobList) {
    "use strict";
    return function(view, params) {
        var apiClient = ApiClient,
            mySyncJobList = new syncJobList({
                serverId: apiClient.serverId(),
                userId: null,
                element: view.querySelector(".syncActivity"),
                mode: "download"
            });
        view.addEventListener("viewdestroy", function() {
            mySyncJobList && (mySyncJobList.destroy(), mySyncJobList = null)
        })
    }
});