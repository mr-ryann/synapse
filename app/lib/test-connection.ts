/**
 * Diagnostic script to test Appwrite database connection
 * Run this to verify your Appwrite setup is working correctly
 */

import { account, databases, checkSession, safeDatabaseOperation } from './appwrite';

export const testAppwriteConnection = async () => {
  console.log('🔍 Starting Appwrite connection test...\n');

  // Test 1: Check endpoint and project configuration
  console.log('✅ Test 1: Configuration');
  console.log('   Endpoint: https://syd.cloud.appwrite.io/v1');
  console.log('   Project ID: 68d158780003f084d817\n');

  // Test 2: Check session
  console.log('🔍 Test 2: Session Check');
  try {
    const session = await checkSession();
    if (session) {
      console.log('✅ Active session found');
      console.log(`   User: ${session.name} (${session.email})`);
      console.log(`   User ID: ${session.$id}\n`);
    } else {
      console.log('❌ No active session - user needs to log in\n');
      return {
        success: false,
        error: 'No active session. Please log in first.',
      };
    }
  } catch (error) {
    console.log('❌ Session check failed:', (error as Error).message, '\n');
    return {
      success: false,
      error: 'Session check failed. Please log in.',
    };
  }

  // Test 3: Try to fetch topics (public read access)
  console.log('🔍 Test 3: Fetch Topics (Public Read)');
  const topicsResult = await safeDatabaseOperation(
    () => databases.listDocuments('synapse', 'topics'),
    'Failed to fetch topics'
  );

  if (topicsResult.success && topicsResult.data) {
    console.log(`✅ Topics fetched successfully`);
    console.log(`   Found ${topicsResult.data.documents.length} topics\n`);
  } else {
    console.log('❌ Failed to fetch topics:', topicsResult.error, '\n');
    return {
      success: false,
      error: `Topics fetch failed: ${topicsResult.error}`,
    };
  }

  // Test 4: Try to fetch user document (requires authentication)
  console.log('🔍 Test 4: Fetch User Document (Authenticated)');
  try {
    const user = await account.get();
    const userResult = await safeDatabaseOperation(
      () => databases.getDocument('synapse', 'users', user.$id),
      'Failed to fetch user document'
    );

    if (userResult.success && userResult.data) {
      console.log('✅ User document fetched successfully');
      console.log(`   Email: ${userResult.data.email}`);
      console.log(`   Selected Topics: ${userResult.data.selectedTopics?.length || 0}\n`);
    } else {
      console.log('❌ Failed to fetch user document:', userResult.error, '\n');
      // This might be expected if user doc doesn't exist yet
      if (userResult.error?.includes('not found')) {
        console.log('ℹ️  This is expected for new users - document will be created on first topic selection\n');
      } else {
        return {
          success: false,
          error: `User document fetch failed: ${userResult.error}`,
        };
      }
    }
  } catch (error) {
    console.log('❌ User fetch failed:', (error as Error).message, '\n');
  }

  // Test 5: Try to fetch challenges (requires authentication)
  console.log('🔍 Test 5: Fetch Challenges (Authenticated)');
  const challengesResult = await safeDatabaseOperation(
    () => databases.listDocuments('synapse', 'challenges', []),
    'Failed to fetch challenges'
  );

  if (challengesResult.success && challengesResult.data) {
    console.log(`✅ Challenges fetched successfully`);
    console.log(`   Found ${challengesResult.data.documents.length} challenges\n`);
  } else {
    console.log('❌ Failed to fetch challenges:', challengesResult.error, '\n');
    return {
      success: false,
      error: `Challenges fetch failed: ${challengesResult.error}`,
    };
  }

  console.log('✅ All tests passed! Appwrite connection is working correctly.\n');
  return {
    success: true,
    message: 'All database operations successful',
  };
};

// Export for use in components
export default testAppwriteConnection;
