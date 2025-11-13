/**
 * This script filters and hides unwanted auto-translate language options in the YouTube player menu.
 *
 * It observes changes in the DOM to detect the presence of the YouTube language menu and applies filters
 * based on a user-defined list of allowed languages. The user can configure the allowed languages
 * through a menu command.
 */

// Declare the YouTube player response object if it exists
declare let ytInitialPlayerResponse: YoutubeInitialPlayerResponse | undefined;

/**
 * Interfaces representing the structure of YouTube's player response.
 */
interface YoutubeInitialPlayerResponse {
  captions: Captions;
}

interface Captions {
  playerCaptionsTracklistRenderer: PlayerCaptionsTracklistRenderer;
}

interface PlayerCaptionsTracklistRenderer {
  captionTracks: CaptionTrack[];
  audioTracks: AudioTrack[];
  translationLanguages: TranslationLanguage[];
  defaultAudioTrackIndex: number;
}

interface AudioTrack {
  captionTrackIndices: number[];
}

interface CaptionTrack {
  baseUrl: string;
  name: Name;
  vssId: string;
  languageCode: string;
  kind: string;
  isTranslatable: boolean;
  trackName: string;
}

interface Name {
  simpleText: string;
}

interface TranslationLanguage {
  languageCode: string;
  languageName: Name;
}

(function () {
  // Stores the list of available translation languages
  let availableTranslationLanguages: TranslationLanguage[] | null = null;

  // CSS selector for YouTube player menu items
  const menuItemSelector = ".ytp-panel-menu > .ytp-menuitem";

  /**
   * Checks if the filter is currently enabled.
   * @returns {boolean} - True if the filter is enabled, false otherwise.
   */
  function isFilterEnabled(): boolean {
    return GM_getValue("filterEnabled", true);
  }

  /**
   * Toggles the filter state and applies changes immediately.
   * @returns {boolean} - The new filter state after toggling.
   */
  function toggleFilterState(): boolean {
    const newState = !isFilterEnabled();
    GM_setValue("filterEnabled", newState);

    // Apply changes immediately based on the new state
    if (newState) {
      filterAllowedLanguages();
    } else {
      // Show all menu items when filter is disabled
      const menuItems =
        document.querySelectorAll<HTMLDivElement>(menuItemSelector);
      menuItems.forEach((menuItem) => {
        menuItem.style.display = "";
      });
    }

    return newState;
  }

  /**
   * Returns the appropriate menu label based on the current filter state.
   * @returns {string} - The menu label text.
   */
  function getToggleMenuLabel(): string {
    return isFilterEnabled() ? "Disable Filter" : "Enable Filter";
  }

  /**
   * Filters and hides languages not in the allowed list defined by the user.
   * Only applies filtering if the filter is enabled.
   */
  function filterAllowedLanguages() {
    // Skip filtering if the filter is disabled
    if (!isFilterEnabled()) {
      return;
    }
    const menuItems =
      document.querySelectorAll<HTMLDivElement>(menuItemSelector);

    // Retrieve the allowed language codes from user settings
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

    // Iterate through menu items and hide those not in the allowed list
    menuItems.forEach((menuItem) => {
      const labelElement = menuItem.querySelector<HTMLDivElement>(
        ".ytp-menuitem-label"
      );

      if (
        labelElement &&
        availableTranslationLanguages &&
        !availableTranslationLanguages.some(
          (language) =>
            (allowedLanguages.includes(language.languageCode.toLowerCase()) &&
              labelElement.textContent?.trim() ===
                language.languageName.simpleText.trim()) ||
            allowedLanguages.includes(
              labelElement.textContent?.trim().toLowerCase() ?? ""
            )
        )
      ) {
        menuItem.style.display = "none";
      } else {
        menuItem.style.display = "";
      }
    });
  }

  /**
   * Observes and filters the YouTube captions language menu based on available translation languages.
   * Listens for DOM mutations to detect when the language menu is loaded, updates stored languages,
   * and applies filtering accordingly.
   */

  const menuObserver = new MutationObserver(() => {
    // Retrieve stored translation languages from persistent storage
    availableTranslationLanguages = JSON.parse(
      GM_getValue("availableTranslationLanguages", "[]")
    ) as TranslationLanguage[];

    // Count of menu items currently in the DOM matching language menu selector
    const currentMenuItemsCount =
      document.querySelectorAll(menuItemSelector).length;

    // Check if YouTube player captions response is defined and menu fully loaded with translation languages
    if (
      typeof ytInitialPlayerResponse !== "undefined" &&
      currentMenuItemsCount ===
        ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
          .translationLanguages.length
    ) {
      // Extract the translation languages available from the YouTube player response
      const currentTranslationLanguages: TranslationLanguage[] =
        ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
          .translationLanguages;

      // Persist the updated translation languages to storage
      GM_setValue(
        "availableTranslationLanguages",
        JSON.stringify(currentTranslationLanguages)
      );

      // Apply allowed language filtering on the menu items
      filterAllowedLanguages();
    }
    // If the current menu items count matches the length of stored translation languages, apply filtering again
    else if (currentMenuItemsCount === availableTranslationLanguages.length) {
      filterAllowedLanguages();
    }
  });

  // Start observing the document body for changes
  menuObserver.observe(document.body, { childList: true, subtree: true });

  /**
   * Registers a menu command to allow the user to toggle the filter state.
   */
  GM_registerMenuCommand(getToggleMenuLabel(), () => {
    const newState = toggleFilterState();
    alert(`Filter ${newState ? "enabled" : "disabled"}`);

    // Update the menu command label by reregistering
    // Note: In a real implementation, you might need to handle menu refresh differently
    // as Tampermonkey doesn't provide a direct way to update menu command labels
  });

  /**
   * Registers a menu command to allow the user to set allowed languages.
   * The command label includes the current filter status.
   */
  GM_registerMenuCommand(
    `Set Allowed Languages (${isFilterEnabled() ? "Filter ON" : "Filter OFF"})`,
    () => {
      const userInput = prompt(
        "Enter a comma-separated list of allowed language codes:",
        GM_getValue("allowedLanguages", "")
      );
      if (userInput !== null) {
        GM_setValue("allowedLanguages", userInput);
        // Apply filtering immediately if the filter is enabled
        if (isFilterEnabled()) {
          filterAllowedLanguages();
        }
      }
    }
  );
})();
