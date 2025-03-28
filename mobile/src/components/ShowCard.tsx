import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton } from 'react-native-paper';
import { formatDate, formatTime, getTimeRemaining, getTimeRemainingColor } from '@/utils/dateUtils';
import { Show } from '@/api/showService';

interface ShowCardProps {
  show: Show;
  onPress: (showId: number) => void;
  onEdit?: (showId: number) => void;
  onDelete?: (showId: number) => void;
  compact?: boolean;
}

const ShowCard: React.FC<ShowCardProps> = ({ 
  show, 
  onPress, 
  onEdit, 
  onDelete, 
  compact = false 
}) => {
  const timeRemaining = getTimeRemaining(show.date);
  const timeRemainingColor = getTimeRemainingColor(new Date(show.date).getTime() - new Date().getTime());
  const showDate = formatDate(show.date);
  const showTime = formatTime(show.date);
  
  return (
    <Card 
      style={styles.card}
      onPress={() => onPress(show.id)}
      mode="outlined"
    >
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text variant="titleLarge" numberOfLines={1}>{show.title}</Text>
            {!compact && show.venue && <Text variant="bodyMedium" numberOfLines={1}>{show.venue}</Text>}
          </View>
          
          <Chip 
            style={[styles.timeChip, { backgroundColor: timeRemainingColor }]}
            textStyle={styles.timeChipText}
          >
            {timeRemaining}
          </Chip>
        </View>
        
        {!compact && (
          <View style={styles.detailsRow}>
            <Text variant="bodyMedium">{showDate} at {showTime}</Text>
            
            {(onEdit || onDelete) && (
              <View style={styles.actionButtons}>
                {onEdit && (
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={(e) => {
                      e.stopPropagation();
                      onEdit(show.id);
                    }}
                  />
                )}
                
                {onDelete && (
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={(e) => {
                      e.stopPropagation();
                      onDelete(show.id);
                    }}
                  />
                )}
              </View>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  content: {
    padding: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  timeChip: {
    height: 28,
    justifyContent: 'center',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
});

export default ShowCard;