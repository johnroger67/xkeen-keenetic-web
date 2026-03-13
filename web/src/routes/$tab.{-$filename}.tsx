import { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';

import { API } from '@/api/client';

import { mainTabsValues } from '@/types/types';

import { App } from '@/components/App';
import { Editor } from '@/components/Editor';
import { Error404 } from '@/components/Error404';

import { useAppStore } from '@/store/useAppStore';

import { useFileNames } from '@/hooks/useFileNames';

export const Route = createFileRoute('/$tab/{-$filename}')({
  component: RouteComponent,
  notFoundComponent: Error404,
  params: {
    parse: (params) => {
      if (!mainTabsValues.includes(params.tab)) {
        throw notFound();
      }
      return params;
    },
  },
});

function RouteComponent() {
  const { tab, filename } = Route.useParams();

  const {
    findFile,
    isPending: isPendingNames,
    files,
  } = useFileNames();

  const currentFile = !filename
    ? files[0]?.name
    : findFile(filename)
      ? filename
      : false;

  const { setNeedSave, setOnSave, needSave, auth } = useAppStore();

  const { data: originalContent, isPending } = API.fileContent(
    currentFile,
    auth && Boolean(currentFile),
  );

  const fileInfo = findFile(currentFile);

  const [content, setContent] = useState<string | undefined>();
  const [uploadedContent, setUploadedContent] = useState<string | undefined>();
  const contentRef = useRef<string | undefined>(undefined);

  const onSave = useCallback(async () => {
    if (!needSave) {
      return;
    }

    const text = contentRef.current;
    if (text === undefined) {
      return;
    }

    const { data } = await API.saveFile(currentFile, text);
    if (data?.status === 0) {
      void API.invalidateFileContent(currentFile);
      setNeedSave(false);
      setUploadedContent(undefined);
    } else {
      // TODO: error
    }
  }, [currentFile, needSave, setNeedSave]);

  const handleDownload = useCallback(() => {
    const text = contentRef.current ?? originalContent?.content ?? '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile || 'file';
    a.click();
    URL.revokeObjectURL(url);
  }, [currentFile, originalContent]);

  const handleUpload = useCallback((text: string) => {
    setUploadedContent(text);
    setContent(text);
    setNeedSave(true);
  }, [setNeedSave]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    setNeedSave(false);
    setUploadedContent(undefined);
  }, [currentFile, setNeedSave, tab]);

  useEffect(() => {
    setOnSave(onSave);
  }, [onSave, setOnSave]);

  return (
    <App>
      {fileInfo && (
        <Editor
          value={uploadedContent ?? originalContent?.content ?? ''}
          type="json"
          readonly={isPending || isPendingNames}
          onChange={(value, changed) => {
            setNeedSave(changed);
            setContent(value);
          }}
          onSave={onSave}
          onDownload={handleDownload}
          onUpload={handleUpload}
          sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}
    </App>
  );
}
