import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface LinkDisplayProps {
  code: string;
  password?: string;
}

const LinkDisplay: React.FC<LinkDisplayProps> = ({ code, password }) => {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const baseUrl = window.location.origin;
  const fullLink = `${baseUrl}/download/${code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">ファイルのリンクが生成されました</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          共有リンク
        </label>
        <div className="flex items-center">
          <input
            type="text"
            readOnly
            value={fullLink}
            className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="p-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
          >
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-500" />}
          </button>
        </div>
      </div>
      
      {password && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <div className="flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              readOnly
              value={password}
              className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {showPassword ? "隠す" : "表示"}
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            このパスワードをファイルの受信者に共有してください。
          </p>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          このリンクを共有して、ファイルをダウンロードできるようにします。
          {password && " パスワードは別途安全な方法で共有してください。"}
        </p>
      </div>
    </div>
  );
};

export default LinkDisplay;