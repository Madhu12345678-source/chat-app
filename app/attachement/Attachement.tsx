
// import React from 'react';
// import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { Ionicons, Entypo, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// interface Props {
//   visible: boolean;
//   onClose: () => void;
//   onSelect: (type: string) => void;
// }

// export default function AttachmentModal({ visible, onClose, onSelect }: Props) {
//   return (
//     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
//       <View style={styles.overlay}>
//         <View style={styles.container}>
//           <View style={styles.row}>
//             <Option icon="image" color="#4A90E2" label="Gallery" onPress={() => onSelect("gallery")} />
//             <Option icon="camera" color="#D0021B" label="Camera" onPress={() => onSelect("camera")} />
//             <Option icon="location-pin" color="#7ED321" label="Location" iconLib="Entypo" onPress={() => onSelect("location")} />
//             <Option icon="insert-drive-file" color="#9B9B9B" label="Document" iconLib="MaterialIcons" onPress={() => onSelect("document")} />
//             <Option icon="headphones" color="#F5A623" label="Audio" iconLib="FontAwesome5" onPress={() => onSelect("audio")} />
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const Option = ({ icon, color, label, onPress, iconLib = "Ionicons" }: { icon: string; color: string; label: string; onPress: () => void; iconLib?: "Ionicons" | "Entypo" | "FontAwesome5" | "MaterialIcons" }) => {
//   const Icon = {
//     Ionicons,
//     Entypo,
//     FontAwesome5,
//     MaterialIcons,
//   }[iconLib] as React.ComponentType<{ name: string; size: number; color: string }>;

//   return (
//     <TouchableOpacity style={styles.option} onPress={onPress}>
//       <View style={[styles.iconCircle, { backgroundColor: color }]}>
//         <Icon name={icon} size={22} color="#fff" />
//       </View>
//       <Text style={styles.label}>{label}</Text>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   container: {
//     backgroundColor: "#1e1e1e",
//     padding: 15,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//   },
//   option: {
//     alignItems: "center",
//   },
//   iconCircle: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 5,
//   },
//   label: {
//     color: "#fff",
//     fontSize: 12,
//   },
// });
//-----------------------------------------------
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Entypo, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
}

export default function AttachmentModal({ visible, onClose, onSelect }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Attach</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.row}>
            <Option 
              icon="image" 
              color="#4A90E2" 
              label="Gallery" 
              onPress={() => onSelect("gallery")} 
            />
            <Option 
              icon="camera" 
              color="#D0021B" 
              label="Camera" 
              onPress={() => onSelect("camera")} 
            />
            <Option 
              icon="location-pin" 
              color="#7ED321" 
              label="Location" 
              iconLib="Entypo" 
              onPress={() => onSelect("location")} 
            />
          </View>
          
          <View style={styles.row}>
            <Option 
              icon="insert-drive-file" 
              color="#9B9B9B" 
              label="Document" 
              iconLib="MaterialIcons" 
              onPress={() => onSelect("document")} 
            />
            <Option 
              icon="headphones" 
              color="#F5A623" 
              label="Audio" 
              iconLib="FontAwesome5" 
              onPress={() => onSelect("audio")} 
            />
            <View style={styles.option}></View> {/* Empty slot for alignment */}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const Option = ({ 
  icon, 
  color, 
  label, 
  onPress, 
  iconLib = "Ionicons" 
}: { 
  icon: string; 
  color: string; 
  label: string; 
  onPress: () => void; 
  iconLib?: "Ionicons" | "Entypo" | "FontAwesome5" | "MaterialIcons" 
}) => {
  const Icon = {
    Ionicons,
    Entypo,
    FontAwesome5,
    MaterialIcons,
  }[iconLib] as React.ComponentType<{ name: string; size: number; color: string }>;
  
  return (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Icon name={icon} size={22} color="#fff" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  option: {
    alignItems: "center",
    width: '30%',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    color: "#fff",
    fontSize: 12,
  },
});
