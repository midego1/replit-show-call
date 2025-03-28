import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text, FAB, Divider, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { format, differenceInMilliseconds } from 'date-fns';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { CallItem } from '@components/CallItem';

// Mock data for now - this will be replaced with API data
const MOCK_SHOWS = [
  {
    id: 1,
    title: 'Performance at Main Theater',
    description: 'Main stage quarterly production',
    startTime: new Date(Date.now() + 86400000), // Tomorrow
    userId: 1,
  },
  {
    id: 2,
    title: 'Rehearsal Session',
    description: 'Final rehearsal before show',
    startTime: new Date(Date.now() + 172800000), // Day after tomorrow
    userId: 1,
  },
];

// Mock calls data
const MOCK_CALLS = [
  {
    id: 1,
    showId: 1,
    subject: 'Lighting Check',
    description: 'Verify all lighting cues',
    minutesBefore: 120,
    sendNotification: true,
  },
  {
    id: 2,
    showId: 1,
    subject: 'Costume Change',
    description: 'Final costume preparations',
    minutesBefore: 60,
    sendNotification: true,
  },
  {
    id: 3,
    showId: 1,
    subject: 'Curtain Call',
    description: 'All performers to stage',
    minutesBefore: 30,
    sendNotification: true,
  },
];

const ShowDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { showId } = route.params;
  
  const [show, setShow] = useState<any>(null);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load show and call data
  const loadShowData = async () => {
    try {
      // TODO: Replace with actual API calls
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find show with matching ID
      const foundShow = MOCK_SHOWS.find(s => s.id === showId);
      if (foundShow) {
        // Format dates and times
        const processedShow = {
          ...foundShow,
          formattedDate: format(new Date(foundShow.startTime), 'EEEE, MMMM d, yyyy'),
          formattedTime: format(new Date(foundShow.startTime), 'h:mm a'),
        };
        setShow(processedShow);
        
        // Get calls for this show
        const showCalls = MOCK_CALLS.filter(call => call.showId === showId);
        
        // Process calls with time calculations
        const processedCalls = showCalls.map((call, index) => {
          const callTime = new Date(foundShow.startTime);
          callTime.setMinutes(callTime.getMinutes() - call.minutesBefore);
          
          const now = new Date();
          const timeRemaining = Math.max(0, differenceInMilliseconds(callTime, now));
          const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          
          return {
            ...call,
            number: index + 1, // Add number for display purposes
            callTime,
            formattedCallTime: format(callTime, 'h:mm a'),
            timerString: `${hours}h ${minutes}m`,
          };
        });
        
        setCalls(processedCalls);
      }
    } catch (error) {
      console.error('Error loading show data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadShowData();
    
    // Update timers every minute
    const timerId = setInterval(() => {
      if (show) {
        setCalls(prevCalls => 
          prevCalls.map(call => {
            const now = new Date();
            const callTime = new Date(call.callTime);
            const timeRemaining = Math.max(0, differenceInMilliseconds(callTime, now));
            const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            
            return {
              ...call,
              timerString: `${hours}h ${minutes}m`,
            };
          })
        );
      }
    }, 60000);
    
    return () => clearInterval(timerId);
  }, [showId]);
  
  const handleDeleteShow = () => {
    Alert.alert(
      'Delete Show',
      'Are you sure you want to delete this show? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement actual delete API call
            console.log('Delete show', showId);
            navigation.goBack();
          }
        },
      ]
    );
  };
  
  const handleDeleteCall = (callId: number) => {
    Alert.alert(
      'Delete Call',
      'Are you sure you want to delete this call? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement actual delete API call
            console.log('Delete call', callId);
            // Update local state for immediate UI update
            setCalls(prevCalls => prevCalls.filter(call => call.id !== callId));
          }
        },
      ]
    );
  };
  
  const handleAddCall = () => {
    // TODO: Implement navigation to call creation screen
    console.log('Add new call for show', showId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading show details...</Text>
      </View>
    );
  }

  if (!show) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Show not found</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Show Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Title style={styles.showTitle}>{show.title}</Title>
              <IconButton 
                icon="pencil"
                size={20}
                onPress={() => {
                  // TODO: Navigate to show edit screen
                  console.log('Edit show', showId);
                }}
              />
            </View>
            <Paragraph style={styles.description}>{show.description}</Paragraph>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <MaterialIcons name="event" size={18} color="#6200EE" />
                <Text style={styles.detailText}>{show.formattedDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="access-time" size={18} color="#6200EE" />
                <Text style={styles.detailText}>{show.formattedTime}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Calls Section */}
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Calls</Title>
          <Text style={styles.callCount}>
            {calls.length} {calls.length === 1 ? 'call' : 'calls'}
          </Text>
        </View>
        
        {calls.length === 0 ? (
          <Card style={styles.emptyCallsCard}>
            <Card.Content style={styles.emptyCallsContent}>
              <MaterialIcons name="notifications-none" size={48} color="#CCCCCC" />
              <Text style={styles.emptyCallsText}>No calls added yet</Text>
              <Text style={styles.emptyCallsSubText}>Tap the + button to add a call</Text>
            </Card.Content>
          </Card>
        ) : (
          calls.map((call) => (
            <CallItem 
              key={call.id} 
              call={call} 
              onDelete={() => handleDeleteCall(call.id)}
              onEdit={() => {
                // TODO: Navigate to call edit screen
                console.log('Edit call', call.id);
              }}
            />
          ))
        )}
        
        {/* Delete Show Button */}
        <Button 
          mode="outlined" 
          onPress={handleDeleteShow}
          style={styles.deleteButton}
          contentStyle={styles.deleteButtonContent}
          color="#B00020"
        >
          Delete Show
        </Button>
      </ScrollView>
      
      {/* Add Call FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddCall}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding at bottom for FAB
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showTitle: {
    fontSize: 22,
    flex: 1,
  },
  description: {
    marginTop: 8,
    marginBottom: 16,
    color: '#666',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 20,
  },
  callCount: {
    color: '#666',
  },
  emptyCallsCard: {
    marginBottom: 16,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    backgroundColor: '#f9f9f9',
  },
  emptyCallsContent: {
    alignItems: 'center',
    padding: 24,
  },
  emptyCallsText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptyCallsSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 16,
    borderColor: '#B00020',
  },
  deleteButtonContent: {
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#B00020',
    marginBottom: 16,
  },
  backButton: {
    marginTop: 16,
  },
});

export default ShowDetailScreen;