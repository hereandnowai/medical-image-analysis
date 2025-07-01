
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { GeminiImagePart, GeminiTextPart, GeminiContent } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-flash-preview-04-17';

const PROMPT_TEXT = `
Analyze the provided medical image meticulously. Your response must be comprehensive, structured, and strictly adhere to the following sections. Use Markdown for formatting headings, lists, and bold text.

# Medical Image Analysis Report

## 1. Image Modality Estimation
*   Attempt to identify the type of medical image (e.g., Chest X-ray (PA/AP/Lateral), CT slice (e.g., Abdominal CT with contrast, Head CT non-contrast), MRI (e.g., T1-weighted brain, T2-weighted knee), Ultrasound (e.g., Abdominal ultrasound), Mammogram, etc.).
*   If uncertain, state "Uncertain."

## 2. Key Observations
*   Detail all significant features, patterns, or anomalies observed.
*   For each finding, describe its characteristics:
    *   **Nature:** (e.g., opacity, consolidation, lesion, fracture, nodule, mass, effusion, stenosis, inflammation, foreign object).
    *   **Size:** (e.g., approximate dimensions in mm or cm if discernible, or relative size like "small," "large," "occupying X% of the structure").
    *   **Shape:** (e.g., round, oval, irregular, linear, spiculated, well-defined, ill-defined).
    *   **Density/Intensity:** (e.g., radiopaque, radiolucent, hyperdense, hypodense, hyperintense, hypointense compared to surrounding tissue).
    *   **Texture:** (e.g., homogeneous, heterogeneous, calcified).
    *   **Margins:** (e.g., smooth, irregular, infiltrative).

## 3. Precise Location of Findings
*   For EACH abnormality identified, provide its specific location using anatomical landmarks and directional terms (e.g., "a 2cm circular opacity in the **superior aspect of the right upper lobe, posterior segment**", "linear fracture through the **distal radius, approximately 1cm proximal to the articular surface**", "hyperdense lesion in the **left parietal lobe, adjacent to the Sylvian fissure, involving grey-white matter junction**").
*   If multiple findings, list each with its precise location. Use bullet points for clarity if there are multiple distinct findings.

## 4. Potential Interpretations & Concerns
*   Based ONLY on the visual observations detailed above, list potential conditions or concerns these findings MIGHT suggest.
*   Clearly state that these are **not definitive diagnoses**.
*   Phrase interpretations cautiously (e.g., "Findings may be consistent with...", "Concerns include...", "Suggests possible...", "Warrants further investigation for...").
*   If applicable, you can briefly mention common differential diagnoses for the observed patterns.

## 5. Summary of Critical Findings
*   Provide a concise bullet-point summary of the most important observations from the analysis.

## 6. Image Quality Assessment (Optional)
*   Briefly comment on image quality if it significantly impacts the analysis (e.g., "Image is clear with good resolution," or "Image quality is suboptimal due to motion artifact, limiting detailed assessment of X area."). If no issues, this section can be omitted.

## 7. Absence of Significant Abnormalities
*   If, after careful review, no significant abnormalities are detected, clearly state: "**No significant abnormalities detected in the provided image.**" In this case, sections 2, 3, 4 and 5 may be very brief or state 'Not applicable'.

**Crucial Instructions:**
*   Be objective and descriptive. Base your analysis strictly on visual evidence in the image.
*   Avoid speculation beyond what is visually evident. Do not provide treatment advice.
*   If the image is not a medical image or is uninterpretable, state that clearly.
*   At the very end of your response, YOU MUST INCLUDE the following disclaimer exactly as written:
    **Important Disclaimer:** This AI analysis is for informational purposes only and is not a substitute for professional medical diagnosis, advice, or treatment by a qualified healthcare provider. Always consult with a medical professional for any health concerns.
`;

export const analyzeImageWithGemini = async (base64Image: string, mimeType: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured. Please set the API_KEY environment variable.");
  }
  
  // Ensure MIME type is one that Gemini likely supports for inline data,
  // defaulting to image/jpeg if it's an unknown or problematic DICOM type for Gemini.
  let effectiveMimeType = mimeType;
  if (mimeType.toLowerCase() === 'application/dicom' || mimeType.toLowerCase() === 'image/dicom' || mimeType.toLowerCase() === 'image/x-dicom') {
    // While we pass application/dicom, Gemini might prefer common image types.
    // This is an area for future improvement (e.g., client-side DICOM to PNG conversion if Gemini struggles).
    // For now, we pass the original DICOM mime type. If issues arise, we might default to 'image/jpeg'
    // and note that the conversion is lossy or simplified.
    // No change for now: pass the original DICOM mime type.
  }


  const imagePart: GeminiImagePart = {
    inlineData: {
      mimeType: effectiveMimeType,
      data: base64Image,
    },
  };

  const textPart: GeminiTextPart = {
    text: PROMPT_TEXT,
  };

  const contents: GeminiContent[] = [{ parts: [imagePart, textPart] }];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: contents,
    });
    
    let analysisText = response.text;
    if (!analysisText || analysisText.trim() === "") {
        throw new Error("Received an empty response from the AI. The image might not be clear or the model could not process it.");
    }

    // Ensure the mandatory disclaimer is present, if not, append it.
    const mandatoryDisclaimer = "Important Disclaimer: This AI analysis is for informational purposes only";
    if (!analysisText.includes(mandatoryDisclaimer)) {
        analysisText += `\n\n**Important Disclaimer:** This AI analysis is for informational purposes only and is not a substitute for professional medical diagnosis, advice, or treatment by a qualified healthcare provider. Always consult with a medical professional for any health concerns.`;
    }

    return analysisText;

  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    if (error.message && (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid'))) {
         throw new Error('The provided Gemini API key is invalid or not authorized for this model. Please check your API_KEY environment variable and ensure it has permissions for the Gemini API and the specified model.');
    }
    if (error.message && error.message.toLowerCase().includes('quota')) {
        throw new Error('You have exceeded your Gemini API quota. Please check your usage and limits.');
    }
     if (error.message && error.message.includes('UnsupportedMimeType')) {
        throw new Error(`The AI model does not support the MIME type of the uploaded image ('${mimeType}'). Try uploading a standard JPG or PNG, or this DICOM file may not be processable by the AI.`);
    }
    if (error.message && error.message.includes('InvalidImageContent')) {
        throw new Error('The AI model could not process the image content. It might be corrupted or an unsupported variation of the format.');
    }
    // For other generic errors
    throw new Error(`Failed to get analysis from AI: ${error.message || 'Unknown error'}`);
  }
};
