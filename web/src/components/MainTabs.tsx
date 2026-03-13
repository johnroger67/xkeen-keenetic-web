import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import { Box, Tab, Tabs } from '@mui/material';
import { useNavigate, useParams } from '@tanstack/react-router';

import { type MainTabsValues } from '@/types/types';

import { useTranslation } from '@/hooks/useTranslation';

export const MainTabs = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { tab } = useParams({ strict: false }) as {
    tab?: MainTabsValues;
  };

  const currentTab = !tab || tab === 'settings' ? 'settings' : false;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, value) => {
            void navigate({ to: value === 'settings' ? '/settings' : '/' });
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 50,
            flex: 1,
          }}
        >
          <Tab
            key="settings"
            value="settings"
            icon={<DisplaySettingsIcon fontSize="small" />}
            iconPosition="start"
            label={t('tabs.settings')}
            sx={{
              minHeight: '50px',
              fontSize: 14,
              transition: 'color 0.1s ease-in-out',
              '&.Mui-selected': {
                color: 'text.primary',
              },
              '&:hover': {
                color: 'text.primary',
              },
            }}
          />
        </Tabs>
      </Box>
    </>
  );
};
