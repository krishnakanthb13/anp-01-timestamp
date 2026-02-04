{
    insertText: {
        "Digital": function(app) {
            const d = new Date(), s = app.settings;
            const format = String(s["timestamp for digital - structure"] || "Y-m-d H:n:s");
            const map = {
                'Y': d.getFullYear(), 'y': String(d.getFullYear()).slice(-2),
                'm': String(d.getMonth() + 1).padStart(2, '0'),
                'd': String(d.getDate()).padStart(2, '0'),
                'H': String(d.getHours()).padStart(2, '0'),
                'n': String(d.getMinutes()).padStart(2, '0'),
                's': String(d.getSeconds()).padStart(2, '0'),
                'A': d.getHours() < 12 ? 'AM' : 'PM'
            };
            return format.replace(/Y|y|m|d|H|n|s|A/g, c => map[c]);
        },

        "Roman": function(app) {
            const d = new Date();
            const r = n => {
                if (!+n) return '';
                const k = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM", "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC", "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"], g = String(+n).split("");
                let s = "", i = 3;
                while (i--) { let v = g.pop(); if (v) s = (k[+v + (i * 10)] || "") + s; }
                return "M".repeat(+g.join("") || 0) + s;
            };
            return `${r(d.getDate())}/${r(d.getMonth() + 1)}/${r(d.getFullYear())}, ${r(d.getHours())}:${r(d.getMinutes())}:${r(d.getSeconds())}`;
        },

        "Analog": async function(app) {
            if (!app.context.noteUUID) return "Error: Open a note to insert image.";

            try {
                const theme = app.settings["timestamp analog - theme - dark / light / neon"] || "dark";
                const now = new Date();
                const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
                const hAng = (h % 12) * 30 + m * 0.5, mAng = m * 6 + s * 0.1, sAng = s * 6;
                const themes = {
                    dark: { bg: "#1c1c1c", stroke: "#333", hands: "#ccc", sec: "#fff" },
                    light: { bg: "#f9f9f9", stroke: "#ccc", hands: "#333", sec: "#333" },
                    neon: { bg: "#000", stroke: "#0f0", hands: "#f0f", sec: "#ff0" }
                };
                const t = themes[theme] || themes.dark;

                const svg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">` +
                    `<circle cx="50" cy="50" r="48" stroke="${t.stroke}" stroke-width="4" fill="${t.bg}"/>` +
                    `<line x1="50" y1="50" x2="50" y2="30" stroke="${t.hands}" stroke-width="5" transform="rotate(${hAng}, 50, 50)"/>` +
                    `<line x1="50" y1="50" x2="50" y2="20" stroke="${t.hands}" stroke-width="3" transform="rotate(${mAng}, 50, 50)"/>` +
                    `<line x1="50" y1="50" x2="50" y2="10" stroke="${t.sec}" stroke-width="1" transform="rotate(${sAng}, 50, 50)"/>` +
                    `<circle cx="50" cy="50" r="3" fill="${t.sec}"/></svg>`;

                const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });

                const dataURL = await new Promise(r => {
                    const fr = new FileReader();
                    fr.onload = e => r(e.target.result);
                    fr.readAsDataURL(blob);
                });

                const pngURL = await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const c = document.createElement('canvas');
                        c.width = 100; c.height = 100;
                        c.getContext('2d').drawImage(img, 0, 0);
                        resolve(c.toDataURL('image/png'));
                    };
                    img.onerror = reject;
                    img.src = dataURL;
                });

                const url = await app.attachNoteMedia({ uuid: app.context.noteUUID }, pngURL);

                if (url) {
                    const encoded = window.encodeURIComponent(window.btoa(svg));
                    const post = app.settings["timestamp analog - post script"] || "";
                    const markdown = `![${now.toLocaleTimeString()}](${url}?text=${encoded})${post ? " " + post : ""}.`;

                    // Explicit insertion at end of note.
                    // Returning "" (empty string) instead of null to prevent auto-insertion.
                    await app.insertNoteContent({ uuid: app.context.noteUUID }, markdown, { atEnd: true });
                    // app.context.replaceSelection(`![${now.toLocaleTimeString()}](${markdown})`);
                } else {
                    app.alert("Upload Failed");
                }

            } catch (e) {
                app.alert("Error: " + e.message);
            }
            return ""; // CHANGED from null to empty string to stop double-insert
        },

        "Text": function(app) {
            const d = new Date(), h = d.getHours(), m = d.getMinutes();
            const H = ["Twelve", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven"];
            const M = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Quarter", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
            const T = ["", "", "Twenty", "Thirty", "Forty", "Fifty"];

            const getM = min => {
                if (min < 20) return M[min];
                return T[Math.floor(min / 10)] + (min % 10 ? "-" + M[min % 10] : "");
            };

            let s;
            if (m === 0) s = `It's ${H[h % 12]} o'clock`;
            else if (m === 30) s = `It's half past ${H[h % 12]}`;
            else if (m < 30) s = `It's ${getM(m)} past ${H[h % 12]}`;
            else s = `It's ${getM(60 - m)} to ${H[(h + 1) % 12]}`;

            const pre = app.settings["timestamp text - pre script"] || "";
            const post = app.settings["timestamp text - post script"] || "";
            return (pre ? pre + " " : "") + s + (post ? ". " + post : ".");
        },

        "Unix": function(app) {
            return Math.floor(Date.now() / 1000).toString();
        }
    },

    replaceText: {
        "UnixToDateTime": function(app, text) {
            const ts = parseInt(text.trim(), 10);
            return isNaN(ts) ? "Invalid Unix timestamp" : new Date(ts * 1000).toLocaleString();
        }
    }
}