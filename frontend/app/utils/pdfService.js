/**
 * PDF Service — Frontend
 * Calls /api/pdf/generate, then:
 *   - Web:    triggers a browser download via <a download> blob URL
 *   - Native: saves to device filesystem, opens native share sheet
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';



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

// ArrayBuffer to base64 helper for native environments without global Buffer
const arrayBufferToBase64 = (buffer) => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  // Fallback Uint8Array to base64 mapping
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64 = '';
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;

    const c1 = b1 >> 2;
    const c2 = ((b1 & 3) << 4) | (b2 >> 4);
    const c3 = ((b2 & 15) << 2) | (b3 >> 6);
    const c4 = b3 & 63;

    base64 += chars[c1] + chars[c2] + (i + 1 < len ? chars[c3] : '=') + (i + 2 < len ? chars[c4] : '=');
  }
  return base64;
};

const saveAndShareNative = async (buffer, filename) => {
  const fileUri = `${FileSystem.documentDirectory}${filename}`;

  // Convert ArrayBuffer to base64 string safely across all JS engines
  const base64 = arrayBufferToBase64(buffer);
  
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType ? FileSystem.EncodingType.Base64 : 'base64',
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
