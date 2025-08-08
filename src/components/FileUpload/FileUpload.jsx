import React, { useState, useRef } from 'react';
import { Upload, File, Code, FileText, X, AlertCircle } from 'lucide-react';
import { processFile, formatFileSize } from '../../utils/fileProcessor';
import './FileUpload.css';

const FileUpload = ({ onFileProcessed, attachedFiles, setAttachedFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const supportedTypes = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'text/plain': 'TXT',
    'text/javascript': 'JS',
    'text/typescript': 'TS',
    'text/css': 'CSS',
    'text/html': 'HTML',
    'application/json': 'JSON'
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  };

  const processFiles = async (files) => {
    setIsProcessing(true);
    
    for (const file of files) {
      try {
        const processedFile = await processFile(file);
        setAttachedFiles(prev => [...prev, processedFile]);
        onFileProcessed(processedFile);
      } catch (error) {
        console.error('Error processing file:', error);
        alert(`Error processing ${file.name}: ${error.message}`);
      }
    }
    
    setIsProcessing(false);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'code':
        return <Code size={16} />;
      case 'pdf':
      case 'document':
        return <FileText size={16} />;
      default:
        return <File size={16} />;
    }
  };

  return (
    <div className="file-upload-container">
      {attachedFiles.length > 0 && (
        <div className="attached-files">
          {attachedFiles.map((file, index) => (
            <div key={index} className="attached-file">
              <div className="file-info">
                <div className="file-icon">
                  {getFileIcon(file.type)}
                </div>
                <div className="file-details">
                  <span className="file-name">{file.fileName}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
              </div>
              <button
                className="remove-file"
                onClick={() => removeFile(index)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`file-drop-zone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.css,.html,.json,.xml,.sql"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div className="drop-zone-content">
          {isProcessing ? (
            <>
              <div className="processing-spinner" />
              <p>Processing files...</p>
            </>
          ) : (
            <>
              <Upload size={24} />
              <p>Drop files here or click to upload</p>
              <span className="supported-formats">
                PDF, DOC, TXT, Code files
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;