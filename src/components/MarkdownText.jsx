import ReactMarkdown from 'react-markdown';

const MarkdownText = ({ children, style = {} }) => {
  return (
    <ReactMarkdown
      style={style}
      components={{
        // Custom styling for markdown elements
        p: ({ children }) => <div style={{ marginBottom: '8px', lineHeight: '1.5' }}>{children}</div>,
        strong: ({ children }) => <strong style={{ fontWeight: '600', color: 'inherit' }}>{children}</strong>,
        em: ({ children }) => <em style={{ fontStyle: 'italic', color: 'inherit' }}>{children}</em>,
        ul: ({ children }) => <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ paddingLeft: '20px', marginBottom: '8px' }}>{children}</ol>,
        li: ({ children }) => <li style={{ marginBottom: '4px', lineHeight: '1.4' }}>{children}</li>,
        code: ({ children }) => (
          <code style={{ 
            backgroundColor: 'rgba(0,0,0,0.1)', 
            padding: '2px 4px', 
            borderRadius: '3px',
            fontSize: '0.9em',
            fontFamily: 'monospace'
          }}>
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote style={{ 
            borderLeft: '3px solid #D4C9BE', 
            paddingLeft: '12px',
            margin: '8px 0',
            fontStyle: 'italic'
          }}>
            {children}
          </blockquote>
        )
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export default MarkdownText;