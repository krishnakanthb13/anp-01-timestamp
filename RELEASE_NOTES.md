# Release Notes

## v0.0.14 (2026-02-05)
-   **Feature Enhancement**: Advanced Digital Timestamp Formatting.
    -   Transitioned to **Day.js** for 100% standard compliance with Moment.js tokens.
    -   Full support for **Moment.js formatting tokens** (`YYYY`, `MMMM`, `Do`, `dddd`, `Z`, etc.).
    -   Implemented **Literal Escaping** using square brackets `[...]`.
    -   Added **ISO8601** support via the `ISO` shorthand setting.
    -   Updated default format to standard `YYYY-MM-DD HH:mm:ss`.
-   **Documentation**: Updated JSDoc and README with formatting guides and reference links.

## v0.0.9 (2026-02-05)
-   **Initial Release**: First public release of the Timestamp plugin.
-   **Features**:
    -   **Digital**: Custom format support (Y-m-d H:n:s).
    -   **Roman**: Display date/time as Roman Numerals.
    -   **Analog**: Generate and upload a real-time analog clock image.
    -   **Text**: Natural language time ("It's half past Ten").
    -   **Unix**: Epoch timestamps.
    -   **Replacer**: Convert Unix timestamps to local strings inline.
-   **Architecture**:
    -   Modular ESM structure (`lib/formatters`).
    -   bundled with `esbuild` for Amplenote compatibility.
    -   Scope-safe IIFE wrapping.
