import { Injectable } from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

const GEMINI_MODEL = 'gemini-1.5-flash';

@Injectable()
export class GeminiService {
    private readonly googleAI: GoogleGenerativeAI;
    private readonly model: GenerativeModel;
    constructor(configService: ConfigService){
        const geminiApiKey = configService.get("API_KEY");
        this.googleAI = new GoogleGenerativeAI(geminiApiKey)
        this.model = this.googleAI.getGenerativeModel({model : GEMINI_MODEL})
    }

    async checkUnderThousand(value: number): Promise<boolean> {
        const prompt = `Is the number ${value} less than 1000? Answer only APPROVED or REJECTED.`;
      
        const result = await this.model.generateContent(prompt);
        const response = await result.response.text();
      
        return response.trim().toUpperCase() === 'REJECTED';
      }
      
}

