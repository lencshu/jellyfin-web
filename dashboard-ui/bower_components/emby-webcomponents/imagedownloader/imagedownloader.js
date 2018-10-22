define(["loading", "apphost", "dialogHelper", "connectionManager", "imageLoader", "browser", "layoutManager", "scrollHelper", "globalize", "require", "emby-checkbox", "emby-button", "paper-icon-button-light", "emby-linkbutton", "formDialogStyle", "cardStyle"], function(loading, appHost, dialogHelper, connectionManager, imageLoader, browser, layoutManager, scrollHelper, globalize, require) {
    "use strict";

    function getBaseRemoteOptions() {
        var options = {};
        return options.itemId = currentItemId, options
    }

    function reloadBrowsableImages(page, apiClient) {
        loading.show();
        var options = getBaseRemoteOptions();
        options.type = browsableImageType, options.startIndex = browsableImageStartIndex, options.limit = browsableImagePageSize, options.IncludeAllLanguages = page.querySelector("#chkAllLanguages").checked;
        var provider = selectedProvider || "";
        provider && (options.ProviderName = provider), apiClient.getAvailableRemoteImages(options).then(function(result) {
            renderRemoteImages(page, apiClient, result, browsableImageType, options.startIndex, options.limit), page.querySelector("#selectBrowsableImageType").value = browsableImageType;
            var providersHtml = result.Providers.map(function(p) {
                    return '<option value="' + p + '">' + p + "</option>"
                }),
                selectImageProvider = page.querySelector("#selectImageProvider");
            selectImageProvider.innerHTML = '<option value="">' + globalize.translate("sharedcomponents#All") + "</option>" + providersHtml, selectImageProvider.value = provider, loading.hide()
        })
    }

    function renderRemoteImages(page, apiClient, imagesResult, imageType, startIndex, limit) {
        page.querySelector(".availableImagesPaging").innerHTML = getPagingHtml(startIndex, limit, imagesResult.TotalRecordCount);
        for (var html = "", i = 0, length = imagesResult.Images.length; i < length; i++) html += getRemoteImageHtml(imagesResult.Images[i], imageType, apiClient);
        var availableImagesList = page.querySelector(".availableImagesList");
        availableImagesList.innerHTML = html, imageLoader.lazyChildren(availableImagesList);
        var btnNextPage = page.querySelector(".btnNextPage"),
            btnPreviousPage = page.querySelector(".btnPreviousPage");
        btnNextPage && btnNextPage.addEventListener("click", function() {
            browsableImageStartIndex += browsableImagePageSize, reloadBrowsableImages(page, apiClient)
        }), btnPreviousPage && btnPreviousPage.addEventListener("click", function() {
            browsableImageStartIndex -= browsableImagePageSize, reloadBrowsableImages(page, apiClient)
        })
    }

    function getPagingHtml(startIndex, limit, totalRecordCount) {
        var html = "",
            recordsEnd = Math.min(startIndex + limit, totalRecordCount),
            showControls = totalRecordCount > limit;
        return html += '<div class="listPaging">', html += '<span style="margin-right: 10px;">', html += (totalRecordCount ? startIndex + 1 : 0) + "-" + recordsEnd + " of " + totalRecordCount, html += "</span>", showControls && (html += '<div data-role="controlgroup" data-type="horizontal" style="display:inline-block;">', html += '<button is="paper-icon-button-light" title="' + globalize.translate("sharedcomponents#Previous") + '" class="btnPreviousPage autoSize" ' + (startIndex ? "" : "disabled") + '><i class="md-icon">&#xE5C4;</i></button>', html += '<button is="paper-icon-button-light" title="' + globalize.translate("sharedcomponents#Next") + '" class="btnNextPage autoSize" ' + (startIndex + limit >= totalRecordCount ? "disabled" : "") + '><i class="md-icon">arrow_forward</i></button>', html += "</div>"), html += "</div>"
    }

    function parentWithClass(elem, className) {
        for (; !elem.classList || !elem.classList.contains(className);)
            if (!(elem = elem.parentNode)) return null;
        return elem
    }

    function downloadRemoteImage(page, apiClient, url, type, provider) {
        var options = getBaseRemoteOptions();
        options.Type = type, options.ImageUrl = url, options.ProviderName = provider, loading.show(), apiClient.downloadRemoteImage(options).then(function() {
            hasChanges = !0;
            var dlg = parentWithClass(page, "dialog");
            dialogHelper.close(dlg)
        })
    }

    function getDisplayUrl(url, apiClient) {
        return apiClient.getUrl("Images/Remote", {
            imageUrl: url
        })
    }

    function getRemoteImageHtml(image, imageType, apiClient) {
        var tagName = layoutManager.tv ? "button" : "div",
            enableFooterButtons = !layoutManager.tv,
            html = "",
            cssClass = "card scalableCard imageEditorCard",
            cardBoxCssClass = "cardBox visualCardBox",
            shape = "backdrop";
        return shape = "Backdrop" === imageType || "Art" === imageType || "Thumb" === imageType || "Logo" === imageType ? "backdrop" : "Banner" === imageType ? "banner" : "Disc" === imageType ? "square" : "Episode" === currentItemType ? "backdrop" : "MusicAlbum" === currentItemType || "MusicArtist" === currentItemType ? "square" : "portrait", cssClass += " " + shape + "Card " + shape + "Card-scalable", "button" === tagName ? (cssClass += " btnImageCard", layoutManager.tv && !browser.slow && (cardBoxCssClass += " cardBox-focustransform"), layoutManager.tv && (cardBoxCssClass += " card-focuscontent cardBox-withfocuscontent"), html += '<button type="button" class="' + cssClass + '"') : html += '<div class="' + cssClass + '"', html += ' data-imageprovider="' + image.ProviderName + '" data-imageurl="' + image.Url + '" data-imagetype="' + image.Type + '"', html += ">", html += '<div class="' + cardBoxCssClass + '">', html += '<div class="cardScalable visualCardBox-cardScalable" style="background-color:transparent;">', html += '<div class="cardPadder-' + shape + '"></div>', html += '<div class="cardContent">', layoutManager.tv || !appHost.supports("externallinks") ? html += '<div class="cardImageContainer lazy" data-src="' + getDisplayUrl(image.Url, apiClient) + '" style="background-position:center bottom;"></div>' : html += '<a is="emby-linkbutton" target="_blank" href="' + getDisplayUrl(image.Url, apiClient) + '" class="button-link cardImageContainer lazy" data-src="' + getDisplayUrl(image.Url, apiClient) + '" style="background-position:center bottom;"></a>', html += "</div>", html += "</div>", html += '<div class="cardFooter visualCardBox-cardFooter">', html += '<div class="cardText cardTextCentered">' + image.ProviderName + "</div>", (image.Width || image.Height || image.Language) && (html += '<div class="cardText cardText-secondary cardTextCentered">', image.Width && image.Height ? (html += image.Width + " x " + image.Height, image.Language && (html += " • " + image.Language)) : image.Language && (html += image.Language), html += "</div>"), null != image.CommunityRating && (html += '<div class="cardText cardText-secondary cardTextCentered">', "Likes" === image.RatingType ? html += image.CommunityRating + (1 === image.CommunityRating ? " like" : " likes") : image.CommunityRating ? (html += image.CommunityRating.toFixed(1), image.VoteCount && (html += " • " + image.VoteCount + (1 === image.VoteCount ? " vote" : " votes"))) : html += "Unrated", html += "</div>"), enableFooterButtons && (html += '<div class="cardText cardTextCentered">', html += '<button is="paper-icon-button-light" class="btnDownloadRemoteImage autoSize" raised" title="' + globalize.translate("sharedcomponents#Download") + '"><i class="md-icon">&#xE2C0;</i></button>', html += "</div>"), html += "</div>", html += "</div>", html += "</" + tagName + ">"
    }

    function initEditor(page, apiClient) {
        page.querySelector("#selectBrowsableImageType").addEventListener("change", function() {
            browsableImageType = this.value, browsableImageStartIndex = 0, selectedProvider = null, reloadBrowsableImages(page, apiClient)
        }), page.querySelector("#selectImageProvider").addEventListener("change", function() {
            browsableImageStartIndex = 0, selectedProvider = this.value, reloadBrowsableImages(page, apiClient)
        }), page.querySelector("#chkAllLanguages").addEventListener("change", function() {
            browsableImageStartIndex = 0, reloadBrowsableImages(page, apiClient)
        }), page.addEventListener("click", function(e) {
            var btnDownloadRemoteImage = parentWithClass(e.target, "btnDownloadRemoteImage");
            if (btnDownloadRemoteImage) {
                var card = parentWithClass(btnDownloadRemoteImage, "card");
                return void downloadRemoteImage(page, apiClient, card.getAttribute("data-imageurl"), card.getAttribute("data-imagetype"), card.getAttribute("data-imageprovider"))
            }
            var btnImageCard = parentWithClass(e.target, "btnImageCard");
            btnImageCard && downloadRemoteImage(page, apiClient, btnImageCard.getAttribute("data-imageurl"), btnImageCard.getAttribute("data-imagetype"), btnImageCard.getAttribute("data-imageprovider"))
        })
    }

    function showEditor(itemId, serverId, itemType) {
        loading.show(), require(["text!./imagedownloader.template.html"], function(template) {
            var apiClient = connectionManager.getApiClient(serverId);
            currentItemId = itemId, currentItemType = itemType;
            var dialogOptions = {
                removeOnClose: !0
            };
            layoutManager.tv ? dialogOptions.size = "fullscreen" : dialogOptions.size = "fullscreen-border";
            var dlg = dialogHelper.createDialog(dialogOptions);
            dlg.innerHTML = globalize.translateDocument(template, "sharedcomponents"), layoutManager.tv && scrollHelper.centerFocus.on(dlg, !1), dlg.addEventListener("close", onDialogClosed), dialogHelper.open(dlg);
            var editorContent = dlg.querySelector(".formDialogContent");
            initEditor(editorContent, apiClient), dlg.querySelector(".btnCancel").addEventListener("click", function() {
                dialogHelper.close(dlg)
            }), reloadBrowsableImages(editorContent, apiClient)
        })
    }

    function onDialogClosed() {
        var dlg = this;
        layoutManager.tv && scrollHelper.centerFocus.off(dlg, !1), loading.hide(), hasChanges ? currentResolve() : currentReject()
    }
    var currentItemId, currentItemType, currentResolve, currentReject, selectedProvider, hasChanges = !1,
        browsableImagePageSize = browser.slow ? 6 : 30,
        browsableImageStartIndex = 0,
        browsableImageType = "Primary";
    return {
        show: function(itemId, serverId, itemType, imageType) {
            return new Promise(function(resolve, reject) {
                currentResolve = resolve, currentReject = reject, hasChanges = !1, browsableImageStartIndex = 0, browsableImageType = imageType || "Primary", selectedProvider = null, showEditor(itemId, serverId, itemType)
            })
        }
    }
});