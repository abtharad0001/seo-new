import mongoose from 'mongoose';

const seoContentSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  keyword: {
    type: String,
    required: true,
    trim: true,
  },
  urls: {
    type: String,
    required: false,
    trim: true,
  },
  generatedContent: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SEOContent = mongoose.model('SEOContent', seoContentSchema);

export default SEOContent; 