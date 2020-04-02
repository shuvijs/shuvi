import React from "react";
// @ts-ignore
import { Head } from "@shuvi/app";
import style from "../style/page-404.css";

export default function Page404() {
  return (
    <div className={style.container}>
      <Head>
        <title>404: Page not found</title>
      </Head>

      <div className={style.error}>
        <div className={style.errorCode}>404</div>
        <div className={style.errorDesc}>This page could not be found.</div>
      </div>
    </div>
  );
}
