import { reexportComponentLoader } from "../../util";

function Page () {
  return <div>sdsds</div>
}

const myLoader = async () => {
  const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

  await sleep(1000)
}

const { Component, loader } = reexportComponentLoader(Page, myLoader)

export { Component as default, loader }
