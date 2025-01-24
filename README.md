# YouTube Auto-translate Filter

## Description
This userscript enhances the YouTube experience by filtering and displaying only the auto-translated subtitle languages that the user allows. With this script, you can choose which subtitle languages should appear in the YouTube language menu, hiding any unwanted options.

The script observes changes in the DOM to detect the YouTube language menu and applies filters based on a user-defined list of allowed languages. The list of allowed languages can be configured through a user-friendly menu command.

## Features
- Filter YouTube subtitle languages to show only those that are auto-translated.
- User-defined allowed language list, easily configurable.
- Automatically hides unwanted languages in the YouTube language menu.
- Prompt to set allowed languages via a menu command.

## Installation

1. **Install a userscript manager** such as [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/) in your browser.
2. **Install the script** by visiting the following URL in your browser:
   - [Download the script from GitHub](https://github.com/Plong-Wasin/youtube-auto-translate-filter/raw/main/youtube-auto-translate-filter.user.js)
3. Once installed, the script will automatically filter languages on YouTube based on your settings.

## Usage

1. After installing the script, visit a YouTube video.
2. Open the YouTube language menu to see the available subtitle languages.
3. To configure the allowed languages, click the script icon in your userscript manager (e.g., Tampermonkey) and select **Set Allowed Languages**.
4. Enter a comma-separated list of language codes (e.g., `en, es, fr`), and the script will only display those languages in the language menu.

### Example:
If you want to only show subtitles in English and Spanish, you would enter: `en, es`
The script will hide all other languages, including auto-translated subtitles in languages you don't select.

## Configuration

You can change the allowed languages by:
- Clicking on the userscript icon in your browser's toolbar.
- Selecting **Set Allowed Languages**.
- Entering a comma-separated list of language codes (e.g., `en, de, fr`).

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog
- **1.0**: Initial release. Filters and hides unwanted subtitle languages on YouTube.

## Author
- **Plong-Wasin** (Plong-Wasin)

## Links
- [GitHub Repository](https://github.com/Plong-Wasin/youtube-auto-translate-filter)
