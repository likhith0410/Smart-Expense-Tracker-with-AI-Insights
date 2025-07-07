// frontend/src/components/ReceiptScanner.jsx
import React, { useState } from 'react';
import { Camera, Upload, X, Loader } from 'lucide-react';
import { expenseService } from '../services/api';
import toast from 'react-hot-toast';

const ReceiptScanner = ({ onScanResult, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setScanning(true);
    const formData = new FormData();
    formData.append('receipt_image', file);

    try {
      const result = await expenseService.scanReceipt(formData);
      toast.success('Receipt scanned successfully! 📄✨');
      onScanResult(result);
    } catch (error) {
      console.error('Error scanning receipt:', error);
      toast.error('Failed to scan receipt. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="receipt-scanner-modal">
      <div className="modal-overlay" onClick={onClose}>
        <div className="scanner-content glass-card" onClick={(e) => e.stopPropagation()}>
          <div className="scanner-header">
            <h3>Scan Receipt</h3>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div
            className={`drop-zone ${dragActive ? 'active' : ''} ${scanning ? 'scanning' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {scanning ? (
              <div className="scanning-state">
                <Loader size={48} className="spin" />
                <h4>Scanning Receipt...</h4>
                <p>AI is extracting expense data from your receipt</p>
              </div>
            ) : (
              <div className="upload-state">
                <Camera size={48} />
                <h4>Upload Receipt Image</h4>
                <p>Drag and drop your receipt image here, or click to browse</p>
                
                <div className="upload-actions">
                  <label htmlFor="receipt-file" className="btn btn-primary">
                    <Upload size={18} />
                    Choose File
                  </label>
                  <input
                    id="receipt-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="supported-formats">
                  <small>Supported formats: JPG, PNG, WEBP</small>
                </div>
              </div>
            )}
          </div>

          <div className="scanner-tips">
            <h4>📱 Tips for better scanning:</h4>
            <ul>
              <li>Ensure good lighting and clear image quality</li>
              <li>Keep the receipt flat and fully visible</li>
              <li>Avoid shadows and glare on the receipt</li>
              <li>Make sure text is readable and not blurry</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;