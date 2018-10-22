define(["layoutManager", "dom", "css!./emby-scrollbuttons", "registerElement", "paper-icon-button-light"], function(layoutManager, dom) {
    "use strict";

    function getScrollButtonContainerHtml(direction) {
        var html = "";
        html += '<div class="scrollbuttoncontainer scrollbuttoncontainer-' + direction + ("left" === direction ? " hide" : "") + '">';
        var icon = "left" === direction ? "&#xE5CB;" : "&#xE5CC;";
        return html += '<button type="button" is="paper-icon-button-light" data-ripple="false" data-direction="' + direction + '" class="emby-scrollbuttons-scrollbutton">', html += '<i class="md-icon">' + icon + "</i>", html += "</button>", html += "</div>"
    }

    function getScrollPosition(parent) {
        return parent.getScrollPosition ? parent.getScrollPosition() : 0
    }

    function getScrollWidth(parent) {
        return parent.getScrollSize ? parent.getScrollSize() : 0
    }

    function onScrolledToPosition(scrollButtons, pos, scrollWidth) {
        pos > 0 ? scrollButtons.scrollButtonsLeft.classList.remove("hide") : scrollButtons.scrollButtonsLeft.classList.add("hide"), scrollWidth > 0 && (pos += scrollButtons.offsetWidth, pos >= scrollWidth ? scrollButtons.scrollButtonsRight.classList.add("hide") : scrollButtons.scrollButtonsRight.classList.remove("hide"))
    }

    function onScroll(e) {
        var scrollButtons = this,
            scroller = this.scroller;
        onScrolledToPosition(scrollButtons, getScrollPosition(scroller), getScrollWidth(scroller))
    }

    function getStyleValue(style, name) {
        var value = style.getPropertyValue(name);
        return value && (value = value.replace("px", "")) ? (value = parseInt(value), isNaN(value) ? 0 : value) : 0
    }

    function getScrollSize(elem) {
        var scrollSize = elem.offsetWidth,
            style = window.getComputedStyle(elem, null),
            paddingLeft = getStyleValue(style, "padding-left");
        paddingLeft && (scrollSize -= paddingLeft);
        var paddingRight = getStyleValue(style, "padding-right");
        paddingRight && (scrollSize -= paddingRight);
        var slider = elem.getScrollSlider();
        return style = window.getComputedStyle(slider, null), paddingLeft = getStyleValue(style, "padding-left"), paddingLeft && (scrollSize -= paddingLeft), paddingRight = getStyleValue(style, "padding-right"), paddingRight && (scrollSize -= paddingRight), scrollSize
    }

    function onScrollButtonClick(e) {
        var newPos, parent = dom.parentWithAttribute(this, "is", "emby-scroller"),
            direction = this.getAttribute("data-direction"),
            scrollSize = getScrollSize(parent),
            pos = getScrollPosition(parent);
        newPos = "left" === direction ? Math.max(0, pos - scrollSize) : pos + scrollSize, parent.scrollToPosition(newPos, !1)
    }
    var EmbyScrollButtonsPrototype = Object.create(HTMLDivElement.prototype);
    EmbyScrollButtonsPrototype.createdCallback = function() {}, EmbyScrollButtonsPrototype.attachedCallback = function() {
        var parent = dom.parentWithAttribute(this, "is", "emby-scroller");
        this.scroller = parent, parent.classList.add("emby-scrollbuttons-scroller"), this.innerHTML = getScrollButtonContainerHtml("left") + getScrollButtonContainerHtml("right");
        var scrollHandler = onScroll.bind(this);
        this.scrollHandler = scrollHandler;
        var buttons = this.querySelectorAll(".emby-scrollbuttons-scrollbutton");
        buttons[0].addEventListener("click", onScrollButtonClick), buttons[1].addEventListener("click", onScrollButtonClick), buttons = this.querySelectorAll(".scrollbuttoncontainer"), this.scrollButtonsLeft = buttons[0], this.scrollButtonsRight = buttons[1], parent.addScrollEventListener(scrollHandler, {
            capture: !1,
            passive: !0
        })
    }, EmbyScrollButtonsPrototype.detachedCallback = function() {
        var parent = this.scroller;
        this.scroller = null;
        var scrollHandler = this.scrollHandler;
        parent && scrollHandler && parent.removeScrollEventListener(scrollHandler, {
            capture: !1,
            passive: !0
        }), this.scrollHandler = null, this.scrollButtonsLeft = null, this.scrollButtonsRight = null
    }, document.registerElement("emby-scrollbuttons", {
        prototype: EmbyScrollButtonsPrototype,
        extends: "div"
    })
});