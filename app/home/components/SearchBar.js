import { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../../hooks/ThemeProvider';

export default function SearchBar({
  placeholder = 'Search...',
  query, 
  setQuery 
}) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const [localQuery, setLocalQuery] = useState('');
  const [typingInterval, setTypingInterval] = useState(null);

  useEffect(() => {
    if (typingInterval) clearTimeout(typingInterval);
    const newTypingInterval = setTimeout(() => {
      setQuery(localQuery);
    }, 300);
    setTypingInterval(newTypingInterval);
    return () => clearTimeout(newTypingInterval);
  }, [localQuery]);

  const handleClear = () => {
    setLocalQuery('')
    setQuery('')
  };

  const handleChangeText = (text) => {
    setLocalQuery(text);
  };

  return (
    <View style={styles.searchBar}>
      <Icon name="search" size={20} color="gray" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="gray"
        value={localQuery}
        onChangeText={handleChangeText}
      />
      {query.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Icon name="times-circle" size={20} color="gray" style={styles.clearIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function style(theme) {
  return StyleSheet.create({
    searchBar: {
      flex: 1,
      height: '100%',
      backgroundColor: theme.secondaryBackground,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      color: theme.primaryText,
      fontFamily: 'nunito-bold',
    },
    clearButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}