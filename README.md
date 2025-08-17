DESC: 
Practice App with Kafka Event Driven Architecture. Two apps Transaction service & AntiFraud.

Transaction is sent to transaction service and stored in Supabase where the transaction is set as pending, Then sent to kafka where antifraud reacts to it and uses a llm to determine if it is fraud. Sends back to transaction service using kafka. Then transaction in supabase is then set as rejected or approved.

RUN INSTRUCTIONS 
Open Desktop Docker Run Transaction service
Open qdrant service on Desktop Docker

Open two consoles run on anti-fraud and transaction service
npm install
npm run on both
then Postman to 
POST http://localhost:3000/transactions
{
  "accountexternaldebit": "123e4567-e89b-12d3-a456-426614174000",
  "accountexternalcredit": "987fcdeb-51d3-12a4-b456-426614174000",
  "transfertypeid": 1,
  "value": 100000,
  "user_id": "Test"
}
in Json form
