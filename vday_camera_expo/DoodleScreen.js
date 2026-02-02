import { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  PanResponder,
  Dimensions,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const COLORS = ['#FFFFFF', '#FF1744', '#FF80AB', '#FFEB3B', '#2979FF', '#00E676'];

export default function DoodleScreen({ photoUri, onDone, onBack }) {
  const [strokes, setStrokes] = useState([]);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [textLabel, setTextLabel] = useState(null); // { x, y, text, color }
  const [editingText, setEditingText] = useState(false);
  const [textDraft, setTextDraft] = useState('');
  const colorRef = useRef(currentColor);
  const currentPath = useRef('');
  const canvasRef = useRef(null);
  const textInputRef = useRef(null);

  const updateColor = (c) => {
    setCurrentColor(c);
    colorRef.current = c;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current = `M ${locationX},${locationY}`;
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current += ` L ${locationX},${locationY}`;
        setStrokes((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.building) {
            updated[updated.length - 1] = {
              d: currentPath.current,
              color: colorRef.current,
              building: true,
            };
          } else {
            updated.push({
              d: currentPath.current,
              color: colorRef.current,
              building: true,
            });
          }
          return updated;
        });
      },
      onPanResponderRelease: () => {
        setStrokes((prev) =>
          prev.map((s) => (s.building ? { d: s.d, color: s.color, building: false } : s)),
        );
        currentPath.current = '';
      },
    }),
  ).current;

  const textPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        setTextLabel((prev) => (prev ? { ...prev, x: pageX, y: pageY } : prev));
      },
    }),
  ).current;

  const undo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const addTextLabel = () => {
    setTextDraft('');
    setEditingText(true);
    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  const confirmText = () => {
    Keyboard.dismiss();
    setEditingText(false);
    if (textDraft.trim()) {
      setTextLabel({
        x: SCREEN_W / 2,
        y: SCREEN_H / 3,
        text: textDraft.trim(),
        color: colorRef.current,
      });
    }
  };

  const removeTextLabel = () => {
    setTextLabel(null);
  };

  const handleDone = async () => {
    try {
      const uri = await captureRef(canvasRef, {
        format: 'jpg',
        quality: 0.9,
      });
      onDone(uri);
    } catch (e) {
      console.warn('Error capturing doodle:', e);
    }
  };

  return (
    <View style={styles.container}>
      <View ref={canvasRef} style={styles.canvas} collapsable={false}>
        <Image source={{ uri: photoUri }} style={styles.photo} />
        {/* SVG display layer — no touch handling */}
        <Svg
          style={StyleSheet.absoluteFill}
          width={SCREEN_W}
          height={SCREEN_H}
          pointerEvents="none"
        >
          {strokes.map((stroke, i) => (
            <Path
              key={i}
              d={stroke.d}
              stroke={stroke.color}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
        {/* Text label (draggable) */}
        {textLabel && (
          <View
            style={[
              styles.textLabelWrapper,
              { left: textLabel.x - 100, top: textLabel.y - 20 },
            ]}
            {...textPanResponder.panHandlers}
          >
            <Text style={[styles.textLabelText, { color: textLabel.color }]}>
              {textLabel.text}
            </Text>
          </View>
        )}
        {/* Touch layer for drawing — sits on top, transparent */}
        {!editingText && (
          <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
        )}
      </View>

      {/* Text editing overlay */}
      {editingText && (
        <View style={styles.textEditOverlay}>
          <TextInput
            ref={textInputRef}
            style={[styles.textInput, { color: currentColor }]}
            value={textDraft}
            onChangeText={setTextDraft}
            placeholder="Type here..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            autoFocus
            onSubmitEditing={confirmText}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.textConfirmButton} onPress={confirmText}>
            <Text style={styles.textConfirmText}>Place</Text>
          </TouchableOpacity>
        </View>
      )}

      <SafeAreaView style={styles.toolbar} pointerEvents="box-none">
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>X</Text>
        </TouchableOpacity>

        <View style={styles.colors}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => updateColor(color)}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                currentColor === color && styles.colorDotSelected,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.undoButton} onPress={undo}>
          <Text style={styles.undoText}>Undo</Text>
        </TouchableOpacity>

        {!textLabel ? (
          <TouchableOpacity style={styles.textButton} onPress={addTextLabel}>
            <Text style={styles.textButtonText}>Aa</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.textButton} onPress={removeTextLabel}>
            <Text style={styles.textButtonText}>Aa</Text>
            <View style={styles.textButtonX}>
              <Text style={styles.textButtonXText}>x</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  canvas: {
    flex: 1,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_W,
    height: SCREEN_H,
    resizeMode: 'cover',
  },
  textLabelWrapper: {
    position: 'absolute',
    width: 200,
    alignItems: 'center',
    zIndex: 5,
  },
  textLabelText: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textEditOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    gap: 16,
  },
  textInput: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    width: '80%',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 8,
  },
  textConfirmButton: {
    backgroundColor: '#FF4081',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  colors: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: '#fff',
    borderWidth: 3,
  },
  undoButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  undoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  textButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  textButtonX: {
    marginLeft: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF1744',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButtonXText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF4081',
  },
  doneText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
