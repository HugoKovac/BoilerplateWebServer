import { generateRandomString, isWithinExpiration } from "lucia/utils";
import { db } from '$lib/server/prisma'


const EXPIRES_IN = 3600000; // 1 hour in milliseconds, adjust as needed

export const generateEmailVerificationToken = async (userId) => {
  // Retrieve all stored tokens for the user
  const storedUserTokens = await db.emailVerificationToken.findMany({
    where: { user_id: userId },
  });

  // Check for reusable token
  const reusableStoredToken = storedUserTokens.find(token => 
    isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2)
  );

  if (reusableStoredToken) {
    return reusableStoredToken.id;
  }

  // Generate a new token and save it to the database
  const token = generateRandomString(63);
  await db.emailVerificationToken.create({
    data: {
      id: token,
      expires: new Date().getTime() + EXPIRES_IN,
      user_id: userId
    },
  });

  return token;
};



export const validateEmailVerificationToken = async (token) => {
    // Start a transaction
    const storedToken = await db.$transaction(async (trx) => {
        // Find the token
        const storedToken = await trx.emailVerificationToken.findUnique({
            where: { id: token },
        });
        if (!storedToken) throw new Error("Invalid token");

        // Delete all tokens for the user
        await trx.emailVerificationToken.deleteMany({
            where: { user_id: storedToken.user_id },
        });

        return storedToken;
    });

    // Check if the token is expired
    const tokenExpires = Number(storedToken.expires); // bigint => number conversion
    if (!isWithinExpiration(tokenExpires, EXPIRES_IN)) {
        throw new Error("Expired token");
    }
    return storedToken.user_id;
};
