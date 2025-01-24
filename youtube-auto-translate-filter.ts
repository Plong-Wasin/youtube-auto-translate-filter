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
   * Filters and hides languages not in the allowed list defined by the user.
   */
  function filterAllowedLanguages() {
    const menuItems =
      document.querySelectorAll<HTMLDivElement>(menuItemSelector);

    // Retrieve the allowed language codes from user settings
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
            allowedLanguageCodes.includes(
              language.languageCode.toLowerCase()
            ) &&
            labelElement.textContent?.trim() ===
              language.languageName.simpleText.trim()
        )
      ) {
        menuItem.style.display = "none";
      } else {
        menuItem.style.display = "";
      }
    });
  }

  /**
   * Observes DOM changes to detect when the YouTube language menu is loaded and triggers filtering.
   */
  const menuObserver = new MutationObserver(() => {
    // Check if the YouTube player response and menu items are available
    if (
      typeof ytInitialPlayerResponse !== "undefined" &&
      document.querySelectorAll(menuItemSelector).length ===
        ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
          .translationLanguages.length
    ) {
      // Update the available translation languages
      availableTranslationLanguages =
        ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
          .translationLanguages;

      // Apply the filter to hide unwanted languages
      filterAllowedLanguages();
    }
  });

  // Start observing the document body for changes
  menuObserver.observe(document.body, { childList: true, subtree: true });

  /**
   * Registers a menu command to allow the user to set allowed languages.
   */
  GM_registerMenuCommand("Set Allowed Languages", () => {
    const userInput = prompt(
      "Enter a comma-separated list of allowed language codes:",
      GM_getValue("allowedLanguages", "")
    );
    GM_setValue("allowedLanguages", userInput);
  });
})();
