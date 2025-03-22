import dotenv from 'dotenv';
dotenv.config();

export const orgConfig = {
    orgCredentials: {
        secretKey: 'fcd2da552d0e448ef51dcb791480aff76598f7f7d06e8c7b9adb193b9e73e275',
        orgDid: 'did:nil:testnet:nillion1wdf5pfl4pf007rlp8fu7dctx0ry7fwmmre5l90',
    },
    nodes: [
        {
            url: 'https://nildb-nx8v.nillion.network',
            did: 'did:nil:testnet:nillion1qfrl8nje3nvwh6cryj63mz2y6gsdptvn07nx8v',
        },
        {
            url: 'https://nildb-p3mx.nillion.network',
            did: 'did:nil:testnet:nillion1uak7fgsp69kzfhdd6lfqv69fnzh3lprg2mp3mx',
        },
        {
            url: 'https://nildb-rugk.nillion.network',
            did: 'did:nil:testnet:nillion1kfremrp2mryxrynx66etjl8s7wazxc3rssrugk',
        },
    ],
};


export const conversationsSchemaId = '754b9460-d81a-4fa3-89d6-be2193f64072'
export const usersSchemaId = ""