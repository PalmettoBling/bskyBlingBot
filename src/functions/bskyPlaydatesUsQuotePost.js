const { app } = require('@azure/functions');
const { BskyAgent } = require('@atproto/api');   
const CosmosClient = require('@azure/cosmos').CosmosClient;

app.timer('bskyPlaydatesUsQuotePost', {
    schedule: '0 0 */4 * * *',
    handler: async (myTimer, context) => {
            // Connecting to DB client
            context.info("Connecting to Cosmos DB...")
            const client = await new CosmosClient(process.env.CosmosDbConnectionSetting);
            const database = await client.database('playdatesBot');
            const container = await database.container('xboxplaydatesus');

            const agent = new BskyAgent({
                service: `https://bsky.social`
            });
            await agent.login({
                identifier: process.env.BskyIdentifier,
                password: process.env.BskyPassword
            });

            // Generating Random Number between 0 and total number of records
            const querySpec = {
                query: "SELECT VALUE COUNT(1) FROM c"
            };
            const { resources: quoteCount } = await container.items.query(querySpec).fetchAll();
            context.info("Quote count: " + quoteCount[0])

            const quoteId = await Math.floor(Math.random() * (quoteCount[0] - 1));
            context.info("Generated quote ID: " + quoteId);

            // Getting quote from DB
            context.info("Reading quote from Cosmos DB...");          
            const quoteQuerySpec = {
                query: `SELECT * FROM c WHERE c.id = '${quoteId}'`
            };
            const { resources } = await container.items.query(quoteQuerySpec).fetchAll();
            context.log("Resources: " + JSON.stringify(resources));                                                                                                                                                                                                                                                                                                                                                                                                     
            const quoteItem = resources[0];         
            context.info("Quote Item: " + JSON.stringify(quoteItem));

            //formatting the quote to be returned
            const quoteReturn = `#${quoteItem.id}: ${quoteItem.quote} - ${quoteItem.attribution} (${quoteItem.dateOfQuote})`
            context.info("Quote Return: " + quoteReturn);

            // Posting quote to Bsky
            agent.post({
                text: quoteReturn
            });
    }
});
