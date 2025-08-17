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
- Redpanda Service (Via Docker)
- Qdrant service (via Docker)
- Supabase account and credentials
- Node.js and npm

## Setup & Run Instructions

1. **Start Required Services:**
   - Open Docker Desktop and start the Transaction Service container.
   - Start the Qdrant service container.

2. **Install Dependencies:**
   - Open two terminal windows:
     - One for the AntiFraud Service
     - One for the Transaction Service
   - In each service directory, run:
     ```bash
     npm install
     ```

3. **Run Both Services:**
   - In each terminal, start the service:
     ```bash
     npm start
     ```

4. **Test the API:**
   - Use Postman (or similar) to send a POST request to the Transaction Service:
     ```
     POST http://localhost:3000/transactions
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

