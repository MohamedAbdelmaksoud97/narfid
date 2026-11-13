import { Fragment, createElement } from "react";
import {
  getAttributesFromExtensions,
  getSchemaByResolvedExtensions,
  resolveExtensions,
  splitExtensions,
  type JSONContent,
} from "@tiptap/core";
import type { Mark, Node } from "@tiptap/pm/model";
import {
  applyStaticEditorOptionsToExtensions,
  domOutputSpecToReactElement,
  mapMarkExtensionToReactNode,
  mapNodeExtensionToReactNode,
  type renderToReactElement,
} from "@tiptap/static-renderer/pm/react";
import { renderJSONContentToReactElement } from "@tiptap/static-renderer/json/react";
import { articleExtensions } from "./extensions";

type Options = NonNullable<Parameters<typeof renderToReactElement>[0]["options"]>;

function compileRenderer() {
  const extensions = resolveExtensions(
    applyStaticEditorOptionsToExtensions(articleExtensions(), {
      textDirection: "auto",
    }),
  );
  const schema = getSchemaByResolvedExtensions(extensions);
  const attributes = getAttributesFromExtensions(extensions);
  const { nodeExtensions, markExtensions } = splitExtensions(extensions);
  const nodes = Object.fromEntries(
    nodeExtensions
      .filter((extension) => extension.name !== "doc" && extension.name !== "text")
      .map((extension) =>
        mapNodeExtensionToReactNode(domOutputSpecToReactElement, extension, attributes),
      ),
  );
  const marks = Object.fromEntries(
    markExtensions.map((extension) =>
      mapMarkExtensionToReactNode(domOutputSpecToReactElement, extension, attributes),
    ),
  );
  return { schema, nodes, marks };
}

// Only schema and mapping functions are shared, never article data or React
// elements. Heading counters and other overrides remain local to each render.
let compiled: ReturnType<typeof compileRenderer> | undefined;
export function renderArticleContent({ content, options }: {
  content: JSONContent;
  options: Options;
}) {
  const { schema, nodes, marks } = (compiled ??= compileRenderer());
  return renderJSONContentToReactElement<Mark, Node>({
    nodeMapping: {
      ...nodes,
      doc: ({ children }) => createElement(Fragment, null, children),
      text: ({ node }) => node.text ?? "",
      ...options.nodeMapping,
    },
    markMapping: { ...marks, ...options.markMapping },
  })({ content: schema.nodeFromJSON(content) });
}
