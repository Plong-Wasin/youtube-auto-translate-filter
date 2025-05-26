// ==UserScript==
// @name         YouTube Auto-translate Filter
// @namespace    Plong-Wasin
// @version      1.2.0
// @description  Show only auto-translated subtitle languages on YouTube
// @author       Plong-Wasin
// @updateURL    https://github.com/Plong-Wasin/youtube-auto-translate-filter/raw/main/youtube-auto-translate-filter.user.js
// @downloadURL  https://github.com/Plong-Wasin/youtube-auto-translate-filter/raw/main/youtube-auto-translate-filter.user.js
// @match        *://www.youtube.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==
"use strict";
(function () {
    let availableTranslationLanguages = null;
    const menuItemSelector = ".ytp-panel-menu > .ytp-menuitem";
    function filterAllowedLanguages() {
        const menuItems = document.querySelectorAll(menuItemSelector);
        const allowedLanguages = GM_getValue("allowedLanguages", "")
            .split(",")
            .map((code) => code.trim().toLowerCase())
            .filter((code) => code !== "");
        if (allowedLanguages.length === 0) {
            menuItems.forEach((menuItem) => {
                menuItem.style.display = "";
            });
            return;
        }
        menuItems.forEach((menuItem) => {
            const labelElement = menuItem.querySelector(".ytp-menuitem-label");
            if (labelElement &&
                availableTranslationLanguages &&
                !availableTranslationLanguages.some((language) => (allowedLanguages.includes(language.languageCode.toLowerCase()) &&
                    labelElement.textContent?.trim() ===
                        language.languageName.simpleText.trim()) ||
                    allowedLanguages.includes(labelElement.textContent?.trim().toLowerCase() ?? ""))) {
                menuItem.style.display = "none";
            }
            else {
                menuItem.style.display = "";
            }
        });
    }
    const menuObserver = new MutationObserver(() => {
        availableTranslationLanguages = JSON.parse(GM_getValue("availableTranslationLanguages", "[]"));
        const currentMenuItemsCount = document.querySelectorAll(menuItemSelector).length;
        if (typeof ytInitialPlayerResponse !== "undefined" &&
            currentMenuItemsCount ===
                ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
                    .translationLanguages.length) {
            const currentTranslationLanguages = ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
                .translationLanguages;
            GM_setValue("availableTranslationLanguages", JSON.stringify(currentTranslationLanguages));
            filterAllowedLanguages();
        }
        else if (currentMenuItemsCount === availableTranslationLanguages.length) {
            filterAllowedLanguages();
        }
    });
    menuObserver.observe(document.body, { childList: true, subtree: true });
    GM_registerMenuCommand("Set Allowed Languages", () => {
        const userInput = prompt("Enter a comma-separated list of allowed language codes:", GM_getValue("allowedLanguages", ""));
        if (userInput !== null) {
            GM_setValue("allowedLanguages", userInput);
        }
    });
})();
