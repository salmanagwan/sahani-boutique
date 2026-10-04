import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Note } from '@/types';
import { BorderRadius, Colors, Fonts, Typography } from '@/constants/theme';
import { formatDateTime } from '@/utils/helpers';

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (content: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

// A simple staff journal: dated entries, newest last, with a composer underneath.
export function NotesSection({ notes, onAddNote, onUpdateNote, onDeleteNote }: NotesSectionProps) {
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const add = () => {
    if (!draft.trim()) return;
    onAddNote(draft.trim());
    setDraft('');
  };

  const saveEdit = () => {
    if (editingId && editContent.trim()) onUpdateNote(editingId, editContent.trim());
    setEditingId(null);
    setEditContent('');
  };

  const remove = (noteId: string) => {
    if (Platform.OS === 'web') {
      // Browsers can't show a native confirm here, so ask inline.
      setConfirmingId(noteId);
      return;
    }
    Alert.alert('Delete this note?', 'It will be removed for everyone.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteNote(noteId) },
    ]);
  };

  return (
    <View>
      <Text style={styles.heading}>Staff notes</Text>

      {notes.length === 0 ? <Text style={styles.empty}>No notes yet.</Text> : null}

      {notes.map((note) => (
        <View key={note.id} style={styles.entry}>
          <Text style={styles.date}>{formatDateTime(note.createdAt)}</Text>
          {editingId === note.id ? (
            <>
              <TextInput
                style={[styles.input, styles.editInput]}
                value={editContent}
                onChangeText={setEditContent}
                multiline
                autoFocus
              />
              <View style={styles.actions}>
                <Pressable onPress={() => setEditingId(null)} hitSlop={8}>
                  <Text style={styles.action}>Cancel</Text>
                </Pressable>
                <Pressable onPress={saveEdit} hitSlop={8}>
                  <Text style={[styles.action, styles.actionStrong]}>Save</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.content}>{note.content}</Text>
              <View style={styles.actions}>
                {confirmingId === note.id ? (
                  <>
                    <Text style={styles.confirmText}>Delete this note?</Text>
                    <Pressable onPress={() => setConfirmingId(null)} hitSlop={8}>
                      <Text style={styles.action}>Keep</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setConfirmingId(null);
                        onDeleteNote(note.id);
                      }}
                      hitSlop={8}
                    >
                      <Text style={[styles.action, { color: Colors.error }]}>Delete</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable
                      onPress={() => {
                        setEditingId(note.id);
                        setEditContent(note.content);
                      }}
                      hitSlop={8}
                    >
                      <Text style={styles.action}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => remove(note.id)} hitSlop={8}>
                      <Text style={styles.action}>Delete</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      ))}

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a note for the team"
          placeholderTextColor={Colors.placeholder}
          multiline
        />
        <Pressable
          onPress={add}
          disabled={!draft.trim()}
          style={[styles.addButton, !draft.trim() && { opacity: 0.35 }]}
          accessibilityRole="button"
        >
          <Text style={styles.addText}>Add note</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...Typography.label,
    fontSize: 9.5,
    color: Colors.tertiaryText,
    marginBottom: 6,
  },
  empty: {
    ...Typography.subhead,
    color: Colors.tertiaryText,
    paddingVertical: 8,
  },
  entry: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  date: {
    ...Typography.caption1,
    color: Colors.tertiaryText,
  },
  content: {
    ...Typography.callout,
    color: Colors.primaryText,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 18,
    marginTop: 8,
  },
  action: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 0.4,
    color: Colors.secondaryText,
  },
  actionStrong: {
    color: Colors.primaryText,
  },
  confirmText: {
    ...Typography.caption1,
    color: Colors.secondaryText,
    marginRight: 'auto',
  },
  // Box for the note, with the button underneath on the right.
  composer: {
    gap: 10,
    marginTop: 16,
  },
  input: {
    ...Typography.callout,
    color: Colors.primaryText,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 88,
    maxHeight: 160,
    textAlignVertical: 'top',
  },
  editInput: {
    marginTop: 8,
    flex: 0,
  },
  addButton: {
    alignSelf: 'flex-end',
    height: 44,
    paddingHorizontal: 22,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    ...Typography.button,
    color: Colors.onInk,
  },
});
