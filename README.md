# Event Money Transfer Service

A practice app demonstrating Kafka Event-Driven Architecture with two services: **Transaction Service** and **AntiFraud Service**.

## Architecture Overview

- **Transaction Service**:  
  Receives transactions, stores them in Supabase as pending, and sends events to Kafka.

- **AntiFraud Service**:  
  Listens for transaction events from Kafka, uses an LLM to determine fraud, and responds via Kafka.

- **Result**:  
  The transaction status in Supabase is updated to either approved or rejected based on the AntiFraud response.

## Prerequisites

- Docker Desktop (for running services)
- Google Gemini Api Keys
- Supabase account and credentials
- Node.js and npm
- Create .env in both services w/ 
DATABASE_URL= (Supabase Url)
API_KEY = (Google console API key w/ Gemini Enabled)

## Setup & Run Instructions

1. **Start Required Services:**
docker compose build
docker compose up 
docker compose ps

2. **Test the API:**
   - Use Postman (or similar) to send a POST request to the Transaction Service:
     ```
     POST http://127.0.0.1:3000/transactions
     Content-Type: application/json
     ```
     Example JSON body:
     ```json
     {
       "accountexternaldebit": "123e4567-e89b-12d3-a456-426614174000",
       "accountexternalcredit": "987fcdeb-51d3-12a4-b456-426614174000",
       "transfertypeid": 1,
       "value": 100000,
       "user_id": "Test"
     }
     ```

