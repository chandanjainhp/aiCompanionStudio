// src/config/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './env.js';

const genAI = new GoogleGenerativeAI(config.googleApiKey);

export const getGenAIClient = () => genAI;

export const getModel = (modelName = 'gemini-pro') => {
  return genAI.getGenerativeModel({ model: modelName });
};
