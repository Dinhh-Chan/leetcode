declare module '@monaco-editor/react' {
  import { ComponentType } from 'react';
  import * as monaco from 'monaco-editor';
  type MonacoEditorProps = {
    height?: string | number;
    defaultLanguage?: string;
    language?: string;
    value?: string;
    defaultValue?: string;
    theme?: string;
    options?: any;
    onChange?: (value?: string) => void;
    onMount?: (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => void;
  };
  const Editor: ComponentType<MonacoEditorProps>;
  export default Editor;
}


