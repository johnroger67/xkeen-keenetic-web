import { API } from '@/api/client';

export type FileInfo = {
  name: string;
  editable: boolean;
  removable: boolean;
  type: 'json';
};

export function useFileNames() {
  const { isPending, data, error } = API.listFiles();

  if (error) {
    throw error;
  }

  const files: FileInfo[] = (data?.files || []).map((filename) => {
    return {
      name: filename,
      editable: true,
      removable: false,
      type: 'json',
    };
  });

  return {
    files,
    findFile: (name: string) => files.find((file) => file.name === name),
    isPending,
  };
}
