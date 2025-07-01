
import React, { useState, useCallback } from 'react';
import { CopyIcon, CheckIcon, DownloadIcon } from './icons';

interface AnalysisReportProps {
  report: string;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(report)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy report:', err));
  }, [report]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ai_analysis_report.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [report]);

  const formattedReport = report
    .split('\n')
    .map((line, index, array) => {
      line = line.trim();
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const content = line.substring(line.startsWith('* ') ? 2 : line.startsWith('- ') ? 2 : 0);
        return `<li class="ml-4 list-disc">${content}</li>`;
      }
      if (line.match(/^\d+\.\s/)) {
        const content = line.replace(/^\d+\.\s/, '');
        return `<li class="ml-4 list-decimal">${content}</li>`;
      }
      if (line.startsWith('### ')) {
        return `<h4 class="text-md font-semibold mt-3 mb-1 text-[var(--hnai-primary-color)] opacity-90">${line.substring(4)}</h4>`;
      }
      if (line.startsWith('## ')) {
        return `<h3 class="text-lg font-semibold mt-4 mb-2 text-[var(--hnai-primary-color)]">${line.substring(3)}</h3>`;
      }
       if (line.startsWith('# ')) {
        return `<h2 class="text-xl font-semibold mt-4 mb-2 text-[var(--hnai-primary-color)]">${line.substring(2)}</h2>`;
      }
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100">$1</strong>');

      const prevLine = index > 0 ? array[index-1].trim() : '';
      const isAfterList = prevLine.startsWith('* ') || prevLine.startsWith('- ') || prevLine.match(/^\d+\.\s/);
      
      if(line.length > 0 && !line.startsWith('<')) { 
        return `<p class="${isAfterList ? 'mt-3' : 'mt-1'}">${line}</p>`;
      }
      if (line.length === 0 && index > 0 && !isAfterList && !prevLine.startsWith('<h')) {
        return '<br />';
      }
      return line; 
    })
    .join('')
    .replace(/<br \/>\s*(<h[2-4]>|<[ou]l>)/g, '$1')
    .replace(/(<\/li>)\s*<br \/>/g, '$1');


  return (
    <div className="bg-[rgba(0,0,0,0.15)] p-6 rounded-lg shadow relative prose prose-sm prose-invert max-w-none 
                    prose-p:text-slate-300 prose-li:text-slate-300 
                    prose-headings:text-[var(--hnai-primary-color)] prose-strong:text-slate-100">
      <div className="absolute top-3 right-3 flex space-x-2">
        <button
          onClick={handleDownload}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-[var(--hnai-primary-color)] transition-colors"
          aria-label="Download report"
          title="Download Report"
        >
          <DownloadIcon className="w-5 h-5" />
        </button>
        <button
          onClick={handleCopy}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-[var(--hnai-primary-color)] transition-colors"
          aria-label="Copy report to clipboard"
          title="Copy Report"
        >
          {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
        </button>
      </div>
      <div 
        className="text-sm text-slate-300 break-words max-h-[60vh] overflow-y-auto pr-2 report-content"
        dangerouslySetInnerHTML={{ __html: formattedReport || "<p>No analysis data available.</p>" }}
      />
    </div>
  );
};
