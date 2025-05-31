import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { 
  FlatList, 
  Image, 
  SafeAreaView, 
  StatusBar, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Dimensions,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const stories = [
  {
    id: '1',
    name: 'Kitty 🐱✨🦒',
    time: '1 hour ago',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    hasNewStory: true,
  },
  {
    id: '2',
    name: 'Jenny Wilson',
    time: '13 minutes ago',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    hasNewStory: true,
  },
  {
    id: '3',
    name: 'Jack Smith',
    time: '05 minutes ago',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    hasNewStory: false,
  },
  {
    id: '4',
    name: 'Ronald Richards',
    time: '01 minute ago',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    hasNewStory: true,
  },
  {
    id: '5',
    name: 'Sarah Connor',
    time: '2 hours ago',
    image: 'https://randomuser.me/api/portraits/women/5.jpg',
    hasNewStory: false,
  },
  {
    id: '6',
    name: 'Mike Johnson',
    time: '3 hours ago',
    image: 'https://randomuser.me/api/portraits/men/6.jpg',
    hasNewStory: true,
  },
];

export default function Updates() {
  const insets = useSafeAreaInsets();
  

  const handleStoryPress = (item: Story) => {
    console.log('Story pressed:', item.name);
    // Handle story press logic here
  };

  const handleCameraPress = () => {
    console.log('Camera pressed');
    // Handle camera press logic here
  };

  const handleMyStatusPress = () => {
    console.log('My status pressed');
    // Handle my status press logic here
  };

  type Story = {
    id: string;
    name: string;
    time: string;
    image: string;
    hasNewStory: boolean;
  };

  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity 
      style={styles.storyItem}
      onPress={() => handleStoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={[
            styles.avatar,
            { borderColor: item.hasNewStory ? '#25D366' : '#E5E5E5' }
          ]} 
        />
        {item.hasNewStory && <View style={styles.statusDot} />}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff" 
        translucent={false}
      />

      {/* My Status Section */}
      <TouchableOpacity 
        style={styles.myStatusContainer}
        onPress={handleMyStatusPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
            style={[styles.avatar, styles.myAvatar]}
          />
          <View style={styles.addStatusIcon}>
            <Ionicons name="add" size={16} color="#fff" />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>My Status</Text>
          <Text style={styles.time}>Tap to add status update</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Recent Stories Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.recentText}>Recent Updates</Text>
      </View>

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={renderStoryItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer, 
          { paddingBottom: Math.max(insets.bottom + 80, 120) }
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[
          styles.fab,
          { 
            bottom: Math.max(insets.bottom + 20, 90),
          }
        ]}
        onPress={handleCameraPress}
        activeOpacity={0.8}
      >
        <Ionicons name="camera" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  myStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 22,
    backgroundColor: '#fff',
    marginTop:20,
  },
  storyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
   
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: screenWidth < 375 ? 48 : 52,
    height: screenWidth < 375 ? 48 : 52,
    borderRadius: screenWidth < 375 ? 24 : 26,
    borderWidth: 2,
  },
  myAvatar: {
    borderColor: '#E5E5E5',
  },
  addStatusIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#25D366',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#25D366',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: screenWidth < 375 ? 15 : 16,
    color: '#000',
    marginBottom: 2,
  },
  time: {
    color: '#8E8E93',
    fontSize: screenWidth < 375 ? 12 : 13,
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
  },
  recentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    paddingBottom: 20, // Will be overridden by dynamic padding
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5E5',
    marginLeft: screenWidth < 375 ? 76 : 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    // bottom will be set dynamically based on safe area
    backgroundColor: '#25D366',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#25D366',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

// Optional: Add responsive hook for dynamic styling
export const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    isSmallScreen: dimensions.width < 375,
    isTablet: dimensions.width >= 768,
  };
};