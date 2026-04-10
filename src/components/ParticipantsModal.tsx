import { X } from "lucide-react-native";
import React from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { theme } from "../theme";

const T = theme.colors;

export type Participant = {
  id: string;
  name?: string;
  initials: string;
  isOwner: boolean;
};

type ParticipantsModalProps = {
  visible: boolean;
  participants: Participant[];
  onClose: () => void;
};

export function ParticipantsModal({
  visible,
  participants,
  onClose,
}: ParticipantsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.content, { backgroundColor: T.bgCardRaised }]}
          onPress={() => {}}
        >
          {/* CABEÇALHO */}
          <View style={[styles.header, { borderBottomColor: T.border }]}>
            <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
              Galera do Evento
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [pressed && { opacity: 0.5 }]}
            >
              <X size={24} color={T.textSecondary} />
            </Pressable>
          </View>

          {/* LISTA SCROLLÁVEL */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 400 }}
          >
            {participants.map((p) => (
              <View
                key={p.id}
                style={[styles.participantRow, { borderBottomColor: T.border }]}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: p.isOwner ? T.primary : T.bgCard },
                  ]}
                >
                  <Text
                    style={[
                      theme.textStyles.subheadline,
                      {
                        fontWeight: "bold",
                        color: p.isOwner ? T.textOnLime : T.textPrimary,
                      },
                    ]}
                  >
                    {p.initials}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      theme.textStyles.body,
                      {
                        color: T.textPrimary,
                        fontWeight: p.isOwner ? "bold" : "normal",
                      },
                    ]}
                  >
                    {p.name || p.initials}
                  </Text>
                  {p.isOwner && (
                    <Text
                      style={[
                        theme.textStyles.footnote,
                        { color: T.textSecondary },
                      ]}
                    >
                      Organizador(a)
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  content: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: theme.spacing[4],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing[8],
    borderBottomWidth: 1,
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    borderBottomWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing[4],
  },
});
