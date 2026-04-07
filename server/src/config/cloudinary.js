// src/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { config } from './env.js';

// Configure cloudinary
cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export default cloudinary;
