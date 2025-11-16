import { Client, Account, Databases, Functions, ExecutionMethod, AppwriteException } from 'react-native-appwrite'
import 'react-native-url-polyfill/auto' // Required for React Native

const client = new Client()

client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '68d158780003f084d817')
  .setPlatform('com.synaspe.app') // iOS bundle ID from app.json - enables console connection detection

export const account = new Account(client)
export const databases = new Databases(client)
export const functions = new Functions(client)

/**
 * Check if user has an active session
 */
export const checkSession = async () => {
  try {
    const session = await account.get();
    return session;
  } catch (error) {
    console.error('No active session:', error);
    return null;
  }
}

/**
 * Helper function to handle Appwrite database operations with better error handling
 */
export const safeDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Database operation failed'
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    // Check if session exists before database operation
    const session = await checkSession();
    if (!session) {
      return {
        success: false,
        error: 'No active session. Please log in again.',
      };
    }

    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AppwriteException) {
      // Handle specific Appwrite errors
      if (error.code === 401) {
        return {
          success: false,
          error: 'Session expired. Please log in again.',
        };
      } else if (error.code === 404) {
        return {
          success: false,
          error: 'Resource not found.',
        };
      } else if (error.code === 403) {
        return {
          success: false,
          error: 'Permission denied. You do not have access to this resource.',
        };
      }
      return {
        success: false,
        error: error.message || errorMessage,
      };
    }
    return {
      success: false,
      error: (error as Error).message || errorMessage,
    };
  }
}

/**
 * Helper function to execute Appwrite functions with error handling and retries
 */
export const executeFunction = async (
  functionId: string,
  data: any = {},
  options: { timeout?: number; retries?: number } = {}
) => {
  const { timeout = 30000, retries = 1 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const execution = await functions.createExecution(
        functionId,
        JSON.stringify(data),
        false,
        '/',
        ExecutionMethod.POST
      );

      const result = JSON.parse(execution.responseBody);
      
      if (!result.success) {
        throw new Error(result.error || 'Function execution failed');
      }

      return result.data;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
};

export default client
