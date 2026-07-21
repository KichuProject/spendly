import { View, Text, Pressable, StyleSheet } from 'react-native';
import { WEB_STYLES } from '../styles/theme';
import { formatCurrency } from '../utils/currencyUtils';
import { getInitials } from '../state/useFriendsStore';
import { useTheme } from '../styles/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function SplitPersonRow({ split, onToggle }) {
  const { colors, typography, radius } = useTheme();
  
  const initials = split.friendName ? getInitials(split.friendName) : '??';
  const isPaid = split.paid;
  
  return (
    <View style={styles.row}>
      <View 
        style={[
          styles.avatar, 
          {
            backgroundColor: isPaid ? `${colors.success}20` : `${colors.danger}20`,
            borderColor: isPaid ? `${colors.success}50` : `${colors.danger}50`,
          }
        ]}
      >
        <Text style={[styles.initials, { color: isPaid ? colors.success : colors.danger }]}>
          {initials}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[typography?.body, { color: colors.textPrimary, fontWeight: '600' }]}>
          {split.friendName || 'Unknown'}
        </Text>
        <Text style={[typography?.caption, { color: colors.textSecondary }]}>
          {formatCurrency(split.amount)}
        </Text>
      </View>
      <Pressable 
        onPress={onToggle} 
        style={[
          styles.toggle,
          WEB_STYLES.cursor,
          {
            backgroundColor: isPaid ? `${colors.success}15` : `${colors.danger}15`,
            borderColor: isPaid ? `${colors.success}40` : `${colors.danger}40`,
            borderRadius: radius.full,
          }
        ]}
      >
        {isPaid ? (
          <View style={styles.toggleContent}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={[styles.toggleText, { color: colors.success }]}>Paid</Text>
          </View>
        ) : (
          <View style={styles.toggleContent}>
            <Ionicons name="alert-circle" size={14} color={colors.danger} />
            <Text style={[styles.toggleText, { color: colors.danger }]}>Owes</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    paddingVertical: 8,
  },
  avatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1.5 
  },
  initials: { 
    fontSize: 12, 
    fontWeight: '800' 
  },
  info: { 
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  toggle: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderWidth: 1 
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleText: { 
    fontSize: 12, 
    fontWeight: '700' 
  },
});
