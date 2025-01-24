"use strict";
(function () {
    let availableTranslationLanguages = null;
    const menuItemSelector = ".ytp-panel-menu > .ytp-menuitem";
    function filterAllowedLanguages() {
        const menuItems = document.querySelectorAll(menuItemSelector);
        const allowedLanguageCodes = GM_getValue("allowedLanguages", "")
            .split(",")
            .map((code) => code.trim().toLowerCase())
            .filter((code) => code !== "");
        if (allowedLanguageCodes.length === 0) {
            menuItems.forEach((menuItem) => {
                menuItem.style.display = "";
            });
            return;
        }
        menuItems.forEach((menuItem) => {
            const labelElement = menuItem.querySelector(".ytp-menuitem-label");
            if (labelElement &&
                availableTranslationLanguages &&
                !availableTranslationLanguages.some((language) => allowedLanguageCodes.includes(language.languageCode.toLowerCase()) &&
                    labelElement.textContent?.trim() ===
                        language.languageName.simpleText.trim())) {
                menuItem.style.display = "none";
            }
            else {
                menuItem.style.display = "";
            }
        });
    }
    const menuObserver = new MutationObserver(() => {
        if (typeof ytInitialPlayerResponse !== "undefined" &&
            document.querySelectorAll(menuItemSelector).length ===
                ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
                    .translationLanguages.length) {
            availableTranslationLanguages =
                ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
                    .translationLanguages;
            filterAllowedLanguages();
        }
    });
    menuObserver.observe(document.body, { childList: true, subtree: true });
    GM_registerMenuCommand("Set Allowed Languages", () => {
        const userInput = prompt("Enter a comma-separated list of allowed language codes:", GM_getValue("allowedLanguages", ""));
        GM_setValue("allowedLanguages", userInput);
    });
})();
