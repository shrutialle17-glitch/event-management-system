import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../api/axiosInstance';
import Button from '../common/Button';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import toast from 'react-hot-toast';

const GalleryUploader = ({ eventId, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState('photo');
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    
    // Auto-detect type
    if (selectedFile.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setMediaType('photo');
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    reset();
  };

  const onSubmit = async (data) => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('media', file);
    formData.append('eventId', eventId);
    formData.append('mediaType', mediaType);
    if (data.caption) formData.append('caption', data.caption);

    setIsUploading(true);
    try {
      const res = await axiosInstance.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Media uploaded successfully!');
      clearSelection();
      if (onUploadComplete) onUploadComplete(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-text mb-4">Share to Event Gallery</h3>
      
      {!file ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-text font-medium mb-1">Click or drag file to upload</p>
          <p className="text-xs text-textMuted">Images or Videos (Max 10MB)</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 max-h-64 flex items-center justify-center">
            {mediaType === 'photo' ? (
              <img src={preview} alt="Preview" className="max-h-64 object-contain" />
            ) : (
              <video src={preview} className="max-h-64" controls />
            )}
            <button 
              type="button"
              onClick={clearSelection}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs font-medium flex items-center gap-1">
              {mediaType === 'photo' ? <ImageIcon className="w-3 h-3"/> : <Video className="w-3 h-3"/>}
              {mediaType.toUpperCase()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Caption (Optional)</label>
            <input
              type="text"
              {...register('caption')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Add a nice caption..."
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isUploading}>Upload Media</Button>
        </form>
      )}
    </div>
  );
};

export default GalleryUploader;
