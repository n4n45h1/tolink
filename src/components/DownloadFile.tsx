import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Lock, AlertCircle } from 'lucide-react';
import { getLinkByCode, getFile, isLinkValid, incrementDownloadCount } from '../utils/storage';
import { FileData, FileLink } from '../types';

const DownloadFile: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [fileLink, setFileLink] = useState<FileLink | null>(null);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    if (!code) {
      setError('無効なダウンロードリンクです。');
      setIsLoading(false);
      return;
    }

    const link = getLinkByCode(code);
    
    if (!link) {
      setError('ファイルが見つかりません。リンクが無効か期限切れの可能性があります。');
      setIsLoading(false);
      return;
    }

    setFileLink(link);
    
    if (!isLinkValid(link)) {
      setError('このリンクは期限切れか、ダウンロード回数の上限に達しています。');
      setIsLoading(false);
      return;
    }

    if (link.password) {
      setIsPasswordRequired(true);
      setIsLoading(false);
      return;
    }

    const file = getFile(link.fileId);
    if (!file) {
      setError('ファイルが見つかりません。');
      setIsLoading(false);
      return;
    }

    setFileData(file);
    setIsLoading(false);
  }, [code]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileLink) return;
    
    if (password !== fileLink.password) {
      setError('パスワードが正しくありません。');
      return;
    }

    const file = getFile(fileLink.fileId);
    if (!file) {
      setError('ファイルが見つかりません。');
      return;
    }

    setFileData(file);
    setIsPasswordRequired(false);
    setError(null);
  };

  const handleDownload = () => {
    if (!fileLink || !fileData || !fileData.data) return;
    
    // Increment download count
    incrementDownloadCount(fileLink);
    
    // Create download link
    const dataStr = fileData.data.toString();
    const element = document.createElement('a');
    element.setAttribute('href', dataStr);
    element.setAttribute('download', fileData.name);
    
    // Append to document, trigger click and remove
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setDownloadStarted(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">エラーが発生しました</h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (isPasswordRequired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <Lock className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">パスワード保護されたファイル</h2>
          <p className="text-center text-gray-600 mb-6">このファイルをダウンロードするにはパスワードが必要です。</p>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="パスワードを入力"
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              確認
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (fileData && fileLink) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          {!downloadStarted ? (
            <>
              <div className="flex items-center justify-center mb-6">
                <Download className="h-12 w-12 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">ファイルのダウンロード</h2>
              
              <div className="border border-gray-200 rounded-md p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">ファイル名:</span>
                  <span className="text-sm text-gray-900">{fileData.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">サイズ:</span>
                  <span className="text-sm text-gray-900">{formatFileSize(fileData.size)}</span>
                </div>
                
                {fileLink.downloadLimit && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-gray-700">残りダウンロード回数:</span>
                    <span className="text-sm text-gray-900">
                      {Math.max(0, fileLink.downloadLimit - fileLink.downloads)}回
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleDownload}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                ダウンロード
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center mb-6">
                <Check className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">ダウンロードを開始しました</h2>
              <p className="text-center text-gray-600 mb-6">
                ファイルのダウンロードが自動的に開始されます。開始されない場合は、もう一度ダウンロードボタンをクリックしてください。
              </p>
              <button
                onClick={handleDownload}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                再ダウンロード
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full mt-4 py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                ホームに戻る
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default DownloadFile;