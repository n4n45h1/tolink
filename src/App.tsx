import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FileUp, Download, Github } from 'lucide-react';
import FileUpload from './components/FileUpload';
import LinkDisplay from './components/LinkDisplay';
import DownloadFile from './components/DownloadFile';
import { cleanupStorage } from './utils/storage';

function App() {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | undefined>(undefined);

  // Run cleanup on app start
  useEffect(() => {
    cleanupStorage();
  }, []);

  const handleLinkGenerated = (code: string, password?: string) => {
    setGeneratedCode(code);
    setGeneratedPassword(password);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setGeneratedCode(null);
    setGeneratedPassword(undefined);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="flex items-center" onClick={resetForm}>
                <FileUp className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">ファイル転送サービス</span>
              </Link>
              <a 
                href="https://github.com/n4n45h1/tolink" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
              >
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={
              <div>
                {generatedCode ? (
                  <div className="mb-8">
                    <LinkDisplay code={generatedCode} password={generatedPassword} />
                    <div className="mt-4 text-center">
                      <button
                        onClick={resetForm}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        別のファイルをアップロード
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">安全なファイル共有</h1>
                      <p className="text-gray-600 max-w-2xl mx-auto">
                        ファイルをアップロードして、カスタマイズ可能な共有リンクを生成します。
                        パスワード保護、ダウンロード回数制限、有効期限などのオプションを設定できます。
                      </p>
                    </div>
                    <FileUpload onLinkGenerated={handleLinkGenerated} />
                  </div>
                )}

                <div className="mt-12 grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <FileUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-900">簡単アップロード</h3>
                    </div>
                    <p className="text-gray-600">
                      ドラッグ＆ドロップまたはファイル選択で、すぐにファイルをアップロードできます。
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Download className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-900">カスタマイズ可能</h3>
                    </div>
                    <p className="text-gray-600">
                      パスワード保護、ダウンロード回数制限、有効期限などのオプションを設定できます。
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Github className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-900">オープンソース</h3>
                    </div>
                    <p className="text-gray-600">
                      このプロジェクトはオープンソースで、GitHub上で開発されています。
                    </p>
                  </div>
                </div>
              </div>
            } />
            <Route path="/download/:code" element={<DownloadFile />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} ファイル転送サービス. All rights reserved. Developed by N4n45h1.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;