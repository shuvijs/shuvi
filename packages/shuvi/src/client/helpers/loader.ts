/// <reference lib="dom" />

export function loadScript(url: string) {
  const script = document.createElement("script");
  script.src = url;
  script.onerror = () => {
    // TODO: collect error
    throw new Error(`Error loading script ${url}`);
  };
  document.body.appendChild(script);
}
