import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Card, Title, Paragraph, Text, ActivityIndicator } from 'react-native-paper';
import { format } from 'date-fns';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShowCard } from '@components/ShowCard';

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

// This will be replaced with actual data from the API
const getTimeRemaining = (date: Date) => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) return 'Now';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const HomeScreen = () => {
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const loadShows = async () => {
    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Process the shows with formatted dates and times
      const processedShows = MOCK_SHOWS.map(show => ({
        ...show,
        timeRemaining: getTimeRemaining(new Date(show.startTime)),
        formattedDate: format(new Date(show.startTime), 'MMM d, yyyy'),
        formattedTime: format(new Date(show.startTime), 'h:mm a'),
      }));
      
      setShows(processedShows);
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load shows when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadShows();
      
      // Start a timer to update the time remaining every minute
      const timerId = setInterval(() => {
        setShows(prevShows => 
          prevShows.map(show => ({
            ...show,
            timeRemaining: getTimeRemaining(new Date(show.startTime)),
          }))
        );
      }, 60000);
      
      return () => clearInterval(timerId);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadShows();
  };

  const navigateToShowDetail = (show: any) => {
    navigation.navigate('ShowDetail', { 
      showId: show.id,
      title: show.title
    });
  };

  const renderShowCard = ({ item }: any) => (
    <ShowCard
      show={item}
      onPress={() => navigateToShowDetail(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200EE" />
            <Text style={styles.loadingText}>Loading shows...</Text>
          </View>
        ) : shows.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No upcoming shows</Text>
            <Text style={styles.emptySubText}>Tap the + button to create a show</Text>
          </View>
        ) : (
          <FlatList
            data={shows}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderShowCard}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
        
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {
            // Navigate to show creation screen
            // TODO: Implement navigation to show creation
            console.log('Create new show');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubText: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;