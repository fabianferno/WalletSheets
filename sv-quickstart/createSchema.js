import { SecretVaultWrapper } from 'secretvaults';
import { orgConfig } from './orgConfig.js';
import schema from './schemas/tradesSchema.json' with { type: 'json' };

async function main() {
    try {

        const org = new SecretVaultWrapper(
            orgConfig.nodes,
            orgConfig.orgCredentials
        );
        await org.init();

        // create a new collectionschema
        const newSchema = await org.createSchema(schema, 'User Trades Test 1');
        console.log('📚 New Schema:', newSchema);
    } catch (error) {
        console.error('❌ Failed to use SecretVaultWrapper:', error.message);
        process.exit(1);
    }
}

main();