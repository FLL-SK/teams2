import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';

/**
 * Internal markdown component that wraps the markdown-to-jsx library and provides default overrides for certain elements.
 * This component is used to render markdown content in the application.
 * @param props
 * @returns
 */
export function MD(props: {
  children: string;
  components?: Record<string, React.ComponentType<any>>;
  options?: MarkdownToJSX.Options;
}) {
  const { children, components, options } = props;
  return (
    <Markdown
      options={{
        ...options,
        overrides: {
          p: {
            component: (props) => <p {...props} style={{ maxWidth: '100%' }} />,
          },
          ...components,
        },
      }}
    >
      {children}
    </Markdown>
  );
}
