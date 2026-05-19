import React from 'react';
import { Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function CategoryIcon({ emoji, size = 20, color = '#FFFFFF', disableOverride = false, style }) {
  // Curated signature colors for categories
  let iconColor = color;
  const lowerColor = String(color).toLowerCase();
  if (!disableOverride && (lowerColor === '#ffffff' || lowerColor === '#fff' || lowerColor === 'white')) {
    switch (emoji) {
      // 🍔 Food
      case '🍔':
      case '🍕':
      case '🍽️':
      case '🥞':
      case '🍿':
      case '🍚':
      case '🍛':
      case '🍗':
      case '🍱':
      case '🍲':
      case '🍳':
      case 'Food':
        iconColor = '#F59E0B'; // Amber Orange
        break;

      // 🍹 Drinks
      case '🍹':
      case '☕':
      case '🧃':
      case '🥤':
      case '💧':
      case 'Drinks':
        iconColor = '#8B5CF6'; // Violet/Purple
        break;

      // 🚗 Car / Transport
      case '🚗':
      case '🚕':
      case '🛺':
      case '🚌':
      case '🚇':
      case '🚆':
      case 'Transport':
        iconColor = '#0EA5E9'; // Sky Blue
        break;

      // 📊 Stats
      case '📊':
      case 'Stats':
        iconColor = '#3B82F6'; // Cobalt Blue
        break;

      // 🏠 Home
      case '🏠':
      case 'Home':
        iconColor = '#10B981'; // Emerald Green
        break;

      // 👥 Friends
      case '👥':
      case 'Friends':
        iconColor = '#EC4899'; // Vibrant Pink
        break;

      // ⚙️ Settings
      case '⚙️':
      case 'Settings':
        iconColor = '#A78BFA'; // Vibrant Lavender
        break;

      // 💸 Cash
      case '💸':
        iconColor = '#10B981'; // Green
        break;

      // 🟢 Pay to me
      case '🟢':
        iconColor = '#10B981'; // Green
        break;

      // 🔴 Pay to you
      case '🔴':
        iconColor = '#EF4444'; // Crimson Red
        break;

      // ⚠️ Warning
      case '⚠️':
        iconColor = '#F59E0B'; // Amber
        break;

      // ✅ Complete
      case '✅':
        iconColor = '#10B981'; // Green
        break;

      // 💜 Wallet
      case '💜':
        iconColor = '#A78BFA'; // Lavender
        break;

      // 🔗 Link
      case '🔗':
        iconColor = '#60A5FA'; // Soft Blue
        break;

      // 📝 Notes / Document
      case '📝':
        iconColor = '#A78BFA'; // Vibrant Lavender
        break;

      // 📭 Empty inbox / Tray
      case '📭':
        iconColor = '#60A5FA'; // Soft Blue
        break;

      // 🧍 Solo
      case '🧍':
        iconColor = '#38BDF8'; // Sky Blue
        break;
    }
  }

  // Translate specific emojis into crisp, premium vector icons
  switch (emoji) {
    // 📊 Analytics / Stats
    case '📊':
    case 'Stats':
      return <Ionicons name="bar-chart" size={size} color={iconColor} style={style} />;
    
    // 🍔 Food
    case '🍔':
    case '🍕':
    case '🍽️':
    case '🥞':
    case '🍿':
    case '🍚':
    case 'Food':
      return <MaterialCommunityIcons name="food" size={size} color={iconColor} style={style} />;
      
    // 🍹 Drinks
    case '🍹':
    case '☕':
    case '🧃':
    case 'Drinks':
      return <MaterialCommunityIcons name="glass-cocktail" size={size} color={iconColor} style={style} />;
      
    // 🚗 Car / Transport
    case '🚗':
    case '🚕':
    case '🛺':
    case '🚌':
    case '🚇':
    case '🚆':
    case 'Transport':
      return <Ionicons name="car" size={size} color={iconColor} style={style} />;
      
    // 🏠 Home tab
    case '🏠':
    case 'Home':
      return <Ionicons name="home" size={size} color={iconColor} style={style} />;
      
    // 👥 Friends tab
    case '👥':
    case 'Friends':
      return <Ionicons name="people" size={size} color={iconColor} style={style} />;
      
    // ⚙️ Settings tab
    case '⚙️':
    case 'Settings':
      return <Ionicons name="settings" size={size} color={iconColor} style={style} />;

    // 💸 Flying cash (Spend / Monthly Card)
    case '💸':
      return <MaterialCommunityIcons name="cash-multiple" size={size} color={iconColor} style={style} />;

    // 📅 This Week Calendar / Today neutral state
    case '📅':
      return <Ionicons name="calendar" size={size} color={iconColor} style={style} />;

    // 📆 Today Calendar number
    case '📆':
      return <Ionicons name="calendar-number" size={size} color={iconColor} style={style} />;

    // 🟢 Pay to me (Incoming cash flow arrow)
    case '🟢':
      return <Ionicons name="arrow-up-circle" size={size} color={iconColor} style={style} />;

    // 🔴 Pay to you (Outgoing cash flow arrow) / Overdue alert
    case '🔴':
      return <Ionicons name="alert-circle" size={size} color={iconColor} style={style} />;

    // ⚠️ Warning / Incomplete alert
    case '⚠️':
      return <Ionicons name="warning" size={size} color={iconColor} style={style} />;

    // ✅ Complete checkmark
    case '✅':
      return <Ionicons name="checkmark-circle" size={size} color={iconColor} style={style} />;

    // 💜 Net Balance Wallet
    case '💜':
      return <Ionicons name="wallet" size={size} color={iconColor} style={style} />;

    // 🔗 Total Shared Link
    case '🔗':
      return <Ionicons name="link" size={size} color={iconColor} style={style} />;

    // 🧍 Solo spend
    case '🧍':
      return <Ionicons name="person" size={size} color={iconColor} style={style} />;

    // 📝 Document / Notes
    case '📝':
      return <Ionicons name="document-text" size={size} color={iconColor} style={style} />;

    // 📭 Empty inbox / Tray
    case '📭':
      return <Ionicons name="file-tray" size={size} color={iconColor} style={style} />;

    // 📌 Pin / Other category fallback
    case '📌':
      return <Ionicons name="pin" size={size} color={iconColor} style={style} />;

    default:
      // Gracefully fall back to standard text emoji if not mapped
      return <Text style={[{ fontSize: size, color: iconColor }, style]}>{emoji}</Text>;
  }
}
