const { app } = require('@azure/functions');
const { BskyAgent } = require('@atproto/api');   
const CosmosClient = require('@azure/cosmos').CosmosClient;

app.timer('bskyPlaydatesUsQuotePost', {
    schedule: '0 0 */4 * * *',
    handler: (myTimer, context) => {
            // Connecting to DB client
            context.info("Connecting to Cosmos DB...")
            const client = await new CosmosClient(process.env.CosmosDbConnectionSetting);
            const database = await client.database('playdatesBot');
            const container = await database.container('xboxplaydatesus');
    }
});
