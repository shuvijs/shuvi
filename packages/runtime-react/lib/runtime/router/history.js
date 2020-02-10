"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const history_1 = require("history");
function addLeadingSlash(path) {
    return path.charAt(0) === "/" ? path : "/" + path;
}
function addBasename(basename, location) {
    if (!basename)
        return location;
    return Object.assign(Object.assign({}, location), { pathname: addLeadingSlash(basename) + location.pathname });
}
function stripBasename(basename, location) {
    if (!basename)
        return location;
    const base = addLeadingSlash(basename);
    if (location.pathname.indexOf(base) !== 0)
        return location;
    return Object.assign(Object.assign({}, location), { pathname: location.pathname.substr(base.length) });
}
function noop() { }
function createURL(location) {
    return typeof location === "string" ? location : history_1.createPath(location);
}
function createBrowserHistory(historyOptions) {
    return history_1.createBrowserHistory(historyOptions);
}
exports.createBrowserHistory = createBrowserHistory;
function createHashHistory(historyOptions) {
    return history_1.createHashHistory(historyOptions);
}
exports.createHashHistory = createHashHistory;
function createServerHistory({ basename, location, context }) {
    const navigateTo = (location, action) => {
        context.action = action;
        context.location = addBasename(basename, history_1.createLocation(location));
        context.url = createURL(context.location);
    };
    const handlePush = (location) => navigateTo(location, "PUSH");
    const handleReplace = (location) => navigateTo(location, "REPLACE");
    const handleListen = () => noop;
    const handleBlock = () => noop;
    return {
        length: 6,
        createHref: (path) => addLeadingSlash(basename + createURL(path)),
        action: "POP",
        location: stripBasename(basename, history_1.createLocation(location)),
        push: handlePush,
        replace: handleReplace,
        go: noop,
        goBack: noop,
        goForward: noop,
        listen: handleListen,
        block: handleBlock
    };
}
exports.createServerHistory = createServerHistory;
