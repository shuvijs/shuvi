import createConnect from "connect";
import { IConnect } from "./types";

export function Connect(): IConnect {
  return createConnect();
}
