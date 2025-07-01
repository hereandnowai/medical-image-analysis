
import React, { useState, useCallback } from 'react';
import { Login } from './components/Login';
import { ImageUploader } from './components/ImageUploader';
import { ImagePreview } from './components/ImagePreview';
import { AnalysisReport } from './components/AnalysisReport';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Alert } from './components/Alert';
import { analyzeImageWithGemini } from './services/geminiService';
import type { UploadedImage, AnalysisResult, AppError } from './types';
import { 
  FooterInfoIcon, 
  BlogIcon, 
  LinkedInIcon, 
  InstagramIcon, 
  GitHubIcon, 
  XIcon, 
  YouTubeIcon,
  LogoutIcon
} from './components/icons';
import { branding } from './branding'; // Import brand configuration

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);

  const brand = branding.brand;

  const handleLogin = useCallback((username: string) => {
    setUser(username);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setUploadedImage(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setUploadedImage(image);
    setAnalysisResult(null); 
    setError(null); 
  }, []);

  const handleAnalyzeImage = useCallback(async () => {
    if (!uploadedImage) {
      setError({ message: 'Please upload an image first.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const resultText = await analyzeImageWithGemini(uploadedImage.base64, uploadedImage.file.type);
      setAnalysisResult({ report: resultText });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError({ message: err.message || 'Failed to analyze image. Please ensure your API key is configured correctly and try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage]);

  const clearImageAndResults = useCallback(() => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setError(null);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen text-[var(--hnai-text-on-secondary)] flex flex-col items-center justify-center p-4 selection:bg-[var(--hnai-primary-color)] selection:text-[var(--hnai-text-on-primary)]">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[var(--hnai-text-on-secondary)] flex flex-col items-center p-4 selection:bg-[var(--hnai-primary-color)] selection:text-[var(--hnai-text-on-primary)]">
      {/* User Session Bar */}
      <div className="w-full max-w-5xl flex justify-end items-center py-2">
        {user && <p className="text-slate-300 text-sm mr-4">Logged in as: <strong>{user.split('@')[0]}</strong></p>}
        <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-3 rounded-lg shadow-md transition-colors duration-150"
            title="Logout"
        >
            <LogoutIcon className="w-5 h-5" />
            <span>Logout</span>
        </button>
      </div>
      
      <header className="w-full max-w-5xl pt-2 pb-6 mb-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <img 
            src={brand.logo.title} 
            alt={`${brand.organizationShortName} Logo`} 
            className="w-48 md:w-64 h-auto mb-2" // Adjusted size
          />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--hnai-primary-color)]">
            {brand.organizationLongName}
          </h1>
        </div>
        <p className="mt-3 text-lg font-medium text-slate-300">
          {brand.slogan}
        </p>
        <p className="mt-1 text-slate-400 text-sm">
          Upload medical images (JPG, PNG, DICOM) for AI-powered analysis.
        </p>
      </header>

      <main className="w-full max-w-5xl bg-[rgba(0,0,0,0.2)] shadow-2xl rounded-lg p-6 md:p-8 space-y-8"> {/* Subtle dark panel */}
        {error && <Alert type="error" message={error.message} onClose={() => setError(null)} />}
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[var(--hnai-primary-color)]">1. Upload Image</h2>
            <ImageUploader onImageUpload={handleImageUpload} disabled={isLoading} />
            {uploadedImage && (
              <div className="mt-4 space-y-4">
                <ImagePreview src={uploadedImage.previewUrl} alt="Uploaded medical image" />
                <div className="flex space-x-2">
                    <button
                    onClick={handleAnalyzeImage}
                    disabled={isLoading || !uploadedImage}
                    className="w-full bg-[var(--hnai-primary-color)] hover:bg-yellow-300 text-[var(--hnai-text-on-primary)] font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                    {isLoading ? <LoadingSpinner size="small" color="text-[var(--hnai-text-on-primary)]" /> : <span>Analyze Image</span>}
                    </button>
                    <button
                        onClick={clearImageAndResults}
                        disabled={isLoading}
                        className="w-auto bg-slate-600 hover:bg-slate-500 text-slate-200 font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 disabled:opacity-50"
                    >
                        Clear
                    </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[var(--hnai-primary-color)]">2. AI Analysis Report</h2>
            {isLoading && !analysisResult && (
              <div className="flex flex-col items-center justify-center h-64 bg-[rgba(0,0,0,0.15)] rounded-lg p-4"> {/* Subtle panel */}
                <LoadingSpinner color="text-[var(--hnai-primary-color)]"/>
                <p className="mt-4 text-slate-300">Analyzing image, please wait...</p>
              </div>
            )}
            {analysisResult && !isLoading && (
              <AnalysisReport report={analysisResult.report} />
            )}
            {!isLoading && !analysisResult && !uploadedImage && (
              <div className="flex flex-col items-center justify-center h-64 bg-[rgba(0,0,0,0.15)] rounded-lg p-6 text-center">
                <p className="text-slate-400">Upload an image and click "Analyze Image" to see the AI report here.</p>
              </div>
            )}
             {!isLoading && !analysisResult && uploadedImage && (
              <div className="flex flex-col items-center justify-center h-64 bg-[rgba(0,0,0,0.15)] rounded-lg p-6 text-center">
                <p className="text-slate-400">Click "Analyze Image" to generate the report.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <section className="w-full max-w-5xl bg-[rgba(0,0,0,0.2)] shadow-2xl rounded-lg p-6 md:p-8 mt-12 space-y-4">
        <h2 className="text-2xl font-bold text-[var(--hnai-primary-color)] border-b border-slate-700 pb-2 mb-4">
          About AI in Medical Imaging
        </h2>
        
        <div>
          <h3 className="text-xl font-semibold text-slate-100 mb-3">
            🔍 Key Features
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            While this tool uses Google's Gemini, the following points highlight general AI capabilities and considerations in the field of medical imaging:
          </p>
          
          <div className="space-y-4 text-slate-300">
            <div>
              <p className="font-semibold text-slate-200">Multimodal Analysis:</p>
              <p className="pl-4 text-sm">
                AI can process and interpret both textual and visual data, allowing it to analyze medical images such as X-rays, MRIs, and CT scans alongside accompanying clinical notes.
              </p>
            </div>
            
            <div>
              <p className="font-semibold text-slate-200">Image Interpretation:</p>
              <p className="pl-4 text-sm">
                The models have demonstrated the ability to identify certain pathologies in medical images. For instance, correctly diagnosing community-acquired pneumonia from a chest X-ray and identifying a clival chondroma in an MRI scan.
                {' '}(<a href="https://jmai.amegroups.org" target="_blank" rel="noopener noreferrer" className="text-[var(--hnai-primary-color)] hover:underline">jmai.amegroups.org</a>)
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-200">Integration with Clinical Data:</p>
              <p className="pl-4 text-sm">
                By combining image analysis with patient history and other textual data, AI can provide comprehensive insights, potentially aiding in differential diagnoses.
                {' '}(<a href="https://askfeather.com" target="_blank" rel="noopener noreferrer" className="text-[var(--hnai-primary-color)] hover:underline">askfeather.com</a>, <a href="https://medinform.jmir.org" target="_blank" rel="noopener noreferrer" className="text-[var(--hnai-primary-color)] hover:underline">medinform.jmir.org</a>)
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-200">Support for Radiology Education:</p>
              <p className="pl-4 text-sm">
                AI can assist in educational settings by explaining radiological findings and concepts, serving as a supplementary tool for medical students and professionals.
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 mt-4 border-t border-slate-700">
          <h3 className="text-xl font-semibold text-slate-100 mb-3">
            ⚠️ Limitations and Considerations
          </h3>

          <div className="space-y-4 text-slate-300">
              <div>
                  <p className="font-semibold text-slate-200">Diagnostic Accuracy:</p>
                  <p className="pl-4 text-sm">
                      While AI shows potential, studies have indicated that its diagnostic accuracy in medical imaging is not yet on par with specialized tools or expert radiologists.
                      {' '}(<a href="https://pmc.ncbi.nlm.nih.gov" target="_blank" rel="noopener noreferrer" className="text-[var(--hnai-primary-color)] hover:underline">pmc.ncbi.nlm.nih.gov</a>)
                  </p>
              </div>

              <div>
                  <p className="font-semibold text-slate-200">Regulatory Approval:</p>
                  <p className="pl-4 text-sm">
                      AI tools like this are generally not approved for primary clinical diagnostic use and should not replace professional medical judgment.
                      {' '}(<a href="https://help.openai.com" target="_blank" rel="noopener noreferrer" className="text-[var(--hnai-primary-color)] hover:underline">help.openai.com</a>)
                  </p>
              </div>

              <div>
                  <p className="font-semibold text-slate-200">Complex Image Interpretation:</p>
                  <p className="pl-4 text-sm">
                      The model may struggle with interpreting complex or subtle findings in medical images, underscoring the need for human oversight.
                  </p>
              </div>
          </div>
        </div>
      </section>

      <footer className="w-full max-w-5xl mt-12 py-6 text-center text-xs text-slate-400">
        <div className="bg-[rgba(0,0,0,0.2)]/50 p-3 rounded-lg mb-6"> {/* Subtle panel */}
          <div className="flex items-center justify-center space-x-2">
            <FooterInfoIcon className="w-5 h-5 text-[var(--hnai-primary-color)]" />
            <p className="text-slate-300">
              <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-[var(--hnai-primary-color)] hover:underline mx-2">{brand.website}</a>
          <span className="text-slate-500">|</span>
          <a href={`mailto:${brand.email}`} className="text-[var(--hnai-primary-color)] hover:underline mx-2">{brand.email}</a>
          {brand.mobile && (<><span className="text-slate-500">|</span><span className="mx-2 text-slate-300">{brand.mobile}</span></>)}
        </div>
        
        <div className="flex justify-center space-x-4 mb-4">
          {brand.socialMedia.blog && <a href={brand.socialMedia.blog} target="_blank" rel="noopener noreferrer" title="Blog"><BlogIcon className="w-6 h-6 text-[var(--hnai-primary-color)] hover:opacity-75 transition-opacity" /></a>}
          {brand.socialMedia.linkedin && <a href={brand.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"><LinkedInIcon className="w-6 h-6 text-[var(--hnai-primary-color)] hover:opacity-75 transition-opacity" /></a>}
          {brand.socialMedia.instagram && <a href={brand.socialMedia.instagram} target="_blank" rel="noopener noreferrer" title="Instagram"><InstagramIcon className="w-6 h-6 text-[var(--hnai-primary-color)] hover:opacity-75 transition-opacity" /></a>}
          {brand.socialMedia.github && <a href={brand.socialMedia.github} target="_blank" rel="noopener noreferrer" title="GitHub"><GitHubIcon className="w-6 h-6 text-[var(--hnai-primary-color)] hover:opacity-75 transition-opacity" /></a>}
          {brand.socialMedia.x && <a href={brand.socialMedia.x} target="_blank" rel="noopener noreferrer" title="X (Twitter)"><XIcon className="w-6 h-6 text-[var(--hnai-primary-color)] hover:opacity-75 transition-opacity" /></a>}
          {brand.socialMedia.youtube && <a href={brand.socialMedia.youtube} target="_blank" rel="noopener noreferrer" title="YouTube"><YouTubeIcon className="w-6 h-6 text-[var(--hnai-primary-color)] hover:opacity-75 transition-opacity" /></a>}
        </div>
        
        <p className="text-slate-500">&copy; {new Date().getFullYear()} {brand.organizationShortName}. All rights reserved.</p>
        <p className="text-slate-600 mt-1">{brand.slogan}</p>
      </footer>
    </div>
  );
};

export default App;
