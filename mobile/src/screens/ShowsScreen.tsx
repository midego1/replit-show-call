import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Searchbar, Text, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
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
  {
    id: 3,
    title: 'Tech Run',
    description: 'Technical checks and lighting setup',
    startTime: new Date(Date.now() + 259200000), // 3 days from now
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

const ShowsScreen = () => {
  const [shows, setShows] = useState<any[]>([]);
  const [filteredShows, setFilteredShows] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      setFilteredShows(processedShows);
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
        setShows(prevShows => {
          const updatedShows = prevShows.map(show => ({
            ...show,
            timeRemaining: getTimeRemaining(new Date(show.startTime)),
          }));
          
          // Also update filtered shows
          setFilteredShows(updatedShows.filter(show => 
            show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            show.description.toLowerCase().includes(searchQuery.toLowerCase())
          ));
          
          return updatedShows;
        });
      }, 60000);
      
      return () => clearInterval(timerId);
    }, [searchQuery])
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredShows(shows);
    } else {
      const filtered = shows.filter(show => 
        show.title.toLowerCase().includes(query.toLowerCase()) ||
        show.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredShows(filtered);
    }
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
        <Searchbar
          placeholder="Search shows"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200EE" />
            <Text style={styles.loadingText}>Loading shows...</Text>
          </View>
        ) : filteredShows.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No shows found</Text>
            {searchQuery ? (
              <Text style={styles.emptySubText}>Try a different search term</Text>
            ) : (
              <Text style={styles.emptySubText}>Tap the + button to create a show</Text>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredShows}
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
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
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

export default ShowsScreen;