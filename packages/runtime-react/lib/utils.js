"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || "Component";
}
exports.getDisplayName = getDisplayName;
