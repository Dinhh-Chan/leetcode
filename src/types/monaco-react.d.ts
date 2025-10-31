declare module '@monaco-editor/react' {
  import { ComponentType } from 'react';
  type MonacoEditorProps = {
    height?: string | number;
    defaultLanguage?: string;
    language?: string;
    value?: string;
    defaultValue?: string;
    theme?: string;
    options?: any;
    onChange?: (value?: string) => void;
  };
  const Editor: ComponentType<MonacoEditorProps>;
  export default Editor;
}


