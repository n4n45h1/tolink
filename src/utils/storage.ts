import { v4 as uuidv4 } from 'uuid';
import { FileData, FileLink } from '../types';

const FILES_KEY = 'file_transfer_files';
const LINKS_KEY = 'file_transfer_links';

const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const saveFile = (file: File): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const fileData: FileData = {
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        data: event.target?.result || null,
        createdAt: Date.now()
      };
      
      const files = getFromStorage<FileData>(FILES_KEY);
      files.push(fileData);
      setToStorage(FILES_KEY, files);
      
      resolve(fileData);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const getFile = (id: string): FileData | undefined => {
  const files = getFromStorage<FileData>(FILES_KEY);
  return files.find(file => file.id === id);
};

const generateShortCode = (days: number): string => {
  const length = days <= 1 ? 4 : days <= 7 ? 5 : days <= 30 ? 6 : 8;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createFileLink = (
  fileId: string, 
  options: { 
    password?: string; 
    downloadLimit?: number; 
    expiryDays: number;
  }
): FileLink => {
  const code = generateShortCode(options.expiryDays);
  const link: FileLink = {
    id: uuidv4(),
    fileId,
    code,
    password: options.password,
    downloadLimit: options.downloadLimit,
    downloads: 0,
    expiresAt: Date.now() + (options.expiryDays * 24 * 60 * 60 * 1000),
    createdAt: Date.now()
  };
  
  const links = getFromStorage<FileLink>(LINKS_KEY);
  links.push(link);
  setToStorage(LINKS_KEY, links);
  
  return link;
};

export const getLinkByCode = (code: string): FileLink | undefined => {
  const links = getFromStorage<FileLink>(LINKS_KEY);
  return links.find(link => link.code === code);
};

export const updateLink = (link: FileLink): void => {
  const links = getFromStorage<FileLink>(LINKS_KEY);
  const index = links.findIndex(l => l.id === link.id);
  
  if (index !== -1) {
    links[index] = link;
    setToStorage(LINKS_KEY, links);
  }
};

export const isLinkValid = (link: FileLink): boolean => {
  if (Date.now() > link.expiresAt) {
    return false;
  }
  
  if (link.downloadLimit && link.downloads >= link.downloadLimit) {
    return false;
  }
  
  return true;
};

export const incrementDownloadCount = (link: FileLink): FileLink => {
  const updatedLink = {
    ...link,
    downloads: link.downloads + 1
  };
  
  updateLink(updatedLink);
  return updatedLink;
};

export const cleanupStorage = (): void => {
  const links = getFromStorage<FileLink>(LINKS_KEY);
  const files = getFromStorage<FileData>(FILES_KEY);
  
  const validLinks = links.filter(link => {
    if (Date.now() > link.expiresAt) {
      return false;
    }
    return true;
  });
  
  const usedFileIds = new Set(validLinks.map(link => link.fileId));
  const validFiles = files.filter(file => usedFileIds.has(file.id));
  
  setToStorage(LINKS_KEY, validLinks);
  setToStorage(FILES_KEY, validFiles);
};