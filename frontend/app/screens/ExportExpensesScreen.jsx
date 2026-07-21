import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import ThemedView from '../components/common/ThemedView';
import ThemedText from '../components/common/ThemedText';
import ThemedCard from '../components/common/ThemedCard';
import DateRangePicker from '../components/DateRangePicker';
import { useToast } from '../components/ToastNotification';
import useExpenseStore from '../state/useExpenseStore';
import { useTheme } from '../styles/ThemeContext';
import { getScreenPaddingTop } from '../utils/platformUtils';
import { formatDate } from '../utils/dateUtils';
import { WEB_STYLES } from '../styles/theme';
import { generateAndDownloadPDF } from '../utils/pdfService';

export default function ExportExpensesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const showToast = useToast();
  const { colors, radius, spacing } = useTheme();
  const expenses = useExpenseStore((s) => s.expenses);

  // Wizard Step: 1 = Config (matches photo), 2 = Preview & Download
  const [step, setStep] = useState(1);

  // STEP 1 CONFIG STATES
  const [selectedDataType, setSelectedDataType] = useState('expenses'); // 'expenses' | 'income' | 'transactions' | 'custom'
  const [dateRangeType, setDateRangeType] = useState('last30'); // 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom'
  
  // Date states
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  });

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showQuickChips, setShowQuickChips] = useState(false);

  // Advanced Filters
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [includeArchived, setIncludeArchived] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(false);
  const [includeReceipts, setIncludeReceipts] = useState(false);

  // PDF Layout Styles
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState('Portrait');
  const [marginSize, setMarginSize] = useState('Normal');
  const [pdfTheme, setPdfTheme] = useState('Light');
  const [fontSize, setFontSize] = useState('Medium');
  const [appBranding, setAppBranding] = useState(true);
  const [includeSummaryPage, setIncludeSummaryPage] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeCategoryBreakdown, setIncludeCategoryBreakdown] = useState(true);
  const [includePaymentSummary, setIncludePaymentSummary] = useState(true);
  const [includeNotesPdf, setIncludeNotesPdf] = useState(true);
  const [includeOpeningBal, setIncludeOpeningBal] = useState(true);
  const [includeClosingBal, setIncludeClosingBal] = useState(true);

  // Export Progress Animation States
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  // Animated values
  const stepTransitionAnim = useRef(new Animated.Value(0)).current; // 0 = config, 1 = preview
  const generateScale = useRef(new Animated.Value(1)).current;
  const successCheckScale = useRef(new Animated.Value(0)).current;

  // Sync dates when dateRangeType changes
  useEffect(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (dateRangeType) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last7':
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last30':
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'custom':
        return;
    }

    setStartDate(start);
    setEndDate(end);
  }, [dateRangeType]);

  // Extract suggest lists
  const categoriesList = useMemo(() => {
    const set = new Set();
    expenses.forEach((e) => e.category && set.add(e.category));
    return Array.from(set);
  }, [expenses]);

  const paymentMethodsList = useMemo(() => {
    const set = new Set();
    expenses.forEach((e) => e.paymentMethod && set.add(e.paymentMethod));
    return Array.from(set).filter(Boolean);
  }, [expenses]);

  // Get list of matching records based on configurations
  const filteredItems = useMemo(() => {
    return expenses.filter((e) => {
      // Exclude income unless selected
      if (selectedDataType === 'expenses' && e.type === 'income') return false;
      if (selectedDataType === 'income' && e.type !== 'income') return false;

      // Date Range filter
      const d = new Date(e.date);
      if (d < startDate || d > endDate) return false;

      // Step 2 filters (only apply on preview step)
      if (step === 2) {
        if (selectedCategories.length > 0 && !selectedCategories.includes(e.category)) return false;
        if (selectedPayments.length > 0 && !selectedPayments.includes(e.paymentMethod)) return false;
        if (minAmount && e.amount < parseFloat(minAmount)) return false;
        if (maxAmount && e.amount > parseFloat(maxAmount)) return false;
      }

      return true;
    });
  }, [
    expenses,
    selectedDataType,
    startDate,
    endDate,
    selectedCategories,
    selectedPayments,
    minAmount,
    maxAmount,
    step,
  ]);

  // Calculations for summary stats
  const summaryInfo = useMemo(() => {
    const totalCount = filteredItems.length;
    const sizeEstimateKb = Math.max(12, Math.round(totalCount * 1.8 + 8));
    const pageEstimate = Math.max(1, Math.ceil(totalCount / 18) + (includeSummaryPage ? 1 : 0));

    // Formatted date string (e.g. "01 May - 31 May")
    const startStr = startDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    const endStr = endDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

    return {
      totalCount,
      sizeEstimate: `${sizeEstimateKb} KB`,
      pageEstimate,
      dateShortText: `${startStr} - ${endStr}`,
      dateLongText: `${formatDate(startDate)} - ${formatDate(endDate)}`,
    };
  }, [filteredItems, startDate, endDate, includeSummaryPage]);

  const handleNext = () => {
    if (summaryInfo.totalCount === 0) {
      showToast('No transaction logs found in selected range!', 'warning');
      return;
    }
    setStep(2);
    Animated.spring(stepTransitionAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  const handleBack = () => {
    if (step === 2) {
      Animated.spring(stepTransitionAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start(() => {
        setStep(1);
      });
    } else {
      navigation.goBack();
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setSuccess(false);
    setGenerateError(null);

    Animated.timing(generateScale, { toValue: 0.95, duration: 150, useNativeDriver: true }).start();

    const result = await generateAndDownloadPDF({
      startDate,
      endDate,
      selectedDataType,
      selectedCategories,
      selectedPayments,
      minAmount,
      maxAmount,
      sortOrder,
      paperSize,
      orientation,
      marginSize,
      includeCharts,
      includeSummaryPage,
      includeNotesPdf,
      includeCategoryBreakdown,
      includePaymentSummary,
    });

    setGenerating(false);
    Animated.timing(generateScale, { toValue: 1, duration: 150, useNativeDriver: true }).start();

    if (result.success) {
      setSuccess(true);
      showToast('PDF Report downloaded successfully!', 'success');
      Animated.spring(successCheckScale, {
        toValue: 1, tension: 50, friction: 4, useNativeDriver: true,
      }).start();
      setTimeout(() => {
        Animated.timing(successCheckScale, { toValue: 0, duration: 250, useNativeDriver: true }).start(() =>
          setSuccess(false)
        );
      }, 3500);
    } else {
      setGenerateError(result.error || 'Failed to generate PDF.');
      showToast(result.error || 'PDF generation failed. Try again.', 'error');
    }
  };

  const dateChips = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last7', label: 'Last 7 Days' },
    { key: 'last30', label: 'Last 30 Days' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'lastMonth', label: 'Last Month' },
  ];

  return (
    <ThemedView variant="bg" style={[styles.container, { borderLeftColor: colors.border, borderRightColor: colors.border, paddingTop: getScreenPaddingTop(insets.top) }]}>
      
      {/* HEADER SECTION (Matches Photo exactly) */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            pressed && { opacity: 0.7 },
            WEB_STYLES.cursor,
          ]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <ThemedText variant="h3" color="primary">Export Expenses</ThemedText>
          <Text style={[styles.headerSubtitleText, { color: colors.textSecondary }]}>
            {step === 1 ? 'Generate and download your expense data' : 'Review and customize PDF report'}
          </Text>
        </View>
        <View style={[styles.securityBadgeCircle, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
        </View>
      </View>

      {step === 1 ? (
        // STEP 1 CONTENT: CONFIGURATION PANEL
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Subtle Document Illustration (Matches Photo illustration style) */}
          <View style={styles.illustrationContainer}>
            <View style={[styles.illustrationBlob, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '12' }]}>
              <View style={[styles.illustrationSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.sheetLine, { width: '40%', backgroundColor: colors.borderStrong }]} />
                <View style={[styles.sheetLine, { width: '70%', backgroundColor: colors.border }]} />
                <View style={[styles.sheetLine, { width: '55%', backgroundColor: colors.border }]} />
              </View>
              <View style={[styles.illustrationDownloadCircle, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                <Ionicons name="arrow-down" size={16} color="#FFF" />
              </View>
              <View style={[styles.illustrationCheckmarkCircle, { backgroundColor: colors.success, borderColor: colors.surface }]}>
                <Ionicons name="checkmark" size={10} color="#FFF" />
              </View>
            </View>
          </View>

          {/* 1. SELECT DATA (Grid matching photo layout) */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitleText, { color: colors.textSecondary }]}>1. Select Data</Text>
          </View>
          <View style={styles.gridContainer}>
            {/* Expenses Card */}
            <Pressable
              onPress={() => setSelectedDataType('expenses')}
              style={[
                styles.gridCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: selectedDataType === 'expenses' ? colors.primary : colors.border,
                  borderWidth: selectedDataType === 'expenses' ? 2 : 1,
                  borderRadius: radius.md,
                },
                WEB_STYLES.cursor
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="trending-up" size={18} color={colors.primary} />
                </View>
                {selectedDataType === 'expenses' && (
                  <View style={[styles.cardCheckBadge, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                  </View>
                )}
              </View>
              <Text style={[styles.cardTitleText, { color: colors.textPrimary }]}>Expenses</Text>
              <Text style={[styles.cardDescText, { color: colors.textMuted }]}>All your expenses</Text>
            </Pressable>

            {/* Income Card */}
            <Pressable
              onPress={() => setSelectedDataType('income')}
              style={[
                styles.gridCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: selectedDataType === 'income' ? colors.success : colors.border,
                  borderWidth: selectedDataType === 'income' ? 2 : 1,
                  borderRadius: radius.md,
                },
                WEB_STYLES.cursor
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="trending-down" size={18} color={colors.success} />
                </View>
                {selectedDataType === 'income' && (
                  <View style={[styles.cardCheckBadge, { backgroundColor: colors.success }]}>
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                  </View>
                )}
              </View>
              <Text style={[styles.cardTitleText, { color: colors.textPrimary }]}>Income</Text>
              <Text style={[styles.cardDescText, { color: colors.textMuted }]}>All your income</Text>
            </Pressable>

            {/* Transactions Card */}
            <Pressable
              onPress={() => setSelectedDataType('transactions')}
              style={[
                styles.gridCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: selectedDataType === 'transactions' ? colors.accent : colors.border,
                  borderWidth: selectedDataType === 'transactions' ? 2 : 1,
                  borderRadius: radius.md,
                },
                WEB_STYLES.cursor
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: colors.accent + '15' }]}>
                  <Ionicons name="swap-horizontal" size={18} color={colors.accent} />
                </View>
                {selectedDataType === 'transactions' && (
                  <View style={[styles.cardCheckBadge, { backgroundColor: colors.accent }]}>
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                  </View>
                )}
              </View>
              <Text style={[styles.cardTitleText, { color: colors.textPrimary }]}>Transactions</Text>
              <Text style={[styles.cardDescText, { color: colors.textMuted }]}>Expenses + Income</Text>
            </Pressable>

            {/* Custom Card */}
            <Pressable
              onPress={() => setSelectedDataType('custom')}
              style={[
                styles.gridCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: selectedDataType === 'custom' ? colors.warning : colors.border,
                  borderWidth: selectedDataType === 'custom' ? 2 : 1,
                  borderRadius: radius.md,
                },
                WEB_STYLES.cursor
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: colors.warning + '15' }]}>
                  <Ionicons name="options" size={18} color={colors.warning} />
                </View>
                {selectedDataType === 'custom' && (
                  <View style={[styles.cardCheckBadge, { backgroundColor: colors.warning }]}>
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                  </View>
                )}
              </View>
              <Text style={[styles.cardTitleText, { color: colors.textPrimary }]}>Custom</Text>
              <Text style={[styles.cardDescText, { color: colors.textMuted }]}>Choose what to include</Text>
            </Pressable>
          </View>

          {/* 2. CHOOSE DATE RANGE (Card matching photo layout) */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitleText, { color: colors.textSecondary }]}>2. Choose Date Range</Text>
          </View>
          <Pressable
            onPress={() => setShowQuickChips(!showQuickChips)}
            style={({ pressed }) => [
              styles.dateRangePickerCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
              },
              pressed && { opacity: 0.8 },
              WEB_STYLES.cursor
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.datePickerText, { color: colors.textPrimary }]}>
                {formatDate(startDate)}   —   {formatDate(endDate)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          {/* Inline Quick Selection Chips */}
          {showQuickChips && (
            <FadeIn direction="down" duration={300} style={styles.quickChipsWrapper}>
              <View style={styles.chipsRow}>
                {dateChips.map((chip) => {
                  const isSel = dateRangeType === chip.key;
                  return (
                    <Pressable
                      key={chip.key}
                      onPress={() => { setDateRangeType(chip.key); setShowQuickChips(false); }}
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor: isSel ? colors.primary : colors.surfaceSecondary,
                          borderColor: isSel ? colors.primary : colors.border,
                        },
                        WEB_STYLES.cursor
                      ]}
                    >
                      <Text style={[styles.chipText, { color: isSel ? '#FFF' : colors.textSecondary }]}>{chip.label}</Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => { setShowCalendarModal(true); setShowQuickChips(false); }}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor: dateRangeType === 'custom' ? colors.primary : colors.surfaceSecondary,
                      borderColor: dateRangeType === 'custom' ? colors.primary : colors.border,
                    },
                    WEB_STYLES.cursor
                  ]}
                >
                  <Text style={[styles.chipText, { color: dateRangeType === 'custom' ? '#FFF' : colors.textSecondary }]}>Custom calendar...</Text>
                </Pressable>
              </View>
            </FadeIn>
          )}

          {/* EXPORT SUMMARY (Matches photo layout) */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitleText, { color: colors.textSecondary }]}>Export Summary</Text>
          </View>
          <View style={[styles.exportSummaryGrid, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={styles.summaryGridItem}>
              <Text style={[styles.summaryGridLabel, { color: colors.textTertiary }]}>Data Type</Text>
              <Text style={[styles.summaryGridValue, { color: colors.primary, textTransform: 'capitalize' }]}>{selectedDataType}</Text>
            </View>
            <View style={styles.summaryGridItem}>
              <Text style={[styles.summaryGridLabel, { color: colors.textTertiary }]}>Date Range</Text>
              <Text style={[styles.summaryGridValue, { color: colors.primary }]}>{summaryInfo.dateShortText}</Text>
            </View>
            <View style={styles.summaryGridItem}>
              <Text style={[styles.summaryGridLabel, { color: colors.textTertiary }]}>Records</Text>
              <Text style={[styles.summaryGridValue, { color: colors.primary }]}>{summaryInfo.totalCount}</Text>
            </View>
            <View style={styles.summaryGridItem}>
              <Text style={[styles.summaryGridLabel, { color: colors.textTertiary }]}>File Format</Text>
              <Text style={[styles.summaryGridValue, { color: colors.primary }]}>PDF</Text>
            </View>
          </View>

          {/* Procced Button */}
          <View style={styles.actionContainer}>
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.generateBtn,
                { backgroundColor: colors.primary, borderRadius: radius.md },
                pressed && { opacity: 0.9 },
                WEB_STYLES.cursor
              ]}
            >
              <Text style={styles.generateBtnText}>Next</Text>
            </Pressable>
            
            <View style={styles.footerNote}>
              <Ionicons name="lock-closed-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.footerNoteText, { color: colors.textMuted }]}>
                Your data is secure and private
              </Text>
            </View>
          </View>

        </ScrollView>
      ) : (
        // STEP 2 CONTENT: PREVIEW & CUSTOM DESIGN & DOWNLOAD (The wizard Next screen)
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* STEP 3: LIVE EXPORT SUMMARY */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitleText, { color: colors.textSecondary }]}>3. Live Export Summary</Text>
          </View>

          <ThemedCard style={[styles.summaryCard, { borderColor: colors.border }]} elevated>
            <View style={styles.summaryItemRow}>
              <ThemedText variant="bodySmall" color="secondary">Date Range</ThemedText>
              <ThemedText variant="bodyBold" color="primary">{summaryInfo.dateLongText}</ThemedText>
            </View>
            <View style={styles.summaryItemRow}>
              <ThemedText variant="bodySmall" color="secondary">Estimated Pages</ThemedText>
              <ThemedText variant="bodyBold" color="primary">{summaryInfo.pageEstimate}</ThemedText>
            </View>
            <View style={styles.summaryItemRow}>
              <ThemedText variant="bodySmall" color="secondary">Transactions Included</ThemedText>
              <ThemedText variant="bodyBold" color="primary">{summaryInfo.totalCount}</ThemedText>
            </View>
            <View style={styles.summaryItemRow}>
              <ThemedText variant="bodySmall" color="secondary">Categories Selected</ThemedText>
              <ThemedText variant="bodyBold" color="primary">
                {selectedCategories.length === 0 ? 'All' : `${selectedCategories.length} selected`}
              </ThemedText>
            </View>
            <View style={styles.summaryItemRow}>
              <ThemedText variant="bodySmall" color="secondary">File Format</ThemedText>
              <ThemedText variant="bodyBold" color="primary">PDF</ThemedText>
            </View>
            <View style={styles.summaryItemRow}>
              <ThemedText variant="bodySmall" color="secondary">Estimated File Size</ThemedText>
              <ThemedText variant="bodyBold" color="primary">{summaryInfo.sizeEstimate}</ThemedText>
            </View>
            <View style={[styles.summaryItemRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <ThemedText variant="bodySmall" color="secondary">Last Updated</ThemedText>
              <ThemedText variant="bodyBold" color="primary">Just Now</ThemedText>
            </View>
          </ThemedCard>

          {/* STEP 4: PREVIEW CARD */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitleText, { color: colors.textSecondary }]}>4. Preview Card</Text>
          </View>
          <ThemedCard style={[styles.previewCard, { borderColor: colors.border }]} elevated>
            {/* Mini Document Sheet representation */}
            <View style={[styles.mockDocSheet, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 9, fontWeight: '900', color: '#FFF' }}>S</Text>
                  </View>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: colors.textPrimary, letterSpacing: 0.5 }}>SPENDLY</Text>
                </View>
                <Text style={{ fontSize: 7, fontWeight: '700', color: colors.textMuted }}>PAGE 1 OF {summaryInfo.pageEstimate}</Text>
              </View>

              {/* Document Header & Title lines */}
              <View style={{ height: 7, width: '45%', backgroundColor: colors.textPrimary, borderRadius: 3.5, marginBottom: 6 }} />
              <View style={{ height: 4, width: '60%', backgroundColor: colors.textMuted, borderRadius: 2, marginBottom: 12 }} />

              {/* Stats Card Grid representation */}
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
                <View style={{ flex: 1, height: 24, borderRadius: 4, backgroundColor: colors.primary + '15', borderWidth: 0.5, borderColor: colors.primary + '30' }} />
                <View style={{ flex: 1, height: 24, borderRadius: 4, backgroundColor: colors.success + '15', borderWidth: 0.5, borderColor: colors.success + '30' }} />
                <View style={{ flex: 1, height: 24, borderRadius: 4, backgroundColor: colors.danger + '15', borderWidth: 0.5, borderColor: colors.danger + '30' }} />
              </View>
              
              {/* Conditional Spark Chart render */}
              {Boolean(includeCharts) && (
                <View style={{ height: 36, borderRadius: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingVertical: 6, paddingHorizontal: 8 }}>
                  <View style={{ width: 10, height: '40%', backgroundColor: colors.primary, borderRadius: 2 }} />
                  <View style={{ width: 10, height: '75%', backgroundColor: colors.primary, borderRadius: 2 }} />
                  <View style={{ width: 10, height: '55%', backgroundColor: colors.primary, borderRadius: 2 }} />
                  <View style={{ width: 10, height: '90%', backgroundColor: colors.primary, borderRadius: 2 }} />
                  <View style={{ width: 10, height: '65%', backgroundColor: colors.primary, borderRadius: 2 }} />
                </View>
              )}

              {/* Simulated Passbook Table Rows */}
              <View style={{ gap: 6 }}>
                <View style={{ height: 12, backgroundColor: colors.textPrimary, borderRadius: 3, paddingHorizontal: 6, justifyContent: 'center' }}>
                  <View style={{ height: 3, width: '30%', backgroundColor: '#FFF', borderRadius: 1.5 }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ height: 4, width: '40%', backgroundColor: colors.textMuted, borderRadius: 2 }} />
                  <View style={{ height: 4, width: '20%', backgroundColor: colors.danger, borderRadius: 2 }} />
                </View>
                <View style={{ height: 1, backgroundColor: colors.borderLight }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ height: 4, width: '35%', backgroundColor: colors.textMuted, borderRadius: 2 }} />
                  <View style={{ height: 4, width: '20%', backgroundColor: colors.success, borderRadius: 2 }} />
                </View>
              </View>
            </View>

            <View style={styles.previewInfoRow}>
              <View style={[styles.previewIconBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '25' }]}>
                <Ionicons name="document-text-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.previewTitle, { color: colors.textPrimary, fontWeight: '700' }]}>Spendly Expense Statement</Text>
                <Text style={[styles.previewMeta, { color: colors.textSecondary, marginTop: 3, lineHeight: 16 }]}>
                  {summaryInfo.dateShortText} • {summaryInfo.totalCount} Transactions{'\n'}
                  Estimated: {summaryInfo.pageEstimate} Page{summaryInfo.pageEstimate !== 1 ? 's' : ''} ({summaryInfo.sizeEstimate})
                </Text>
              </View>
              <View style={[styles.readyBadge, { backgroundColor: colors.success + '15', borderColor: colors.success + '30', alignSelf: 'center' }]}>
                <Text style={[styles.readyText, { color: colors.success, fontSize: 10, fontWeight: '800' }]}>Ready</Text>
              </View>
            </View>
          </ThemedCard>

          {/* Bottom Download Actions */}
          <View style={styles.actionContainer}>
            <Animated.View style={{ transform: [{ scale: generateScale }] }}>
              <Pressable
                onPress={handleGenerate}
                disabled={generating}
                style={[
                  styles.generateBtn,
                  { backgroundColor: success ? colors.success : colors.primary, borderRadius: radius.md },
                  WEB_STYLES.cursor
                ]}
              >
                {generating ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.generateBtnText}>Generating...</Text>
                  </View>
                ) : success ? (
                  <Animated.View style={{ transform: [{ scale: successCheckScale }], flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.generateBtnText}>Success!</Text>
                  </Animated.View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.generateBtnText}>Generate & Download PDF</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>

            {generateError && !generating && (
              <View style={{
                marginTop: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: colors.danger + '10',
                borderRadius: radius.sm,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: colors.danger + '30',
              }}>
                <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
                <Text style={{ color: colors.danger, fontSize: 12, flex: 1, lineHeight: 16 }}>
                  {generateError}
                </Text>
                <Pressable onPress={handleGenerate} style={WEB_STYLES.cursor}>
                  <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '700' }}>Retry</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.footerNote}>
              <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
              <Text style={[styles.footerNoteText, { color: colors.textMuted }]}>
                Report is generated securely on server with your real transaction data.
              </Text>
            </View>
          </View>
          
        </ScrollView>
      )}

      {/* Dynamic Calendar Date Picker Modal */}
      <DateRangePicker
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelect={(res) => {
          if (res.start && res.end) {
            setStartDate(res.start);
            setEndDate(res.end);
            setDateRangeType('custom');
          }
          setShowCalendarModal(false);
        }}
      />

    </ThemedView>
  );
}

