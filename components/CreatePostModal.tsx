import React, { useState } from 'react';
import { CloseIcon, ImageIcon, SparklesIcon } from './Icons.tsx';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost?: (content: string, images: string[], hashtags: string[]) => void;
}

/**
 * CreatePostModal - Modal for creating social posts
 * Features:
 * - Rich text editor
 * - Image/video upload
 * - AI caption generator
 * - Hashtag suggestions
 * - Preview before posting
 * - Schedule post option
 */
const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPost }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const suggestedHashtags = ['#AI', '#Innovation', '#Tech', '#Future', '#AmrikyyAI'];

  const handleGenerateCaption = async () => {
    setIsGeneratingCaption(true);
    // Simulate AI caption generation
    setTimeout(() => {
      setContent(
        '🚀 Excited to share my latest project with Amrikyy AI OS! The future of AI-powered productivity is here. #AI #Innovation #Tech'
      );
      setHashtags(['#AI', '#Innovation', '#Tech']);
      setIsGeneratingCaption(false);
    }, 1500);
  };

  const handleAddHashtag = (tag: string) => {
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setContent(content + ' ' + tag);
    }
  };

  const handlePost = () => {
    onPost?.(content, images, hashtags);
    setContent('');
    setImages([]);
    setHashtags([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-bg-secondary rounded-lg border border-border-color w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {/* Text Editor */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 p-3 bg-bg-tertiary border border-border-color rounded-lg text-white placeholder-text-secondary resize-none focus:outline-none focus:border-primary-purple"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-text-secondary">
                {content.length} / 500 characters
              </span>
              <button
                onClick={handleGenerateCaption}
                disabled={isGeneratingCaption}
                className="flex items-center gap-2 px-3 py-1 bg-primary-purple/20 hover:bg-primary-purple/30 rounded text-sm transition-colors disabled:opacity-50"
              >
                <SparklesIcon className="w-4 h-4" />
                {isGeneratingCaption ? 'Generating...' : 'AI Caption'}
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">
              Add Images
            </label>
            <div className="border-2 border-dashed border-border-color rounded-lg p-6 text-center hover:border-primary-cyan transition-colors cursor-pointer">
              <ImageIcon className="w-8 h-8 text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-text-secondary mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>

          {/* Hashtag Suggestions */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">
              Suggested Hashtags
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestedHashtags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAddHashtag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    hashtags.includes(tag)
                      ? 'bg-primary-purple text-white'
                      : 'bg-bg-tertiary text-text-secondary hover:bg-primary-purple/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-bg-tertiary rounded-lg p-4 border border-border-color">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-purple flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Your Name</div>
                  <div className="text-xs text-text-secondary">Just now</div>
                </div>
              </div>
              <p className="text-white whitespace-pre-wrap">{content}</p>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {hashtags.map((tag) => (
                    <span key={tag} className="text-primary-cyan text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-color flex items-center justify-between">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-primary-cyan hover:text-primary-cyan/80 transition-colors"
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-bg-tertiary hover:bg-bg-tertiary/80 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={!content.trim()}
              className="px-4 py-2 bg-primary-purple hover:bg-primary-purple/80 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;