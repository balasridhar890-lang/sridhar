import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  useColorScheme,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {generatePlan, fetchTodayPlan, clearError} from '../store/plansSlice';

function DayPlanScreen({navigation}) {
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch = useDispatch();
  const {currentPlan, isGenerating, isLoading, error} = useSelector(state => state.plans);
  
  const [userInput, setUserInput] = useState('');
  const [showInputModal, setShowInputModal] = useState(false);
  const [tempInput, setTempInput] = useState('');

  useEffect(() => {
    // Fetch today's plan when the screen mounts
    dispatch(fetchTodayPlan());
  }, [dispatch]);

  useEffect(() => {
    // Show error alerts if there's an error
    if (error) {
      Alert.alert('Error', error, [
        {text: 'OK', onPress: () => dispatch(clearError())}
      ]);
    }
  }, [dispatch, error]);

  const handleGeneratePlan = () => {
    if (userInput.trim()) {
      dispatch(generatePlan({userInput: userInput.trim()}));
    } else {
      dispatch(generatePlan({}));
    }
  };

  const openInputModal = () => {
    setTempInput(userInput);
    setShowInputModal(true);
  };

  const saveInputModal = () => {
    setUserInput(tempInput);
    setShowInputModal(false);
  };

  const cancelInputModal = () => {
    setTempInput(userInput);
    setShowInputModal(false);
  };

  const getCurrentDateString = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    // Handle different time formats from the API
    try {
      return timeStr;
    } catch (err) {
      return timeStr;
    }
  };

  const renderScheduleItem = (item, index) => (
    <View key={index} style={[
      styles.scheduleItem,
      isDarkMode ? styles.scheduleItemDark : styles.scheduleItemLight
    ]}>
      <View style={styles.timeContainer}>
        <Text style={[
          styles.timeText,
          isDarkMode ? styles.timeTextDark : styles.timeTextLight
        ]}>
          {formatTime(item.time)}
        </Text>
        {item.duration && (
          <Text style={[
            styles.durationText,
            isDarkMode ? styles.durationTextDark : styles.durationTextLight
          ]}>
            ({item.duration})
          </Text>
        )}
      </View>
      <View style={styles.activityContainer}>
        <Text style={[
          styles.activityText,
          isDarkMode ? styles.activityTextDark : styles.activityTextLight
        ]}>
          {item.activity}
        </Text>
        {item.notes && (
          <Text style={[
            styles.notesText,
            isDarkMode ? styles.notesTextDark : styles.notesTextLight
          ]}>
            {item.notes}
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={[
        styles.emptyStateIcon,
        isDarkMode ? styles.emptyStateIconDark : styles.emptyStateIconLight
      ]}>
        📅
      </Text>
      <Text style={[
        styles.emptyStateTitle,
        isDarkMode ? styles.emptyStateTitleDark : styles.emptyStateTitleLight
      ]}>
        No Plan for Today
      </Text>
      <Text style={[
        styles.emptyStateDescription,
        isDarkMode ? styles.emptyStateDescriptionDark : styles.emptyStateDescriptionLight
      ]}>
        Generate your first daily plan to get started
      </Text>
    </View>
  );

  const renderPlan = () => {
    if (!currentPlan) return null;

    const schedule = currentPlan.schedule || {};
    const items = schedule.items || [];

    return (
      <View style={styles.planContainer}>
        <View style={styles.planHeader}>
          <Text style={[
            styles.planDate,
            isDarkMode ? styles.planDateDark : styles.planDateLight
          ]}>
            {getCurrentDateString()}
          </Text>
          {schedule.summary && (
            <Text style={[
              styles.planSummary,
              isDarkMode ? styles.planSummaryDark : styles.planSummaryLight
            ]}>
              {schedule.summary}
            </Text>
          )}
        </View>

        {currentPlan.objectives && (
          <View style={styles.objectivesContainer}>
            <Text style={[
              styles.objectivesTitle,
              isDarkMode ? styles.objectivesTitleDark : styles.objectivesTitleLight
            ]}>
              Today's Objectives
            </Text>
            <Text style={[
              styles.objectivesText,
              isDarkMode ? styles.objectivesTextDark : styles.objectivesTextLight
            ]}>
              {currentPlan.objectives}
            </Text>
          </View>
        )}

        {items.length > 0 && (
          <View style={styles.scheduleContainer}>
            <Text style={[
              styles.scheduleTitle,
              isDarkMode ? styles.scheduleTitleDark : styles.scheduleTitleLight
            ]}>
              Schedule
            </Text>
            {items.map(renderScheduleItem)}
          </View>
        )}
      </View>
    );
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc',
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            isDarkMode ? styles.titleDark : styles.titleLight
          ]}>
            Day Planner
          </Text>
          <Text style={[
            styles.subtitle,
            isDarkMode ? styles.subtitleDark : styles.subtitleLight
          ]}>
            AI-powered daily planning
          </Text>
        </View>

        {/* Generate Plan Section */}
        <View style={styles.generateSection}>
          <Text style={[
            styles.sectionTitle,
            isDarkMode ? styles.sectionTitleDark : styles.sectionTitleLight
          ]}>
            Generate Plan
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={[
              styles.inputLabel,
              isDarkMode ? styles.inputLabelDark : styles.inputLabelLight
            ]}>
              Add any specific preferences (optional):
            </Text>
            <TouchableOpacity
              style={[
                styles.inputField,
                isDarkMode ? styles.inputFieldDark : styles.inputFieldLight
              ]}
              onPress={openInputModal}
            >
              <Text style={[
                styles.inputText,
                isDarkMode ? styles.inputTextDark : styles.inputTextLight
              ]}>
                {userInput || 'Tap to add preferences...'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGeneratePlan}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.generateButtonText}>
                Generate Today's Plan
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Plan Display Section */}
        <View style={styles.planSection}>
          <Text style={[
            styles.sectionTitle,
            isDarkMode ? styles.sectionTitleDark : styles.sectionTitleLight
          ]}>
            Today's Plan
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3182ce" />
              <Text style={[
                styles.loadingText,
                isDarkMode ? styles.loadingTextDark : styles.loadingTextLight
              ]}>
                Loading plan...
              </Text>
            </View>
          ) : currentPlan ? (
            <ScrollView style={styles.planScrollView} showsVerticalScrollIndicator={false}>
              {renderPlan()}
            </ScrollView>
          ) : (
            renderEmptyState()
          )}
        </View>
      </View>

      {/* Input Modal */}
      <Modal
        visible={showInputModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[backgroundStyle, styles.modalContainer]}>
          <View style={styles.modalContent}>
            <Text style={[
              styles.modalTitle,
              isDarkMode ? styles.modalTitleDark : styles.modalTitleLight
            ]}>
              Plan Preferences
            </Text>
            <Text style={[
              styles.modalDescription,
              isDarkMode ? styles.modalDescriptionDark : styles.modalDescriptionLight
            ]}>
              Add any specific preferences for your daily plan:
            </Text>
            
            <TextInput
              style={[
                styles.modalInput,
                isDarkMode ? styles.modalInputDark : styles.modalInputLight
              ]}
              value={tempInput}
              onChangeText={setTempInput}
              placeholder="e.g., Focus on coding tasks, include exercise time..."
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={cancelInputModal}
              >
                <Text style={[
                  styles.modalCancelText,
                  isDarkMode ? styles.modalCancelTextDark : styles.modalCancelTextLight
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveInputModal}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  titleDark: {
    color: '#ffffff',
  },
  titleLight: {
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  subtitleLight: {
    color: '#6b7280',
  },
  generateSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#ffffff',
  },
  sectionTitleLight: {
    color: '#000000',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputLabelDark: {
    color: '#d1d5db',
  },
  inputLabelLight: {
    color: '#374151',
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inputFieldDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#374151',
  },
  inputFieldLight: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  inputText: {
    fontSize: 16,
  },
  inputTextDark: {
    color: '#ffffff',
  },
  inputTextLight: {
    color: '#000000',
  },
  generateButton: {
    backgroundColor: '#3182ce',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  planSection: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  loadingTextDark: {
    color: '#d1d5db',
  },
  loadingTextLight: {
    color: '#374151',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateIconDark: {
    color: '#6b7280',
  },
  emptyStateIconLight: {
    color: '#9ca3af',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateTitleDark: {
    color: '#ffffff',
  },
  emptyStateTitleLight: {
    color: '#000000',
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyStateDescriptionDark: {
    color: '#9ca3af',
  },
  emptyStateDescriptionLight: {
    color: '#6b7280',
  },
  planScrollView: {
    flex: 1,
  },
  planContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    marginBottom: 20,
  },
  planDate: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  planDateDark: {
    color: '#ffffff',
  },
  planDateLight: {
    color: '#000000',
  },
  planSummary: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  planSummaryDark: {
    color: '#d1d5db',
  },
  planSummaryLight: {
    color: '#374151',
  },
  objectivesContainer: {
    marginBottom: 20,
  },
  objectivesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  objectivesTitleDark: {
    color: '#ffffff',
  },
  objectivesTitleLight: {
    color: '#000000',
  },
  objectivesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  objectivesTextDark: {
    color: '#d1d5db',
  },
  objectivesTextLight: {
    color: '#374151',
  },
  scheduleContainer: {
    marginTop: 8,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scheduleTitleDark: {
    color: '#ffffff',
  },
  scheduleTitleLight: {
    color: '#000000',
  },
  scheduleItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3182ce',
  },
  scheduleItemDark: {
    backgroundColor: '#2a2a2a',
  },
  scheduleItemLight: {
    backgroundColor: '#ffffff',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  timeTextDark: {
    color: '#60a5fa',
  },
  timeTextLight: {
    color: '#3182ce',
  },
  durationText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  durationTextDark: {
    color: '#9ca3af',
  },
  durationTextLight: {
    color: '#6b7280',
  },
  activityContainer: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTextDark: {
    color: '#ffffff',
  },
  activityTextLight: {
    color: '#000000',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 18,
  },
  notesTextDark: {
    color: '#d1d5db',
  },
  notesTextLight: {
    color: '#374151',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalTitleDark: {
    color: '#ffffff',
  },
  modalTitleLight: {
    color: '#000000',
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalDescriptionDark: {
    color: '#d1d5db',
  },
  modalDescriptionLight: {
    color: '#374151',
  },
  modalInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  modalInputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#374151',
    color: '#ffffff',
  },
  modalInputLight: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    color: '#000000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
  },
  modalSaveButton: {
    backgroundColor: '#3182ce',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelTextDark: {
    color: '#d1d5db',
  },
  modalCancelTextLight: {
    color: '#374151',
  },
  modalSaveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DayPlanScreen;