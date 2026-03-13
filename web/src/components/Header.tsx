import { useState } from 'react';
import { useConfig } from '@/config/useConfig';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import MenuIcon from '@mui/icons-material/Menu';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import SaveIcon from '@mui/icons-material/Save';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import TerminalIcon from '@mui/icons-material/Terminal';
import {
  Alert,
  Box,
  Button,
  Divider,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from '@tanstack/react-router';

import { API } from '@/api/client';
import { type ServiceActionRequest } from '@/api/schema';

import { OutputLogDialog } from '@/components/OutputLogDialog';
import { TerminalDialog } from '@/components/TerminalDialog';
import { Trans } from '@/components/Trans';

import { useTranslation } from '@/hooks/useTranslation';

import { useAppStore } from '@/store/useAppStore';

import { useStatus } from '@/hooks/useStatus';

export const Header = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();

  const { service } = useStatus();

  const config = useConfig();

  const {
    auth,
    needSave,
    onSave,
  } = useAppStore();

  const [output, setOutput] = useState<boolean | string>(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalToken, setTerminalToken] = useState('');
  const [ttydMissing, setTtydMissing] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = async (command: ServiceActionRequest['cmd']) => {
    handleMenuClose();
    setOutput(true);
    const { data } = await API.action(command);
    const formatOutput = (lines: string[] | undefined) =>
      `> xkeen -${command}\n${lines?.join('\n') || ''}\n\n`;
    setOutput(formatOutput(data?.output));
    void API.invalidateStatus();

    if (command === 'start' || command === 'restart') {
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: logData } = await API.actionLog();
        setOutput(formatOutput(logData?.output));
      }
    }
  };

  return (
    <>
      <Box
        sx={{
          px: 'max(15px, 1.6vh)',
          py: 'max(15px, 1.6vh)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          whiteSpace: 'nowrap',
        }}
      >
        <Box
          display="flex"
          alignItems="baseline"
          justifyContent="space-between"
          flexWrap="wrap"
          rowGap={2}
          columnGap={1.7}
        >
          <Stack
            direction="row"
            spacing={1.3}
            alignItems="center"
            flexGrow={1000}
          >
            <Link
              component={RouterLink}
              underline="none"
              to="/"
              sx={{
                display: 'inline-flex',
                gap: 1.3,
                alignItems: 'center',
                direction: 'row',
                userSelect: 'none',
              }}
            >
              <Typography
                component="h2"
                fontFamily={'Vendor Logo, Roboto, sans-serif'}
                textTransform="uppercase"
                color="primary.main"
                fontSize="1.25em"
                lineHeight={1}
                sx={{
                  '@media (max-width: 475px)': {
                    fontSize: '0.85em',
                  },
                }}
              >
                Keenetic
              </Typography>
              <Typography
                component="h2"
                fontFamily={'Device Model, Roboto, sans-serif'}
                textTransform="uppercase"
                color="textPrimary"
                fontSize="1.131em"
                lineHeight={1}
                pt="3px"
                sx={{
                  '@media (max-width: 475px)': {
                    fontSize: '0.8em',
                  },
                }}
              >
                {config.title}
              </Typography>

              {auth && service && (
                <CloudDoneIcon
                  sx={{
                    fontSize: '1.25em',
                    color: 'success.main',
                    alignSelf: 'center',
                    opacity: 0.9,
                    '@media (max-width: 475px)': {
                      fontSize: '1em',
                    },
                  }}
                />
              )}
              {auth && !service && (
                <CloudOffIcon
                  sx={{
                    fontSize: '1.25em',
                    color: 'error.main',
                    alignSelf: 'center',
                    opacity: 0.9,
                    '@media (max-width: 475px)': {
                      fontSize: '1em',
                    },
                  }}
                />
              )}
            </Link>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            flexGrow={1}
            justifyContent="flex-end"
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              disabled={!needSave}
              color="error"
              onClick={onSave}
            >
              <Trans i18nKey="common.save" />
            </Button>

            <Stack
              direction="row"
              alignItems="center"
              flexGrow={1}
              justifyContent="flex-end"
            >
              <Button
                variant="text"
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  color: 'text.secondary',
                  transition: 'color 0.1s ease-in-out',
                  minWidth: 0,
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                <MenuIcon />
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: 'background.default',
                      backgroundImage: 'none',
                      border: '1px solid',
                      borderColor: 'divider',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: 13,
                    color: service ? 'success.main' : 'error.main',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: service ? 'success.main' : 'error.main',
                      flexShrink: 0,
                    }}
                  />
                  {service ? 'Запущен' : 'Остановлен'}
                </Box>

                <Divider />

                <MenuItem
                  onClick={async () => {
                    handleMenuClose();
                    const { data } = await API.startTtyd();
                    if (data?.status === 0 && data.token) {
                      setTerminalToken(data.token as string);
                      setTerminalOpen(true);
                    } else {
                      setTtydMissing(true);
                    }
                  }}
                  sx={{ fontSize: 14 }}
                >
                  <ListItemIcon>
                    <TerminalIcon />
                  </ListItemIcon>
                  Terminal
                </MenuItem>

                <Divider />

                {service && (
                  <MenuItem
                    onClick={() => handleMenuClick('restart')}
                    sx={{ fontSize: 14 }}
                  >
                    <ListItemIcon>
                      <ReplayIcon />
                    </ListItemIcon>
                    <Trans i18nKey="common.restart" />
                  </MenuItem>
                )}

                {service ? (
                  <MenuItem
                    onClick={() => handleMenuClick('stop')}
                    sx={{ fontSize: 14 }}
                  >
                    <ListItemIcon>
                      <StopCircleIcon />
                    </ListItemIcon>
                    <Trans i18nKey="common.stop" />
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={() => handleMenuClick('start')}
                    sx={{ fontSize: 14 }}
                  >
                    <ListItemIcon>
                      <PlayArrowIcon />
                    </ListItemIcon>
                    <Trans i18nKey="common.start" />
                  </MenuItem>
                )}

              </Menu>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <TerminalDialog
        open={terminalOpen}
        onClose={() => { setTerminalOpen(false); void API.stopTtyd(); }}
        token={terminalToken}
      />

      <Snackbar
        open={ttydMissing}
        onClose={() => setTtydMissing(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          onClose={() => setTtydMissing(false)}
          sx={{ fontFamily: 'monospace', fontSize: 13 }}
        >
          {t('terminal.not_installed')}
          <Box component="code" sx={{ display: 'block', mt: 0.5, fontSize: 12 }}>
            opkg install ttyd
          </Box>
        </Alert>
      </Snackbar>

      <OutputLogDialog
        content={output}
        open={Boolean(output)}
        onClose={() => {
          setOutput('');
        }}
      />

    </>
  );
};
