import CloseIcon from '@mui/icons-material/Close';
import TerminalIcon from '@mui/icons-material/Terminal';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';

import { useTranslation } from '@/hooks/useTranslation';

const TTYD_PORT = 7681;

export const TerminalDialog = ({
  open,
  onClose,
  token,
}: {
  open: boolean;
  onClose: VoidFunction;
  token: string;
}) => {
  const { t } = useTranslation();
  const ttydUrl = `http://${window.location.hostname}:${TTYD_PORT}/${token}/`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      sx={{ '& .MuiDialog-paper': { height: '85svh' } }}
    >
      <DialogTitle
        sx={{
          py: 1,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontSize: 13,
          fontFamily: 'monospace',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TerminalIcon fontSize="small" sx={{ opacity: 0.6 }} />
          {window.location.hostname}
        </Box>
        <Tooltip title={t('common.close')} placement="left">
          <IconButton size="small" onClick={onClose} sx={{ opacity: 0.6 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {open && (
          <iframe
            src={ttydUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
            title="Terminal"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
