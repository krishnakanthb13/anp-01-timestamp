import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

// Extend dayjs with ordinals (Do), etc.
dayjs.extend(advancedFormat);

/**
 * Formats the current date/time digitally based on user settings using Day.js.
 * Supports Moment.js style tokens and literal escaping with square brackets.
 * Also supports a special "ISO" keyword for standard ISO8601 local formatting.
 * @reference https://day.js.org/docs/en/display/format
 * @param {object} app - The Amplenote app object.
 * @returns {string} - The formatted date string.
 */
export function digital(app) {
    const s = app.settings;
    const format = String(s["timestamp for digital - structure"] || "YYYY-MM-DD HH:mm:ss");

    const now = dayjs();

    if (format.toUpperCase() === "ISO") {
        return now.format(); // Default Day.js format is ISO8601
    }

    return now.format(format);
}
