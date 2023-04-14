import { getPackageInfo, color } from './utils';

const { bin, version } = getPackageInfo();
const BIN = Object.keys(bin)[0];

export const TITLE = `
${color.logoYellow('Shuvi')} v${version}
`;

export const HELPER = `

${color.heading('Examples:')}

  $ ${BIN} --help

${color.heading('Run your project locally in development:')}

  $ ${BIN} dev
  $ ${BIN} dev --help

${color.heading('Build your project:')}

  $ ${BIN} build
  $ ${BIN} build --help
`;
