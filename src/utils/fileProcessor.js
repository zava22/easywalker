import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const processFile = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }
  
  const fileType = file.type;
  const fileName = file.name;
  const fileExtension = fileName.split('.').pop().toLowerCase();

  try {
    switch (fileExtension) {
      case 'pdf':
        return await processPDF(file);
      case 'doc':
      case 'docx':
        return await processWord(file);
      case 'txt':
        return await processText(file);
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
      case 'css':
      case 'html':
      case 'json':
      case 'xml':
      case 'sql':
        return await processCode(file);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};

const processPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      text += pageText + '\n';
    }
    
    return {
      type: 'pdf',
      content: text,
      fileName: file.name,
      size: file.size
    };
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
};

const processWord = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return {
      type: 'document',
      content: result.value,
      fileName: file.name,
      size: file.size
    };
  } catch (error) {
    throw new Error(`Failed to process Word document: ${error.message}`);
  }
};

const processText = async (file) => {
  try {
    const text = await file.text();
    
    return {
      type: 'text',
      content: text,
      fileName: file.name,
      size: file.size
    };
  } catch (error) {
    throw new Error(`Failed to process text file: ${error.message}`);
  }
};

const processCode = async (file) => {
  try {
    const text = await file.text();
    const extension = file.name.split('.').pop().toLowerCase();
    
    return {
      type: 'code',
      language: extension,
      content: text,
      fileName: file.name,
      size: file.size
    };
  } catch (error) {
    throw new Error(`Failed to process code file: ${error.message}`);
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};