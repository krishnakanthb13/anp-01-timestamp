{
    // --------------------------------------------------------------------------------------
    // Constants & Shared Helpers
    // --------------------------------------------------------------------------------------
    _HELPER: {
        monthsFull: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthsAbbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    daysOfWeekShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

                        getDaySuffix(day) {
            if (day >= 11 && day <= 13) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        },

        getWeekOfYear(date) {
            const start = new Date(date.getFullYear(), 0, 1);
            const diff = (date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000)) / 86400000;
            return Math.ceil((diff + start.getDay() + 1) / 7);
        },

        getDayOfYear(date) {
            const start = new Date(date.getFullYear(), 0, 0);
            const diff = (date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000)) / 86400000;
            return Math.floor(diff);
        },

        getTimeZoneInfo(date, type) {
            const s = date.toString();
            switch (type) {
                case 'offset': {
                    const off = date.getTimezoneOffset();
                    const abs = Math.abs(off);
                    return (off <= 0 ? '+' : '-') + String(Math.floor(abs / 60)).padStart(2, '0') + ':' + String(abs % 60).padStart(2, '0');
                }
                case 'complete': return s.match(/([A-Z]+[\+-][0-9]+.*)/)?.[1] || 'UTC';
                case 'hhmm': return s.match(/([A-Z]+[\+-][0-9]+)/)?.[1] || 'UTC';
                case 'abbr': return s.match(/\(([A-Za-z\s].*)\)/)?.[1] || 'UTC';
                case 'time': return s.match(/([-\+]\d{4})/)?.[1] || '+0000';
                default: return '';
            }
        },

        romanize(num) {
            if (!+num) return '';
            const key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
                "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
                "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
            const digits = String(+num).split("");
            let roman = "", i = 3;
            while (i--) {
                const d = digits.pop();
                if (d !== undefined) roman = (key[+d + (i * 10)] || "") + roman;
            }
            return "M".repeat(+digits.join("") || 0) + roman;
        },

        textualTime(date) {
            const h = date.getHours();
            const m = date.getMinutes();
            const convertHour = (hr) => ["Twelve", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven"][hr % 12];
            const convertMin = (min) => {
                const units = ["Oh", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
                if (min < 20) return units[min];
                const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty"];
                return (min % 10 === 0) ? tens[Math.floor(min / 10)] : `${tens[Math.floor(min / 10)]}-${units[min % 10]}`;
            };

            if (m === 0) return `It's ${convertHour(h)} o'clock`;
            if (m === 15) return `It's a quarter past ${convertHour(h)}`;
            if (m === 30) return `It's half past ${convertHour(h)}`;
            if (m === 45) return `It's a quarter to ${convertHour(h + 1)}`;
            if (m < 30) return `It's ${convertMin(m)} past ${convertHour(h)}`;
            return `It's ${convertMin(60 - m)} to ${convertHour(h + 1)}`;
        }
    },

    // --------------------------------------------------------------------------------------
    // Digital Formatting Map
    // --------------------------------------------------------------------------------------
    _getDigitalMap(date) {
        const h24 = date.getHours();
        const m = date.getMinutes();
        const mFrac = (m / 60).toFixed(2);
        const h12 = (h24 % 12 || 12);
        const helper = this._HELPER;

        return {
            'Y': () => date.getFullYear(),
            'y': () => String(date.getFullYear()).slice(-2),
            'm': () => String(date.getMonth() + 1).padStart(2, '0'),
            'b': () => helper.monthsAbbr[date.getMonth()],
            'M': () => helper.monthsFull[date.getMonth()],
            'd': () => String(date.getDate()).padStart(2, '0'),
            'o': () => helper.getDaySuffix(date.getDate()),
            'h': () => String(h12).padStart(2, '0'),
            'H': () => String(h24).padStart(2, '0'),
            'n': () => String(m).padStart(2, '0'),
            'N': () => mFrac,
            's': () => String(date.getSeconds()).padStart(2, '0'),
            'S': () => String(date.getMilliseconds()).padStart(3, '0'),
            'A': () => h24 < 12 ? 'AM' : 'PM',
            'I': () => (h24 + parseFloat(mFrac)).toFixed(2),
            'i': () => (h12 + parseFloat(mFrac)).toFixed(2),
            'V': () => helper.getTimeZoneInfo(date, 'offset'),
            'x': () => helper.getTimeZoneInfo(date, 'hhmm'),
            'z': () => helper.getTimeZoneInfo(date, 'time'),
            'B': () => helper.getTimeZoneInfo(date, 'complete'),
            't': () => helper.getTimeZoneInfo(date, 'abbr'),
            'C': () => helper.daysOfWeek[date.getDay()],
            'c': () => helper.daysOfWeekShort[date.getDay()],
            'U': () => date.getDay() + 1,
            'u': () => (date.getDay() === 0 ? 7 : date.getDay()),
            'K': () => helper.getWeekOfYear(date),
            'J': () => helper.getDayOfYear(date)
        };
    },

    // --------------------------------------------------------------------------------------
    // Entry Points
    // --------------------------------------------------------------------------------------
    insertText: {
        "Digital": async function(app) {
            const formatString = String(app.settings["timestamp for digital - structure"] || "Y-m-d H:n:s");
            const map = this._getDigitalMap(new Date());
            return formatString.replace(/./g, char => map[char] ? map[char]() : char);
        },

        "Roman": async function(app) {
            const d = new Date();
            const r = this._HELPER.romanize;
            return `${r(d.getDate())}/${r(d.getMonth() + 1)}/${r(d.getFullYear())}, ${r(d.getHours())}:${r(d.getMinutes())}:${r(d.getSeconds())}`;
        },

        "Analog": async function(app) {
            const theme = app.settings["timestamp analog - theme - dark / light / neon"] || "dark";
            const now = new Date();
            const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
            const sAng = s * 6;
            const mAng = m * 6 + s * 0.1;
            const hAng = (h % 12) * 30 + m * 0.5;

            const themes = {
                dark: { bg: "#1c1c1c", stroke: "#333", hands: "#ccc", sec: "#fff", ticks: "#666", subTicks: "#555", center: "#fff" },
                light: { bg: "#f9f9f9", stroke: "#ccc", hands: "#333", sec: "#333", ticks: "#bbb", subTicks: "#aaa", center: "#333" },
                neon: { bg: "#000", stroke: "#0f0", hands: "#f0f", sec: "#ff0", ticks: "#0f0", subTicks: "#0f0", center: "#f0f", hand3: "#0ff" }
            };
            const t = themes[theme] || themes.dark;

            return `
<svg width="80" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" stroke="${t.stroke}" stroke-width="4" fill="${t.bg}"/>
  <line x1="50" y1="50" x2="50" y2="30" stroke="${t.hands}" stroke-width="5" transform="rotate(${hAng}, 50, 50)"/>
  <line x1="50" y1="50" x2="50" y2="20" stroke="${t.hand3 || t.hands}" stroke-width="3" transform="rotate(${mAng}, 50, 50)"/>
  <line x1="50" y1="50" x2="50" y2="10" stroke="${t.sec}" stroke-width="1" transform="rotate(${sAng}, 50, 50)"/>
  <circle cx="50" cy="50" r="3" fill="${t.center}"/>
  <g stroke="${t.ticks}" stroke-width="2"><line x1="50" y1="2" x2="50" y2="8"/><line x1="50" y1="92" x2="50" y2="98"/><line x1="2" y1="50" x2="8" y2="50"/><line x1="92" y1="50" x2="98" y2="50"/></g>
  <g stroke="${t.subTicks}" stroke-width="1"><line x1="50" y1="4" x2="50" y2="6"/><line x1="50" y1="94" x2="50" y2="96"/><line x1="4" y1="50" x2="6" y2="50"/><line x1="94" y1="50" x2="96" y2="50"/></g>
</svg>`.trim();
        },

        "Text": async function(app) {
            const timeStr = this._HELPER.textualTime(new Date());
            const pre = app.settings["timestamp text - pre script"] || "";
            const post = app.settings["timestamp text - post script"] || "";
            let res = (pre ? pre + " " : "") + timeStr.charAt(0).toUpperCase() + timeStr.slice(1) + ".";
            if (post) res += " " + post;
            return res;
        },

        "Unix": async function(app) {
            return Math.floor(Date.now() / 1000).toString();
        }
    },

    replaceText: {
        "Analog": async function(app, text) {
            await this._toDiagram(app, text.trim());
            return null;
        },
        "UnixToDateTime": async function(app, text) {
            const ts = parseInt(text.trim(), 10);
            return isNaN(ts) ? "Invalid Unix timestamp" : new Date(ts * 1000).toLocaleString();
        }
    },

    // --------------------------------------------------------------------------------------
    // Internal Utilities
    // --------------------------------------------------------------------------------------
    async _toDiagram(app, text) {
        const svgBlob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' });
        const svgDataURL = await this._dataURLFromBlob(svgBlob);
        const pngDataURL = await this._svgToPng(svgDataURL);
        const fileURL = await app.attachNoteMedia({ uuid: app.context.noteUUID }, pngDataURL);

        // Restore meta-text in URL for future editability
        const encodedText = window.encodeURIComponent(window.btoa(text));
        const finalURL = `${fileURL}?text=${encodedText}`;

        const post = app.settings["timestamp analog - post script"] || "";
        const output = `![${new Date().toLocaleString()}](${finalURL}) ${post}.`.replace(/\s+/g, ' ').trim();
        await app.context.replaceSelection(output);
        return null;
    },

    async _svgToPng(svgBase64) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = svgBase64;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                canvas.getContext('2d').drawImage(image, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            image.onerror = (e) => reject(new Error(`Image load error: ${e}`));
        });
    },

    async _dataURLFromBlob(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => { reader.abort(); reject(new Error(`File read error: ${e.target.error}`)); };
            reader.readAsDataURL(blob);
        });
    }
}