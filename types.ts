
export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
}

export interface AnalysisResult {
  report: string;
  // In a more advanced version, this could include structured data
  // e.g., boundingBoxes: Array<{ x: number, y: number, width: number, height: number, label: string }>
}

export interface AppError {
  message: string;
  details?: string;
}

// Gemini API related types (simplified for this context)
export interface GeminiImagePart {
  inlineData: {
    mimeType: string;
    data: string; // base64 encoded string
  };
}

export interface GeminiTextPart {
  text: string;
}

export interface GeminiContent {
  parts: (GeminiImagePart | GeminiTextPart)[];
  role?: string;
}
