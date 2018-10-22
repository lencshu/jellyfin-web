define(["events"], function(events) {
    "use strict";

    function loadStrings(plugin, globalize) {
        var strings = plugin.getTranslations ? plugin.getTranslations() : [];
        return globalize.loadStrings({
            name: plugin.id || plugin.packageName,
            strings: strings
        })
    }

    function definePluginRoute(pluginManager, route, plugin) {
        route.contentPath = pluginManager.mapPath(plugin, route.path), route.path = pluginManager.mapRoute(plugin, route), Emby.App.defineRoute(route, plugin.id)
    }

    function PluginManager() {
        this.pluginsList = []
    }
    var cacheParam = (new Date).getTime();
    return PluginManager.prototype.loadPlugin = function(url) {
        console.log("Loading plugin: " + url);
        var instance = this;
        return new Promise(function(resolve, reject) {
            require([url, "globalize", "appRouter"], function(pluginFactory, globalize, appRouter) {
                var plugin = new pluginFactory;
                if (instance.pluginsList.filter(function(p) {
                        return p.id === plugin.id
                    })[0]) return void resolve(url);
                plugin.installUrl = url;
                var urlLower = url.toLowerCase(); - 1 === urlLower.indexOf("http:") && -1 === urlLower.indexOf("https:") && -1 === urlLower.indexOf("file:") && 0 !== url.indexOf(appRouter.baseUrl()) && (url = appRouter.baseUrl() + "/" + url);
                var separatorIndex = Math.max(url.lastIndexOf("/"), url.lastIndexOf("\\"));
                plugin.baseUrl = url.substring(0, separatorIndex);
                var paths = {};
                paths[plugin.id] = plugin.baseUrl, requirejs.config({
                    waitSeconds: 0,
                    paths: paths
                }), instance.register(plugin), plugin.getRoutes && plugin.getRoutes().forEach(function(route) {
                    definePluginRoute(instance, route, plugin)
                }), "skin" === plugin.type ? resolve(plugin) : loadStrings(plugin, globalize).then(function() {
                    resolve(plugin)
                }, reject)
            })
        })
    }, PluginManager.prototype.register = function(obj) {
        this.pluginsList.push(obj), events.trigger(this, "registered", [obj])
    }, PluginManager.prototype.ofType = function(type) {
        return this.pluginsList.filter(function(o) {
            return o.type === type
        })
    }, PluginManager.prototype.plugins = function() {
        return this.pluginsList
    }, PluginManager.prototype.mapRoute = function(plugin, route) {
        return "string" == typeof plugin && (plugin = this.pluginsList.filter(function(p) {
            return (p.id || p.packageName) === plugin
        })[0]), route = route.path || route, 0 === route.toLowerCase().indexOf("http") ? route : "/plugins/" + plugin.id + "/" + route
    }, PluginManager.prototype.mapPath = function(plugin, path, addCacheParam) {
        "string" == typeof plugin && (plugin = this.pluginsList.filter(function(p) {
            return (p.id || p.packageName) === plugin
        })[0]);
        var url = plugin.baseUrl + "/" + path;
        return addCacheParam && (url += -1 === url.indexOf("?") ? "?" : "&", url += "v=" + cacheParam), url
    }, new PluginManager
});