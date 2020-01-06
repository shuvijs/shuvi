"use strict";
/// <reference lib="dom" />
Object.defineProperty(exports, "__esModule", { value: true });
function loadScript(url) {
    const script = document.createElement("script");
    script.src = url;
    script.onerror = () => {
        // TODO: collect error
        throw new Error(`Error loading script ${url}`);
    };
    document.body.appendChild(script);
}
exports.loadScript = loadScript;
