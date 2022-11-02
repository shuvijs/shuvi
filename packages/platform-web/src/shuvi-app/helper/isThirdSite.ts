const THIRD_SITE_REG = /^http(s?)\:\/\//;

function isThirdSite(url: string) {
  return THIRD_SITE_REG.test(url);
}

export default isThirdSite;
