interface EncryptedMessage {
    role: string;
    content: {
        '%allot': string;
    };
    timestamp: string;
}

// Nillion-compatible conversation format
interface EncryptedConversation {
    user_id: string;
    created_at: string;
    updated_at: string;
    conversation_metadata: {
        '%allot': {
            title: string;
            summary: string;
        }
    };
    messages: EncryptedMessage[];
}

export {
    EncryptedMessage, EncryptedConversation
}