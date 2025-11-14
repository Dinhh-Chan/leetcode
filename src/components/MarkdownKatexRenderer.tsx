import 'katex/dist/katex.min.css';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import './markdown-katex-renderer.css';

interface IMarkdownKatexRendererProps {
	content: string;
	className?: string;
}

export function MarkdownKatexRenderer({ content, className }: IMarkdownKatexRendererProps) {
	const components: Components = {
		// Headings
		h1: ({ children }) => <h1 className='markdown-h1'>{children}</h1>,
		h2: ({ children }) => <h2 className='markdown-h2'>{children}</h2>,
		h3: ({ children }) => <h3 className='markdown-h3'>{children}</h3>,
		h4: ({ children }) => <h4 className='markdown-h4'>{children}</h4>,
		h5: ({ children }) => <h5 className='markdown-h5'>{children}</h5>,
		h6: ({ children }) => <h6 className='markdown-h6'>{children}</h6>,

		// Paragraphs
		p: ({ children }) => <p className='markdown-p'>{children}</p>,

		// Links
		a: ({ href, children }) => (
			<a
				href={href}
				className='markdown-link'
				target={href?.startsWith('http') ? '_blank' : undefined}
				rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
			>
				{children}
			</a>
		),

		// Lists
		ul: ({ children }) => <ul className='markdown-ul'>{children}</ul>,
		ol: ({ children }) => <ol className='markdown-ol'>{children}</ol>,
		li: ({ children, className }) => {
			// Handle task list items
			const isTaskList = className?.includes('task-list-item');
			return <li className={`markdown-li ${isTaskList ? 'task-list-item' : ''}`}>{children}</li>;
		},

		// Code blocks - Fixed logic
		code: ({ className, children, ...props }) => {
			const match = /language-(\w+)/.exec(className || '');
			const language = match ? match[1] : '';

			// Use the inline prop from react-markdown to determine if it's inline code
			// If inline is undefined, fallback to checking if there's a language
			const isInline = !language;

			if (!isInline && language) {
				return (
					<div className='markdown-code-block'>
						<SyntaxHighlighter
							language={language}
							style={oneLight}
							PreTag='div'
							className='markdown-syntax-highlighter'
							customStyle={{
								margin: 0,
								borderRadius: '0.5rem',
							}}
						>
							{String(children).replace(/\n$/, '')}
						</SyntaxHighlighter>
					</div>
				);
			}

			return (
				<code className='markdown-inline-code' {...props}>
					{children}
				</code>
			);
		},

		// Pre tag (wrapper for code blocks)
		pre: ({ children }) => <>{children}</>,

		// Blockquotes
		blockquote: ({ children }) => <blockquote className='markdown-blockquote'>{children}</blockquote>,

		// Tables
		table: ({ children }) => (
			<div className='markdown-table-wrapper'>
				<table className='markdown-table'>{children}</table>
			</div>
		),
		thead: ({ children }) => <thead className='markdown-thead'>{children}</thead>,
		tbody: ({ children }) => <tbody>{children}</tbody>,
		tr: ({ children }) => <tr className='markdown-tr'>{children}</tr>,
		th: ({ children }) => <th className='markdown-th'>{children}</th>,
		td: ({ children }) => <td className='markdown-td'>{children}</td>,

		// Horizontal rule
		hr: () => <hr className='markdown-hr' />,

		// Images
		img: ({ src, alt }) => {
			const imageSrc = typeof src === 'string' ? src : '/placeholder.svg?height=400&width=600&text=Image';
			return (
				<div className='markdown-img-wrapper'>
					<img src={imageSrc || '/placeholder.svg'} alt={alt || ''} className='markdown-img' loading='lazy' />
				</div>
			);
		},

		// Strong and emphasis
		strong: ({ children }) => <strong className='markdown-strong'>{children}</strong>,
		em: ({ children }) => <em className='markdown-em'>{children}</em>,

		// Strikethrough (from remark-gfm)
		del: ({ children }) => <del className='markdown-del'>{children}</del>,

		// Task lists checkboxes (from remark-gfm)
		input: ({ type, checked, disabled, ...props }) => {
			if (type === 'checkbox') {
				return (
					<input
						type='checkbox'
						checked={checked}
						disabled={disabled}
						readOnly
						className='markdown-checkbox'
						{...props}
					/>
				);
			}
			return <input type={type} {...props} />;
		},
	};

	return (
		<div className={`markdown-renderer ${className || ''}`}>
			<ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
				{content}
			</ReactMarkdown>
		</div>
	);
}

