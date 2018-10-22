! function() {
    for (var lastTime = 0, vendors = ["ms", "moz", "webkit", "o"], x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"], window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
    window.requestAnimationFrame || (window.requestAnimationFrame = function(callback, element) {
        var currTime = (new Date).getTime(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime)),
            id = window.setTimeout(function() {
                callback(currTime + timeToCall)
            }, timeToCall);
        return lastTime = currTime + timeToCall, id
    }), window.cancelAnimationFrame || (window.cancelAnimationFrame = function(id) {
        clearTimeout(id)
    })
}();