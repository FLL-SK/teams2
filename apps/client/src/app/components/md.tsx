import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';

/**
 * Bezpečné voľby markdown-to-jsx: raw HTML sa nerenderuje (texty píšu aj správcovia turnajov
 * a JWT je v localStorage – XSS by znamenalo prevzatie účtu). #284
 * Nebezpečné URL (`javascript:`, `data:` …) odstraňuje predvolený sanitizer knižnice.
 */
export const SAFE_MARKDOWN_OPTIONS: MarkdownToJSX.Options = {
  disableParsingRawHTML: true,
};

/**
 * Internal markdown component that wraps the markdown-to-jsx library and provides default overrides for certain elements.
 * This component is used to render markdown content in the application.
 * @param props
 * @returns
 */
export function MD(props: {
  children: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: Record<string, React.ComponentType<any>>;
  options?: MarkdownToJSX.Options;
}) {
  const { children, components, options } = props;
  return (
    <Markdown
      options={{
        ...options,
        ...SAFE_MARKDOWN_OPTIONS,
        overrides: {
          p: {
            component: (props) => <p {...props} style={{ maxWidth: '100%' }} />,
          },
          a: {
            component: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          },
          ...components,
        },
      }}
    >
      {children}
    </Markdown>
  );
}
