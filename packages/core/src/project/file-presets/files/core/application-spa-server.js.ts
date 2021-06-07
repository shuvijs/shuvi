const applicationSpaServerJsFile = `import { Application } from "@shuvi/core/lib/app/app-modules/application";

export function create(context, options) {
  return new Application({
    AppComponent: null,
    routes: [],
    context,
    render: options.render
  });
}
`;

export default {
  content: () => applicationSpaServerJsFile
};
