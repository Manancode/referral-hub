import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateWithGPT(prompt, maxTokens = 150) {
  try {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",  // Updated to a more recent model
      prompt: prompt,
      max_tokens: maxTokens,
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    return response.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating content with GPT:', error);
    throw error;
  }
}