// Fade entrance wrapper
function FadeIn({ children, direction = 'up', delay = 0, duration = 300, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(translate, { toValue: 0, duration, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ translateY: translate }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      web: {
        maxWidth: 480,
        width: '100%',
        alignSelf: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
      },
      default: {},
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.08)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 14,
  },
  headerSubtitleText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  securityBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 48,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  illustrationBlob: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  illustrationSheet: {
    width: 38,
    height: 48,
    borderRadius: 4,
    borderWidth: 1.5,
    padding: 6,
    gap: 4,
    justifyContent: 'center',
  },
  sheetLine: {
    height: 3,
    borderRadius: 1.5,
  },
  illustrationDownloadCircle: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCheckmarkCircle: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
  },
  gridCard: {
    width: '48%',
    flexGrow: 1,
    padding: 12,
    minHeight: 100,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCheckBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardDescText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
  },
  dateRangePickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    borderWidth: 1,
  },
  datePickerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickChipsWrapper: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  formatContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  formatCard: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    minHeight: 90,
  },
  formatTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  formatDesc: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  exportSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryGridItem: {
    width: '50%',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  summaryGridLabel: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  summaryGridValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  generateBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
  },
  footerNoteText: {
    fontSize: 11,
    fontWeight: '500',
  },
  previewCard: {
    marginHorizontal: 20,
    padding: 16,
    borderWidth: 1,
  },
  mockDocSheet: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    aspectRatio: 1 / 1.15,
    width: '100%',
  },
  previewInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  previewIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  previewMeta: {
    fontSize: 11,
    marginTop: 1,
  },
  readyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  readyText: {
    fontSize: 11,
    fontWeight: '800',
  },
  accordionCard: {
    marginHorizontal: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accordionContent: {
    borderTopWidth: 1,
    padding: 16,
  },
  filterSubLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  textInput: {
    height: 38,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  segmentOptionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
  },
  segmentOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryCard: {
    marginHorizontal: 20,
    padding: 16,
    borderWidth: 1,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.06)',
    paddingBottom: 10,
    marginBottom: 10,
  },
});
