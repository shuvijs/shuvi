import fs from "fs";
import other from "other";
const { readFile , readdir , access: foo  } = fs.promises;
const { b , cat: bar , ...rem } = other;
export async function loader() {
    readFile;
    readdir;
    foo;
    b;
    bar;
    rem;
}