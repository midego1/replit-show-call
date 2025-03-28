import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton, Divider } from 'react-native-paper';
import { Call } from '@/api/showService';
import { calculateCallTime, formatTime, getTimeRemaining, getTimeRemainingColor } from '@/utils/dateUtils';

interface CallItemProps {
  call: Call;
  showDate: string;
  index: number;
  onPress?: (callId: number) => void;
  onEdit?: (callId: number) => void;
  onDelete?: (callId: number) => void;
}

const CallItem: React.FC<CallItemProps> = ({
  call,
  showDate,
  index,
  onPress,
  onEdit,
  onDelete,
}) => {
  // Calculate call time by subtracting minutesBefore from show time
  const callTime = calculateCallTime(showDate, call.minutesBefore);
  const timeRemaining = getTimeRemaining(callTime.toISOString());
  const timeRemainingColor = getTimeRemainingColor(callTime.getTime() - new Date().getTime());
  
  return (
    <Card
      style={styles.card}
      onPress={() => onPress?.(call.id)}
      mode="outlined"
    >
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <View style={styles.numberRow}>
              <Chip 
                style={styles.numberChip}
                textStyle={styles.numberChipText}
              >
                {index + 1}
              </Chip>
              <Text variant="titleMedium" numberOfLines={1}>{call.subject}</Text>
            </View>
            {call.description && (
              <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
                {call.description}
              </Text>
            )}
          </View>
          
          <View style={styles.timeContainer}>
            <Chip 
              style={[styles.timeChip, { backgroundColor: timeRemainingColor }]}
              textStyle={styles.timeChipText}
            >
              {timeRemaining}
            </Chip>
            <Text variant="bodySmall" style={styles.callTimeText}>
              {formatTime(callTime.toISOString())}
            </Text>
          </View>
        </View>
        
        <View style={styles.footerRow}>
          <View style={styles.infoContainer}>
            <Text variant="bodySmall">{call.minutesBefore} minutes before show</Text>
            
            {call.sendNotification && (
              <View style={styles.notificationInfo}>
                <IconButton
                  icon="bell"
                  size={16}
                  style={styles.iconButton}
                />
                <Text variant="bodySmall">Notifications enabled</Text>
              </View>
            )}
          </View>
          
          {(onEdit || onDelete) && (
            <View style={styles.actionButtons}>
              {onEdit && (
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={(e) => {
                    e.stopPropagation();
                    onEdit(call.id);
                  }}
                />
              )}
              
              {onDelete && (
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(call.id);
                  }}
                />
              )}
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    elevation: 1,
  },
  content: {
    padding: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  numberChip: {
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#6200EE',
  },
  numberChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    padding: 0,
  },
  description: {
    marginTop: 4,
    marginLeft: 32,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeChip: {
    height: 28,
    justifyContent: 'center',
    marginBottom: 4,
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  callTimeText: {
    color: '#666',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  infoContainer: {
    flex: 1,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  iconButton: {
    margin: 0,
    padding: 0,
  },
  actionButtons: {
    flexDirection: 'row',
  },
});

export default CallItem;