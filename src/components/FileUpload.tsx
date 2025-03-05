import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { saveFile, createFileLink } from '../utils/storage';
import { FileData, HCaptchaResponse } from '../types';

interface FileUploadProps {
  onLinkGenerated: (code: string, password?: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onLinkGenerated }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [password, setPassword] = useState('');
  const [downloadLimit, setDownloadLimit] = useState<number | undefined>(undefined);
  const [expiryDays, setExpiryDays] = useState<number>(7);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<HCaptcha>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleUpload = async () => {
    if (!selectedFile || !captchaToken) return;

    setIsUploading(true);
    try {
      const fileData: FileData = await saveFile(selectedFile);
      
      const options = {
        password: password || undefined,
        downloadLimit: downloadLimit,
        expiryDays
      };
      
      const link = createFileLink(fileData.id, options);
      onLinkGenerated(link.code, password || undefined);
      
      setSelectedFile(null);
      setPassword('');
      setDownloadLimit(undefined);
      setExpiryDays(7);
      setCaptchaToken(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {!selectedFile ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {t('dropzone.title')}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <File className="h-8 w-8 text-blue-500 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                clearSelectedFile();
              }}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t('form.password.label')}
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder={t('form.password.placeholder')}
          />
        </div>

        <div>
          <label htmlFor="downloadLimit" className="block text-sm font-medium text-gray-700">
            {t('form.downloadLimit.label')}
          </label>
          <input
            type="number"
            id="downloadLimit"
            min="1"
            value={downloadLimit || ''}
            onChange={(e) => setDownloadLimit(e.target.value ? parseInt(e.target.value) : undefined)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder={t('form.downloadLimit.placeholder')}
          />
        </div>

        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
            {t('form.expiry.label')}
          </label>
          <select
            id="expiry"
            value={expiryDays}
            onChange={(e) => setExpiryDays(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          >
            <option value={1}>{t('form.expiry.options.1')}</option>
            <option value={7}>{t('form.expiry.options.7')}</option>
            <option value={30}>{t('form.expiry.options.30')}</option>
            <option value={100}>{t('form.expiry.options.100')}</option>
          </select>
        </div>

        <div className="flex justify-center my-4">
          <HCaptcha
            ref={captchaRef}
            sitekey="c372cde6-f490-44d8-9722-22dc83a2b2cc"
            onVerify={handleCaptchaVerify}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || !captchaToken}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !selectedFile || isUploading || !captchaToken
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isUploading ? t('form.uploading') : t('form.upload')}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;