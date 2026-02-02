import { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Sharing from 'expo-sharing';
import DoodleScreen from './DoodleScreen';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [photo, setPhoto] = useState(null);
  const [doodleMode, setDoodleMode] = useState(false);
  const [doodleUri, setDoodleUri] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need camera access to take photos
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setPhoto(result);
      setDoodleMode(true);
    } catch (e) {
      console.warn('Error taking picture:', e);
    }
  };

  const flipCamera = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const sendToPartner = async () => {
    setShowSendModal(false);
    const uriToShare = doodleUri || photo?.uri;
    if (uriToShare) {
      try {
        await Sharing.shareAsync(uriToShare, { mimeType: 'image/jpeg' });
      } catch (e) {
        console.warn('Error sharing:', e);
      }
    }
  };

  const keepPhoto = () => {
    setShowSendModal(false);
  };

  const handleDoodleDone = (flattenedUri) => {
    setDoodleUri(flattenedUri);
    setDoodleMode(false);
    setShowSendModal(true);
  };

  const handleDoodleBack = () => {
    setDoodleMode(false);
    setPhoto(null);
  };

  if (doodleMode && photo) {
    return (
      <DoodleScreen
        photoUri={photo.uri}
        onDone={handleDoodleDone}
        onBack={handleDoodleBack}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <SafeAreaView style={styles.overlay}>
          <View style={styles.bottomBar}>
            {/* Bottom left: last photo thumbnail */}
            <TouchableOpacity
              style={styles.thumbnailButton}
              onPress={() => {
                if (doodleUri) setShowSendModal(true);
                else if (photo) setDoodleMode(true);
              }}
            >
              {photo ? (
                <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Text style={styles.thumbnailPlaceholderText}>🖼</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Bottom middle: capture button */}
            <TouchableOpacity style={styles.captureOuter} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>

            {/* Bottom right: flip camera */}
            <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
              <Text style={styles.flipIcon}>🔄</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>

      {/* Send to partner modal */}
      <Modal visible={showSendModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {(doodleUri || photo) && (
              <Image
                source={{ uri: doodleUri || photo.uri }}
                style={styles.previewImage}
              />
            )}

            <Text style={styles.modalTitle}>Send this to your partner?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.keepButton} onPress={keepPhoto}>
                <Text style={styles.keepButtonText}>Keep it</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sendButton} onPress={sendToPartner}>
                <Text style={styles.sendButtonText}>♥ Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 30,
  },

  // Thumbnail (bottom left)
  thumbnailButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  thumbnailPlaceholderText: {
    fontSize: 20,
  },

  // Capture button (bottom middle)
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },

  // Flip button (bottom right)
  flipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipIcon: {
    fontSize: 24,
  },

  // Permission screen
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#FF4081',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 12,
    marginBottom: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  keepButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  keepButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#FF4081',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
