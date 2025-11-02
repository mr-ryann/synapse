/**
 * Function Diagnostics Component
 * Use this to test Appwrite function execution and diagnose issues
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { functions, account, databases } from '../lib/appwrite';
import { COLORS, FONTS } from '../theme';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const FunctionDiagnostics = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setRunning(true);

    try {
      // Test 1: Check Authentication
      addResult({ test: 'Authentication', status: 'pending', message: 'Checking...' });
      try {
        const user = await account.get();
        addResult({
          test: 'Authentication',
          status: 'success',
          message: `Logged in as ${user.email}`,
          details: { userId: user.$id, name: user.name }
        });

        // Test 2: Check Topics
        addResult({ test: 'User Topics', status: 'pending', message: 'Checking...' });
        try {
          const userDoc = await databases.getDocument('synapse', 'users', user.$id);
          const topicCount = userDoc.selectedTopics?.length || 0;
          
          if (topicCount > 0) {
            addResult({
              test: 'User Topics',
              status: 'success',
              message: `${topicCount} topics selected`,
              details: { topics: userDoc.selectedTopics }
            });
          } else {
            addResult({
              test: 'User Topics',
              status: 'error',
              message: 'No topics selected. Please select topics first.',
              details: { action: 'Go to /topics and select at least one topic' }
            });
          }
        } catch (error: any) {
          addResult({
            test: 'User Topics',
            status: 'error',
            message: 'Failed to fetch user document',
            details: { error: error.message }
          });
        }

        // Test 3: Function Execution
        addResult({ test: 'Function Execution', status: 'pending', message: 'Executing getChallengeForUser...' });
        try {
          const execution = await functions.createExecution(
            'getChallengeForUser',
            JSON.stringify({ userId: user.$id, forceAI: false })
          );

          addResult({
            test: 'Function Execution - Status',
            status: execution.status === 'completed' ? 'success' : 'error',
            message: `Status: ${execution.status}`,
            details: {
              executionId: execution.$id,
              status: execution.status,
              responseBodyLength: execution.responseBody?.length || 0
            }
          });

          // Test 4: Parse Response
          addResult({ test: 'Response Parsing', status: 'pending', message: 'Parsing response...' });
          
          if (!execution.responseBody || execution.responseBody.trim() === '') {
            addResult({
              test: 'Response Parsing',
              status: 'error',
              message: 'Empty response body',
              details: {
                issue: 'Function returned no data',
                possibleCauses: [
                  'Missing environment variables (APPWRITE_DATABASES_API_KEY, GEMINI_API_KEY)',
                  'Function timeout',
                  'Python error in function code',
                  'Database query failed'
                ],
                action: 'Check Appwrite Console → Functions → Get Challenge For User → Executions for logs'
              }
            });
          } else {
            try {
              const result = JSON.parse(execution.responseBody);
              
              if (result.success) {
                addResult({
                  test: 'Response Parsing',
                  status: 'success',
                  message: 'Function returned valid challenge',
                  details: {
                    challengeId: result.data?.id,
                    title: result.data?.title,
                    topic: result.data?.topic,
                    source: result.data?.source
                  }
                });
              } else {
                addResult({
                  test: 'Response Parsing',
                  status: 'error',
                  message: `Function error: ${result.error}`,
                  details: { error: result.error }
                });
              }
            } catch (parseError: any) {
              addResult({
                test: 'Response Parsing',
                status: 'error',
                message: 'Failed to parse JSON response',
                details: {
                  error: parseError.message,
                  responsePreview: execution.responseBody.substring(0, 200),
                  action: 'Function may be returning non-JSON data or HTML error page'
                }
              });
            }
          }
        } catch (error: any) {
          addResult({
            test: 'Function Execution',
            status: 'error',
            message: `Execution failed: ${error.message}`,
            details: { error: error.message, stack: error.stack }
          });
        }

        // Test 5: Database Access
        addResult({ test: 'Database Access', status: 'pending', message: 'Checking database...' });
        try {
          const challenges = await databases.listDocuments('synapse', 'challenges');
          addResult({
            test: 'Database Access',
            status: 'success',
            message: `Found ${challenges.documents.length} challenges in database`,
            details: { count: challenges.documents.length }
          });
        } catch (error: any) {
          addResult({
            test: 'Database Access',
            status: 'error',
            message: 'Failed to access challenges collection',
            details: { error: error.message }
          });
        }

      } catch (error: any) {
        addResult({
          test: 'Authentication',
          status: 'error',
          message: 'Not authenticated',
          details: { error: error.message, action: 'Please log in first' }
        });
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Function Diagnostics</Text>
      
      <TouchableOpacity
        style={[styles.button, running && styles.buttonDisabled]}
        onPress={runDiagnostics}
        disabled={running}
      >
        {running ? (
          <ActivityIndicator color={COLORS.background.primary} />
        ) : (
          <Text style={styles.buttonText}>Run Diagnostics</Text>
        )}
      </TouchableOpacity>

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTest}>{result.test}</Text>
              <View style={[
                styles.statusBadge,
                result.status === 'success' && styles.statusSuccess,
                result.status === 'error' && styles.statusError,
                result.status === 'pending' && styles.statusPending,
              ]}>
                <Text style={styles.statusText}>
                  {result.status === 'success' ? '✓' : result.status === 'error' ? '✗' : '...'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.resultMessage}>{result.message}</Text>
            
            {result.details && (
              <View style={styles.details}>
                <Text style={styles.detailsText}>
                  {JSON.stringify(result.details, null, 2)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.accent.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.background.primary,
  },
  results: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: COLORS.background.elevated,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTest: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusSuccess: {
    backgroundColor: '#10B981',
  },
  statusError: {
    backgroundColor: '#EF4444',
  },
  statusPending: {
    backgroundColor: COLORS.text.muted,
  },
  statusText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultMessage: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  details: {
    backgroundColor: COLORS.background.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: COLORS.text.muted,
  },
});
