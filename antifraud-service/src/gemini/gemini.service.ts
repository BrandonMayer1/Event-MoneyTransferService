import { Injectable } from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { VectorDBService } from '../qdrant/vector-db.service';

const GEMINI_MODEL = 'gemini-1.5-flash';
const EMBEDDING_MODEL = "embedding-001";

@Injectable()
export class GeminiService {
    private readonly googleAI: GoogleGenerativeAI;
    private readonly model: GenerativeModel;

    
    constructor(
        configService: ConfigService,
        private readonly vectorDBService: VectorDBService
    ){
        const geminiApiKey = configService.get("API_KEY");
        this.googleAI = new GoogleGenerativeAI(geminiApiKey)
        this.model = this.googleAI.getGenerativeModel({model : GEMINI_MODEL})
    }

    async antiFraudChecker(currentTrans: string): Promise<boolean> {
        console.log("Current Transaction: " + currentTrans)
        
        const embeddingModel = this.googleAI.getGenerativeModel({model: EMBEDDING_MODEL});
        const embeddingResult = await embeddingModel.embedContent(currentTrans);
        const queryVector = embeddingResult.embedding.values as number[];
        
        const similarPoints = await this.vectorDBService.search(queryVector, 5);
        const similarFormatted = similarPoints
        .map((point, idx) => {
          const p = point.payload as Record<string, any>;
          if (p  == null) return `${idx + 1}. No payload data`;
          return `${idx + 1}. User ${p.user_id || 'unknown'}, Amount: $${((p.value as number || 0)).toFixed(2)}, Status: ${p.status || 'unknown'}, Details: ${p.original || 'N/A'}`;
        })
        .join('\n');
        console.log("Retried for comparison: " + similarFormatted + "\n")

        const prompt = `
        You are an antifraud checker AI.
        
        Your job is to determine whether a transaction is suspicious based on a user's past transaction behavior.
        
        Current transaction:
        ${currentTrans}
        
        Guidelines:
        1. If the user has multiple pending transactions, REJECT the transaction.
        2. If the current value is more than 10x greater than the largest previously APPROVED transaction, REJECT it.
        3. If the user has only 1-2 past transactions AND the value is over 500, consider REJECTING due to lack of data.
        4. If the current transaction value is low (≤ 100), and there's no clear fraud pattern, ACCEPT.
        5. Do **not** reject transactions solely for "insufficient data" unless the value is unusually high.
        
        **Respond with one line in this format only:**
        
        REJECTED [Score: <0-100> | Reason]  
        or  
        ACCEPTED [Score: <0-100> | Reason]
        
        Examples:  
        REJECTED [Score: 90 | User has 3 pending transactions]  
        ACCEPTED [Score: 5 | Small transaction with no suspicious history]
        
        Here is the user's transaction history:
        ${similarFormatted}
        `;
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response.text();
      
        const responseText = response.trim();  
        const status = responseText.split(' ')[0].toUpperCase();
        const reasonMatch = responseText.match(/\[(.*)\]/);        
        const reason = reasonMatch ? reasonMatch[1] : 'No reason provided';
        console.log(`Reason from AI: [${reason}]`);
        
        return status == "REJECTED"; 
    }

    async addTransactionToVectorDB(transactionText: string, metadata: Record<string, any>){
        const embeddingModel = this.googleAI.getGenerativeModel({model: EMBEDDING_MODEL});
        const embeddingResult = await embeddingModel.embedContent(transactionText);
        const vector = embeddingResult.embedding.values as number[];
        await this.vectorDBService.upsertVector(vector, metadata);
    }
      
}

