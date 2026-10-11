import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Radii, Spacing } from '../../constants/theme';
import { submitFounderPitch } from '../../services/api';

export default function FounderPitchSection() {
  const [email, setEmail] = useState('');
  const [oneLine, setOneLine] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        // 12 MB check (12 * 1024 * 1024)
        if (file.size && file.size > 12 * 1024 * 1024) {
          Alert.alert('File too large', 'Please select a PDF deck under 12 MB.');
          return;
        }
        setSelectedFile(file);
      }
    } catch (err) {
      console.log('Document picker error:', err);
      Alert.alert('File Picker', 'Could not access file picker. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Required', 'Please enter a valid contact email.');
      return;
    }
    if (!oneLine.trim()) {
      Alert.alert('Required', 'Please enter a one-line description of your startup.');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Required', 'Please attach your pitch deck in PDF format.');
      return;
    }

    setLoading(true);
    try {
      await submitFounderPitch({
        email: email.trim(),
        oneLine: oneLine.trim(),
        file: selectedFile,
      });

      setSuccess(true);
      setEmail('');
      setOneLine('');
      setSelectedFile(null);
      Alert.alert(
        'Pitch Received!',
        'Thank you! Our investment team will review your pitch deck and get in touch if there is a fit.',
        [{ text: 'Awesome' }]
      );
    } catch (err) {
      console.log('Pitch submission error:', err);
      // Even if network mock or offline, show clear guidance
      Alert.alert('Submission Info', err.message || 'Unable to submit pitch. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Copy Column */}
        <View style={styles.copyCol}>
          <Text style={styles.kicker}>FOR FOUNDERS</Text>
          <Text style={styles.heading}>Think your startup belongs here?</Text>
          <Text style={styles.description}>
            Send a concise one-line summary and an investor-ready PDF deck. We review each submission and
            follow up when there is a potential fit.
          </Text>

          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNum}>01</Text>
              <Text style={styles.stepText}>Tell us what you are building</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNum}>02</Text>
              <Text style={styles.stepText}>Share your pitch deck</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNum}>03</Text>
              <Text style={styles.stepText}>Our team reviews for fit</Text>
            </View>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {success && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.successText}>
                Pitch received. Thank you—our team will review your submission.
              </Text>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Contact email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="founder@startup.com"
              placeholderTextColor="#8A9D98"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* One-Line Description Field */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>One-line description</Text>
              <Text style={styles.charCount}>{oneLine.length}/280</Text>
            </View>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={oneLine}
              onChangeText={setOneLine}
              placeholder="What do you build, and for whom?"
              placeholderTextColor="#8A9D98"
              maxLength={280}
              multiline
            />
          </View>

          {/* File Picker Field */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Pitch deck (PDF, maximum 12 MB)</Text>
            <TouchableOpacity
              style={styles.filePicker}
              activeOpacity={0.8}
              onPress={handlePickDocument}
            >
              <View style={styles.filePickerBtn}>
                <Ionicons name="document-text-outline" size={16} color={Colors.ink} />
                <Text style={styles.filePickerBtnText}>Choose PDF</Text>
              </View>
              <Text style={styles.fileNameText} numberOfLines={1}>
                {selectedFile ? selectedFile.name : 'No file selected'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.ink} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit pitch</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.ink} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  inner: {
    backgroundColor: Colors.deep,
    borderRadius: Radii.xxl,
    padding: Spacing.lg,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  copyCol: {
    marginBottom: Spacing.xl,
  },
  kicker: {
    color: Colors.mint,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: Spacing.lg,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNum: {
    color: Colors.mint,
    fontSize: 14,
    fontWeight: '800',
    backgroundColor: 'rgba(201, 243, 220, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radii.sm,
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
  },
  successText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    gap: 12,
  },
  filePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.mint,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.sm,
  },
  filePickerBtnText: {
    color: Colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  fileNameText: {
    color: '#FFFFFF',
    fontSize: 13,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 50,
    borderRadius: Radii.md,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
});
