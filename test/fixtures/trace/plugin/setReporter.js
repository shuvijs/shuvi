import { setReporter } from '@shuvi/service/lib/trace';

window._reporterData = [];
window._clearReporterData = () => {
  window._reporterData = [];
};

setReporter(data => {
  window._reporterData.push(data);
});
