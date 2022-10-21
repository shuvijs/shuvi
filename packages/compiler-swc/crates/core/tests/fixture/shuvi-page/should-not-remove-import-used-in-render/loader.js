import { Root, Children, JSXMemberExpression, AttributeValue, AttributeJSX, ValueInRender, ValueInEffect, UnusedInRender } from "../";
export async function loader() {
    return {
        props: {
            // simulate import usage inside loader
            used: [
                // these import references should not be removed
                Root.value,
                Children.value,
                AttributeValue.value,
                AttributeJSX.value,
                ValueInRender.value,
                ValueInEffect.value,
                JSXMemberExpression.value,
                // this import reference should be removed
                UnusedInRender.value
            ]
        }
    };
}