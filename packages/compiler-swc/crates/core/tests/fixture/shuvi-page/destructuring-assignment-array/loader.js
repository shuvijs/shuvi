import fs from "fs";
import other from "other";
const [a, { b: c  }, ...rest] = fs.promises;
const [foo, bar] = other;
export async function loader() {
    a;
    c;
    rest;
    bar;
}