import React, { useState, useRef } from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { X, Bookmark, Edit2, Image as ImageIcon, Upload, Loader2, Save } from 'lucide-react';

import { toast } from 'sonner';

export const RoomDetailsModal = () => {
  const { rooms, selectedIds, mode, updateRoom, setSelection, setUnsavedChanges } = useBuilderStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const selectedRoom = selectedIds.length === 1 
    ? rooms.find(r => r.id === selectedIds[0]) 
    : null;

  // Local state for editing to allow cancellation or 'save all'
  const [editName, setEditName] = useState(selectedRoom?.name || '');
  const [editNotes, setEditNotes] = useState(selectedRoom?.notes || '');
  const [editDirections, setEditDirections] = useState(selectedRoom?.directions || '');
  const [editImageUrl, setEditImageUrl] = useState(selectedRoom?.images?.[0] || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when selected room changes
  React.useEffect(() => {
    if (selectedRoom) {
      setEditName(selectedRoom.name || '');
      setEditNotes(selectedRoom.notes || '');
      setEditDirections(selectedRoom.directions || '');
      setEditImageUrl(selectedRoom.images?.[0] || '');
      setIsEditing(false); // Default to view mode when opening
    }
  }, [selectedRoom?.id]);

  if (mode !== 'room_details' || !selectedRoom || selectedRoom.type === 'layout') {
    return null;
  }

  const handleClose = () => {
    setSelection([]); // Deselect room
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary configuration is missing in .env');
      return;
    }

    try {
      setUploadProgress(0);

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      xhr.open('POST', url, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setEditImageUrl(response.secure_url);
          setUploadProgress(null);
          toast.success('Image uploaded successfully!');
        } else {
          console.error("Cloudinary upload error:", xhr.responseText);
          toast.error('Failed to upload image.');
          setUploadProgress(null);
        }
      };

      xhr.onerror = () => {
        console.error("Cloudinary upload network error");
        toast.error('Failed to upload image due to network error.');
        setUploadProgress(null);
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Upload setup error:", error);
      toast.error('Failed to initiate upload.');
      setUploadProgress(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSave = () => {
    updateRoom(selectedRoom.id, {
      name: editName,
      notes: editNotes,
      directions: editDirections,
      images: editImageUrl ? [editImageUrl] : []
    });
    setUnsavedChanges(true);
    setIsEditing(false);
    toast.success('Room details saved!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans select-none">
      <div className="bg-[#121212] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Image Preview */}
        <div className="w-full md:w-1/2 bg-black flex flex-col relative min-h-[300px]">
          {isEditing ? (
            <div 
              className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-700 m-4 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-zinc-900/50 transition-all relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden" 
              />
              
              {uploadProgress !== null ? (
                <div className="flex flex-col items-center z-10 text-white">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                  <span className="text-sm font-medium">Uploading... {Math.round(uploadProgress)}%</span>
                </div>
              ) : editImageUrl ? (
                <>
                  <img src={editImageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  <div className="z-10 flex flex-col items-center bg-black/60 p-4 rounded-xl backdrop-blur-sm">
                    <ImageIcon className="w-8 h-8 text-white mb-2" />
                    <span className="text-sm font-medium text-white">Click or drop image to change</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-zinc-400">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium uppercase tracking-wider text-center">Click or Drop Image<br/><span className="text-xs normal-case text-zinc-500 mt-1 inline-block">Supports camera capture on mobile</span></span>
                </div>
              )}
            </div>
          ) : (
            <>
              {selectedRoom.images?.[0] ? (
                <img src={selectedRoom.images[0]} alt={selectedRoom.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/50">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm font-medium tracking-wide">NO IMAGE</span>
                </div>
              )}
              {/* Expand Image Button (Cosmetic) */}
              {selectedRoom.images?.[0] && (
                <button className="absolute bottom-4 left-4 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                  Expand Image
                </button>
              )}
            </>
          )}
        </div>

        {/* Right Side: Details / Edit Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col relative overflow-y-auto">
          {/* Top Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
            <button 
              onClick={handleClose}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!isEditing ? (
            // VIEW MODE
            <div className="flex-1 mt-6">
              <h2 className="text-3xl font-bold text-white mb-1 uppercase tracking-tight">{selectedRoom.name || 'Unnamed Room'}</h2>
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-blue-500 mb-8 uppercase">
                {selectedRoom.type} <span className="text-zinc-600">•</span> <span className="text-zinc-500">{selectedRoom.name}</span>
              </div>
              
              <div className="mb-8">
                <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Description</h3>
                <p className="text-zinc-300 text-sm font-medium">{selectedRoom.notes || 'No description provided.'}</p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Room Details</h3>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-blue-500/20"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit Details
                  </button>
                </div>
                
                <div className="text-sm font-medium text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {selectedRoom.directions || 'No navigation directions specified.'}
                </div>
              </div>
            </div>
          ) : (
            // EDIT MODE
            <div className="flex-1 mt-2">
              <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2">Description</h3>
              <textarea 
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="w-full bg-black border border-zinc-800 text-white text-lg rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 font-medium transition-all resize-none mb-6"
                placeholder="e.g. Lecture Hall"
              />
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Room Details</span>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-1 text-zinc-500 hover:text-white bg-zinc-800 rounded-md transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-blue-900/20"
                  >
                    <Save className="w-4 h-4" />
                    Save All
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Room Name Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Room Name</label>
                    <input 
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-black border border-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 font-medium transition-all"
                      placeholder="e.g. LH-503"
                    />
                  </div>

                  {/* Image Clear (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Room Image</label>
                      {editImageUrl && (
                        <button 
                          onClick={() => setEditImageUrl('')}
                          className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Clear Image
                        </button>
                      )}
                    </div>
                    {/* The dropzone is on the left pane, so maybe just a notice here */}
                    <p className="text-xs text-zinc-500">Upload or drag an image onto the left panel to set the room photo.</p>
                  </div>

                  {/* Navigation Path Textarea */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Navigation Path</label>
                    <textarea 
                      value={editDirections}
                      onChange={(e) => setEditDirections(e.target.value)}
                      rows={6}
                      className="w-full bg-black border border-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 font-medium transition-all resize-none font-mono"
                      placeholder="I. Stairs-1: Turn right and then turn right again..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
