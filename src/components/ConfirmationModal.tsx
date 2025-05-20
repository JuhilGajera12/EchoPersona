import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import {useColors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isDanger?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading,
  isDanger = false,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>{message}</Text>
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onCancel}
                  disabled={isLoading}>
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    isDanger ? styles.dangerButton : styles.confirmButton,
                    isLoading && styles.disabledButton,
                  ]}
                  onPress={onConfirm}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={isDanger ? colors.white : colors.black}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.confirmButtonText,
                        isDanger && styles.dangerButtonText,
                      ]}>
                      {confirmText}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: wp(80),
      backgroundColor: colors.white,
      borderRadius: wp(4),
      overflow: 'hidden',
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      paddingTop: hp(3),
      paddingHorizontal: wp(5),
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: fontSize(20),
      fontFamily: fonts.bold,
      color: colors.black,
      textAlign: 'center',
    },
    modalBody: {
      paddingTop: hp(2),
      paddingBottom: hp(3),
      paddingHorizontal: wp(5),
    },
    modalMessage: {
      fontSize: fontSize(16),
      fontFamily: fonts.regular,
      color: colors.black,
      textAlign: 'center',
    },
    modalFooter: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.lightGray,
    },
    modalButton: {
      flex: 1,
      paddingVertical: hp(2),
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      borderRightWidth: 1,
      borderRightColor: colors.lightGray,
    },
    confirmButton: {
      backgroundColor: colors.gold,
    },
    dangerButton: {
      backgroundColor: colors.error,
    },
    disabledButton: {
      opacity: 0.7,
    },
    cancelButtonText: {
      fontSize: fontSize(16),
      fontFamily: fonts.bold,
      color: colors.black,
    },
    confirmButtonText: {
      fontSize: fontSize(16),
      fontFamily: fonts.bold,
      color: colors.white,
    },
    dangerButtonText: {
      color: colors.white,
    },
  });

export default ConfirmationModal;
