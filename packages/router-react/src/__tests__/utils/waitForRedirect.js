export default function waitForRedirect(fn) {
  // TODO: Hook into <Redirect> so we can know when
  // the redirect actually happens instead of guessing.
  setTimeout(fn, 100);
}
