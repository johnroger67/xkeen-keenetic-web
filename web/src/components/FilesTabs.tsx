import DataObjectIcon from '@mui/icons-material/DataObject';
import { Box, Tab, Tabs } from '@mui/material';
import { useNavigate, useParams } from '@tanstack/react-router';

import type { MainTabsValues } from '@/types/types';

import { useFileNames } from '@/hooks/useFileNames';

export const FilesTabs = () => {
  const { tab, filename } = useParams({ strict: false }) as {
    tab?: MainTabsValues;
    filename?: string;
  };

  const navigate = useNavigate();

  const { files, isPending, findFile } = useFileNames();

  const currentTab = tab || 'settings';

  const currentFile = !filename
    ? files[0]?.name
    : findFile(filename)
      ? filename
      : false;

  return isPending ? (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        minHeight: 50,
      }}
    ></Box>
  ) : (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {files?.length ? (
        <Tabs
          value={currentFile}
          onChange={(_, value) => {
            void navigate({ to: `/${currentTab}/${value}` });
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 50,
            flex: 1,
          }}
        >
          {files.map(({ name }) => (
            <Tab
              key={name}
              value={name}
              icon={<DataObjectIcon fontSize="small" />}
              iconPosition="start"
              label={name}
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
          ))}
        </Tabs>
      ) : (
        <></>
      )}
    </Box>
  );
};
