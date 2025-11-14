"use strict";
(function () {
    let availableTranslationLanguages = null;
    const menuItemSelector = ".ytp-panel-menu > .ytp-menuitem";
    function isFilterEnabled() {
        return GM_getValue("filterEnabled", true);
    }
    function toggleFilterState() {
        const newState = !isFilterEnabled();
        GM_setValue("filterEnabled", newState);
        return newState;
    }
    function getToggleMenuLabel() {
        return isFilterEnabled() ? "Disable Filter" : "Enable Filter";
    }
    function filterAllowedLanguages() {
        if (!isFilterEnabled()) {
            return;
        }
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
    GM_registerMenuCommand(getToggleMenuLabel(), () => {
        const newState = toggleFilterState();
        alert(`Filter ${newState ? "enabled" : "disabled"}`);
    });
    GM_registerMenuCommand(`Set Allowed Languages (${isFilterEnabled() ? "Filter ON" : "Filter OFF"})`, () => {
        const userInput = prompt("Enter a comma-separated list of allowed language codes:", GM_getValue("allowedLanguages", ""));
        if (userInput !== null) {
            GM_setValue("allowedLanguages", userInput);
            if (isFilterEnabled()) {
                filterAllowedLanguages();
            }
        }
    });
})();
