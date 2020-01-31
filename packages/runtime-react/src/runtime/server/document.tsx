import React, { Component, FunctionComponent, useContext } from "react";
import { Runtime } from "@shuvi/core";
import { DocumentContext, DocumentContextType } from "../../documentContext";

function HtmlTag({ tagName, attrs = {} }: Runtime.HtmlTag) {
  const { innerHtml, ...rest } = attrs;
  return React.createElement(tagName, {
    ...rest,
    dangerouslySetInnerHTML: {
      __html: innerHtml
    }
  });
}

function Html(props: any) {
  return <html {...props} />;
}

function Head() {
  const { documentProps } = useContext(DocumentContext);
  const essentialTags = documentProps.headTags.map((tag, index) => (
    <HtmlTag key={index} {...tag} />
  ));

  return <>{essentialTags}</>;
}

function Main() {
  const { documentProps } = useContext(DocumentContext);

  return (
    <div
      id="__app"
      dangerouslySetInnerHTML={{ __html: documentProps.appHtml }}
    />
  );
}

const BodyScripts: FunctionComponent<any> = () => {
  const { documentProps } = useContext(DocumentContext);
  const essentialTags = documentProps.bodyTags.map((tag, index) => (
    <HtmlTag key={index} {...tag} />
  ));

  return <>{essentialTags}</>;
};

export default class Document extends Component<Runtime.DocumentProps> {
  context!: DocumentContextType;

  getContextValue(): DocumentContextType {
    return {
      documentProps: this.props
    };
  }

  render() {
    return (
      <DocumentContext.Provider value={this.getContextValue()}>
        <Html>
          <Head />
          <body>
            <Main />
            <BodyScripts />
          </body>
        </Html>
      </DocumentContext.Provider>
    );
  }
}
