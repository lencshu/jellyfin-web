define(["dom", "events"], function(dom, events) {
    "use strict";

    function getTouches(e) {
        return e.changedTouches || e.targetTouches || e.touches
    }

    function TouchHelper(elem, options) {
        options = options || {};
        var touchTarget, touchStartX, touchStartY, lastDeltaX, lastDeltaY, thresholdYMet, self = this,
            swipeXThreshold = options.swipeXThreshold || 50,
            swipeYThreshold = options.swipeYThreshold || 50,
            excludeTagNames = options.ignoreTagNames || [],
            touchStart = function(e) {
                var touch = getTouches(e)[0];
                if (touchTarget = null, touchStartX = 0, touchStartY = 0, lastDeltaX = null, lastDeltaY = null, thresholdYMet = !1, touch) {
                    var currentTouchTarget = touch.target;
                    if (dom.parentWithTag(currentTouchTarget, excludeTagNames)) return;
                    touchTarget = currentTouchTarget, touchStartX = touch.clientX, touchStartY = touch.clientY
                }
            },
            touchEnd = function(e) {
                var isTouchMove = "touchmove" === e.type;
                if (touchTarget) {
                    var deltaX, deltaY, clientX, clientY, touch = getTouches(e)[0];
                    touch ? (clientX = touch.clientX || 0, clientY = touch.clientY || 0, deltaX = clientX - (touchStartX || 0), deltaY = clientY - (touchStartY || 0)) : (deltaX = 0, deltaY = 0);
                    var currentDeltaX = null == lastDeltaX ? deltaX : deltaX - lastDeltaX,
                        currentDeltaY = null == lastDeltaY ? deltaY : deltaY - lastDeltaY;
                    lastDeltaX = deltaX, lastDeltaY = deltaY, deltaX > swipeXThreshold && Math.abs(deltaY) < 30 ? events.trigger(self, "swiperight", [touchTarget]) : deltaX < 0 - swipeXThreshold && Math.abs(deltaY) < 30 ? events.trigger(self, "swipeleft", [touchTarget]) : (deltaY < 0 - swipeYThreshold || thresholdYMet) && Math.abs(deltaX) < 30 ? (thresholdYMet = !0, events.trigger(self, "swipeup", [touchTarget, {
                        deltaY: deltaY,
                        deltaX: deltaX,
                        clientX: clientX,
                        clientY: clientY,
                        currentDeltaX: currentDeltaX,
                        currentDeltaY: currentDeltaY
                    }])) : (deltaY > swipeYThreshold || thresholdYMet) && Math.abs(deltaX) < 30 && (thresholdYMet = !0, events.trigger(self, "swipedown", [touchTarget, {
                        deltaY: deltaY,
                        deltaX: deltaX,
                        clientX: clientX,
                        clientY: clientY,
                        currentDeltaX: currentDeltaX,
                        currentDeltaY: currentDeltaY
                    }])), isTouchMove && options.preventDefaultOnMove && e.preventDefault()
                }
                isTouchMove || (touchTarget = null, touchStartX = 0, touchStartY = 0, lastDeltaX = null, lastDeltaY = null, thresholdYMet = !1)
            };
        this.touchStart = touchStart, this.touchEnd = touchEnd, dom.addEventListener(elem, "touchstart", touchStart, {
            passive: !0
        }), options.triggerOnMove && dom.addEventListener(elem, "touchmove", touchEnd, {
            passive: !options.preventDefaultOnMove
        }), dom.addEventListener(elem, "touchend", touchEnd, {
            passive: !0
        }), dom.addEventListener(elem, "touchcancel", touchEnd, {
            passive: !0
        })
    }
    return TouchHelper.prototype.destroy = function() {
        var elem = this.elem;
        if (elem) {
            var touchStart = this.touchStart,
                touchEnd = this.touchEnd;
            dom.removeEventListener(elem, "touchstart", touchStart, {
                passive: !0
            }), dom.removeEventListener(elem, "touchmove", touchEnd, {
                passive: !0
            }), dom.removeEventListener(elem, "touchend", touchEnd, {
                passive: !0
            }), dom.removeEventListener(elem, "touchcancel", touchEnd, {
                passive: !0
            })
        }
        this.touchStart = null, this.touchEnd = null, this.elem = null
    }, TouchHelper
});