/**
 * PDF Service — Frontend
 * Calls /api/pdf/generate, then:
 *   - Web:    triggers a browser download via <a download> blob URL
 *   - Native: saves to device filesystem, opens native share sheet
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ─────────────────────────────────────────
// Resolve base API URL (mirrors apiClient.js)
// ─────────────────────────────────────────

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    return `http://${hostIp}:5000/api`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
};

// ─────────────────────────────────────────
// Retrieve stored access token
// ─────────────────────────────────────────

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('accessToken');
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────
// Derive a safe filename
// ─────────────────────────────────────────

const buildFilename = (startDate, endDate) => {
  const tag = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      .replace(/ /g, '_')
      .replace(/,/g, '');
  return `Spendly_Report_${tag(startDate)}_to_${tag(endDate)}.pdf`;
};

// ─────────────────────────────────────────
// Web download helper
// ─────────────────────────────────────────

const triggerWebDownload = (buffer, filename) => {
  const byteArray = new Uint8Array(buffer);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 500);
};

// ─────────────────────────────────────────
// Native save + share helper
// ─────────────────────────────────────────

const saveAndShareNative = async (buffer, filename) => {
  // Dynamic import to avoid loading native modules on web
  const FileSystem = await import('expo-file-system');
  const Sharing    = await import('expo-sharing');

  const fileUri = `${FileSystem.documentDirectory}${filename}`;

  // Convert ArrayBuffer to base64 string
  const base64 = Buffer.from(buffer).toString('base64');
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Save or Share Expense Report',
      UTI: 'com.adobe.pdf',
    });
  }

  return fileUri;
};

// ─────────────────────────────────────────
// Main: generate and download PDF
// ─────────────────────────────────────────

/**
 * @param {Object} config - All filter and option settings from ExportExpensesScreen
 * @returns {Promise<{ success: boolean, filename?: string, error?: string }>}
 */
export const generateAndDownloadPDF = async (config) => {
  const {
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
  } = config;

  const token = await getToken();
  if (!token) {
    return { success: false, error: 'Authentication required. Please log in again.' };
  }

  const filename = buildFilename(startDate, endDate);
  const BASE_URL = getBaseUrl();

  try {
    const response = await fetch(`${BASE_URL}/pdf/generate`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        startDate:               startDate.toISOString(),
        endDate:                 endDate.toISOString(),
        dataType:                selectedDataType,
        categories:              selectedCategories,
        payments:                selectedPayments,
        minAmount:               minAmount || null,
        maxAmount:               maxAmount || null,
        sortOrder,
        paperSize,
        orientation,
        marginSize,
        includeCharts,
        includeSummaryPage,
        includeNotes:            includeNotesPdf,
        includeCategoryBreakdown,
        includePaymentSummary,
      }),
    });

    if (!response.ok) {
      // Try to parse JSON error message
      let errMsg = `Server error (${response.status})`;
      try {
        const j = await response.json();
        if (j.message) errMsg = j.message;
      } catch {}
      return { success: false, error: errMsg };
    }

    // Read binary buffer
    const arrayBuffer = await response.arrayBuffer();

    if (Platform.OS === 'web') {
      triggerWebDownload(arrayBuffer, filename);
    } else {
      await saveAndShareNative(arrayBuffer, filename);
    }

    return { success: true, filename };
  } catch (err) {
    console.error('[pdfService] Error:', err);
    return { success: false, error: err?.message || 'Unexpected error generating PDF.' };
  }
};
