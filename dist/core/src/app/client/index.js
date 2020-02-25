"use strict";
if (process.env.NODE_ENV === "development") {
    require("./index.dev");
}
else {
    require("./index.prod");
}
