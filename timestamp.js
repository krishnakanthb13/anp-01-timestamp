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
            // Validated Roman Logic
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
            // 1. Context Check
            if (!app.context.noteUUID) return "Error: Open a note to insert image.";

            try {
                // 2. SVG Generation
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

                // 3. Convert to PNG (Inline Logic)
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

                // 4. Upload
                const url = await app.attachNoteMedia({ uuid: app.context.noteUUID }, pngURL);

                if (!url) throw new Error("Upload returned empty URL");

                // 5. RETURN String (Let Amplenote handle insertion)
                const encoded = window.encodeURIComponent(window.btoa(svg));
                const post = app.settings["timestamp analog - post script"] || "";
                return `![${now.toLocaleTimeString()}](${url}?text=${encoded})${post ? " " + post : ""}.`;

            } catch (e) {
                return "Error: " + (e.message || "Unknown error");
            }
        },

        "Text": function(app) {
            return "It's time.";
            // Keeping text simple for now to avoid errors elsewhere
        },

        "Unix": function(app) {
            return Math.floor(Date.now() / 1000).toString();
        }
    },

    replaceText: {
        "Analog": async function(app, text) {
            // Placeholder to ensure object structure matches
            return null;
        }
    }
}