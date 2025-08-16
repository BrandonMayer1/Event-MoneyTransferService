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
    "value": 1000
    
}
in Json form