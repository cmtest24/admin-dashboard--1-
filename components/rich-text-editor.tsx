"use client"

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  initialValue?: string;
  onEditorChange: (content: string, editor: any) => void;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onEditorChange, disabled }) => {
  const editorRef = useRef<any>(null);

  return (
    <Editor
      apiKey="v67x7bx8syrctltdlk4y60s70lvt2r5azbcva4o6pbkctziy" // Thay thế bằng API key của bạn
      onInit={(evt, editor) => editorRef.current = editor}
      initialValue={initialValue}
      onEditorChange={onEditorChange}
      disabled={disabled}
      init={{
        height: 500,
        menubar: false,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
    />
  );
};

export default RichTextEditor;