
import { redisService } from 'ondc-automation-cache-lib';
import { SessionData } from '../interfaces/sessionData';
// import redisClient from '../config/redisConfig';


const SESSION_EXPIRY = 3600; // 1 hour

export const createSessionService = async (sessionId: string, data: SessionData) => {
    const { subscriberId, participantType, domain } = data;

    const sessionData: SessionData = {
        sessionId,
        subscriberId,
        participantType,
        domain,
        createdAt: new Date().toISOString(),
        transactions: {}, // Empty transactions initially
    };
    try {
        // Store session data in Redis
        await redisService.setKey(sessionId, JSON.stringify(sessionData), SESSION_EXPIRY);
        // await redisClient.set(sessionId, JSON.stringify(sessionData), 'EX', 3600);
        return 'Session created successfully';

    } catch (error: any) {
        throw new Error(`${error.message}`)
    }
};

export const getSessionService = async (sessionId: string) => {

    try {
        // Fetch session data from Redis
        // const sessionData = await redisClient.get(sessionId);
        const sessionData = await redisService.getKey(sessionId);
        if (!sessionData) {
            throw new Error('Session not found');
        }

        // Return the session data if found
        return JSON.parse(sessionData);

    } catch (error: any) {
        // Return a 500 error in case of any issues
        throw new Error(`${error.message}`)
    }

};

// Update session data
export const updateSessionService = async (sessionId: string, data: any) => {
    const { subscriberId, participantType, domain, transactionId, transactionMode, state, details } = data;


    try {
        // Retrieve the session data from Redis
        const sessionData = await redisService.getKey(sessionId);

        if (!sessionData) {
            throw new Error('Session not found');
        }

        const session: SessionData = JSON.parse(sessionData);

        // Update session data fields
        if (subscriberId) session.subscriberId = subscriberId;
        if (participantType) session.participantType = participantType;
        if (domain) session.domain = domain;

        // Ensure transactions object exists
        if (!session.transactions) {
            session.transactions = {};
        }

        // If transaction data is provided, update or add the transaction
        if (transactionId) {
            if (!session.transactions[transactionId]) {
                // Add new transaction
                console.log("new transaction");

                session.transactions[transactionId] = {
                    transactionMode,
                    state,
                    data: details || {},
                    createdAt: new Date().toISOString(),
                };
            } else {
                // Update existing transaction
                session.transactions[transactionId] = {
                    ...session.transactions[transactionId], // Preserve existing details
                    transactionMode,
                    state,
                    data: details || {},
                };
            }
        }

        // Log the updated session
        console.log('Updated session:', session);

        // Save the updated session data back to Redis
        await redisService.setKey(sessionId, JSON.stringify(session), SESSION_EXPIRY);

        return 'Session updated successfully';

    } catch (error: any) {
        throw new Error(`${error.message}`);
    }
};
