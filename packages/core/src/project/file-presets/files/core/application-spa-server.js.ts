const applicationSpaServerJsFile = `import { Application } from "@shuvi/core/lib/app/app-modules/application";

export function create(context, options) {
  return new Application({
    AppComponent: null,
    router: null,
    context,
    render: options.render
  });
}
`;

export default {
  content: () => applicationSpaServerJsFile
};
