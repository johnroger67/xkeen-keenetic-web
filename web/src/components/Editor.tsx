import { useCallback, useEffect, useMemo, useState } from 'react';
import { history, undo } from '@codemirror/commands';
import { json } from '@codemirror/lang-json';
import { Compartment } from '@codemirror/state';
import { keymap, type EditorView } from '@codemirror/view';
import UndoIcon from '@mui/icons-material/Undo';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { type SxProps } from '@mui/system/styleFunctionSx';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import ReactCodeMirror from '@uiw/react-codemirror';

import { useTranslation } from '@/hooks/useTranslation';

const historyCompartment = new Compartment();

interface EditorProps {
  type: 'json';
  value: string;
  onChange?: (value: string, changed: boolean) => void;
  onSave?: () => void;
  readonly?: boolean;
  autoFocus?: boolean;
  maxHeight?: number | string;
  sx?: SxProps;
}

export const Editor = ({
  type,
  value,
  onChange,
  onSave,
  readonly = false,
  autoFocus = false,
  maxHeight = 'auto',
  sx,
}: EditorProps) => {
  const { palette } = useTheme();

  const { t } = useTranslation();

  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [changed, setChanged] = useState(false);

  const extensions = useMemo(() => {
    const result = [historyCompartment.of([])];

    if (onSave) {
      result.push(
        keymap.of([
          {
            key: 'Ctrl-s',
            mac: 'Cmd-s',
            run: () => {
              onSave();
              return true;
            },
          },
        ]),
      );
    }
    if (type === 'json') {
      result.push(json());
    }

    return result;
  }, [type, onSave]);

  const handleUndoButton = useCallback(() => {
    if (editorView) {
      undo({ state: editorView.state, dispatch: editorView.dispatch });
    }
  }, [editorView]);

  useEffect(() => {
    editorView?.dispatch({
      effects: historyCompartment.reconfigure([]),
    });
    editorView?.dispatch({
      effects: historyCompartment.reconfigure([history()]),
    });
  }, [value, editorView]);

  return (
    <Box
      flex={1}
      sx={{
        display: 'flex',
        position: 'relative',
        overflow: 'auto',
        '& .cm-theme': {
          display: 'flex',
          minWidth: '100%',
          fontSize: 13,
          maxHeight,
        },
        '& .cm-editor': {
          display: 'flex !important',
          minWidth: '100%',
          minHeight: '100%',
          background: (theme) => theme.palette.background.default,
          outline: 'none',
        },
        '& .cm-gutters': {
          background: (theme) => theme.palette.background.paper,
        },
        '& .cm-scroller': { overflow: 'auto' },
        '& .cm-lineNumbers .cm-gutterElement': {
          paddingLeft: '13px !important',
        },
        ...sx,
      }}
    >
      <ReactCodeMirror
        value={value}
        theme={palette.mode === 'light' ? vscodeLight : vscodeDark}
        autoFocus={autoFocus}
        readOnly={readonly}
        editable={!readonly}
        onCreateEditor={(view) => setEditorView(view)}
        onChange={(newValue) => {
          setChanged(value !== newValue);
          onChange?.(newValue, value !== newValue);
        }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          history: false, // enabled in extensions
          historyKeymap: true,
        }}
        extensions={extensions}
      />

      {!readonly && (
        <Tooltip
          title={t('editor.undo_button')}
          enterTouchDelay={0}
          placement="bottom"
        >
          <IconButton
            size="small"
            onClick={handleUndoButton}
            disabled={!changed}
            sx={{
              position: 'absolute',
              right: '16pt',
              top: '4pt',
              opacity: 0.7,
              color: 'text.secondary',
              transition: 'color 0.1s ease-in-out, opacity 0.1s ease-in-out',
              minWidth: 0,
              '&:hover': {
                opacity: 1,
                color: 'primary.main',
              },
            }}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

    </Box>
  );
};
