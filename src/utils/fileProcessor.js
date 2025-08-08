import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const processFile = async (file) => {
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
    throw error;
  }
};

const processPDF = async (file) => {
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
};

const processWord = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  return {
    type: 'document',
    content: result.value,
    fileName: file.name,
    size: file.size
  };
};

const processText = async (file) => {
  const text = await file.text();
  
  return {
    type: 'text',
    content: text,
    fileName: file.name,
    size: file.size
  };
};

const processCode = async (file) => {
  const text = await file.text();
  const extension = file.name.split('.').pop().toLowerCase();
  
  return {
    type: 'code',
    language: extension,
    content: text,
    fileName: file.name,
    size: file.size
  };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};