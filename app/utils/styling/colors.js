import getColorVariety, { getColorVarietyAsync } from "../getColorVariety"

const lightTheme = {
  primaryBackground: '#ffffff', 
  secondaryBackground: '#eee',
  tertiaryBackground: '#eee',
  quaternaryBackground: '#dadada',

  primaryText: '#000',
  secondaryText: '#999',
  tertiaryText: '#D3D3D3',
  actionText: '#616161',
  oppositeText: '#fff',

  primaryBorder: '#D3D3D3',

  navigationSelected: '#444',
  navigationUnselected: '#BBB',

  mediaSeen: '#D3D3D3',
  mediaUnseen: '#999',
  modalBackdrop: "rgba(70,70,70,0.5)",

  // ORANGE THEME
  // primaryColor: '#FFBF00',
  // primaryColorLight: '#fff2cc',
  // primaryColorShadow: '#ba7700',
  // primaryColorDisabledShadow: '#b7a774',
  // primaryColorDisabled: '#ffecb2',
  // secondaryColor: '#05D5FA',
  
  // BLUE THEME
  primaryColor: '#0ba3ff',
  primaryColorLight: '#c9ebff',
  primaryColorShadow: '#005591',
  primaryColorShadowDisabled: '#70878f',
  primaryColorDisabled: '#c9ebff',
  secondaryColor: '#FFBF00',
}

const darkTheme = {
  primaryBackground: '#3A3A3A', 
  secondaryBackground: '#222',
  tertiaryBackground: '#616161',
  quaternaryBackground: '#3A3A3A',

  primaryText: '#fff',
  secondaryText: '#D3D3D3',
  tertiaryText: '#999',
  actionText: '#fff',
  oppositeText: '#fff',

  primaryBorder: '#555',

  navigationSelected: '#fff',
  navigationUnselected: '#999',

  mediaSeen: '#555',
  mediaUnseen: '#D3D3D3',
  modalBackdrop: "rgba(130,130,130,0.5)",

  primaryColor: '#0ba3ff',
  primaryColorLight: '#c9ebff',
  primaryColorShadow: '#0b4eff',
  primaryColorShadowDisabled: '#70878f',
  primaryColorDisabled: '#c9ebff',
  secondaryColor: '#FFBF00',
}

export const currentTheme = 'dark'

const theme = {
  'light': lightTheme,
  'dark': darkTheme,
}

export const gen = {
  primaryColor: theme[currentTheme].primaryColor,
  primaryColorLight: theme[currentTheme].primaryColorLight,
  primaryColorShadow: theme[currentTheme].primaryColorShadow,
  primaryColorShadowDisabled: theme[currentTheme].primaryColorShadowDisabled,
  primaryColorDisabled: theme[currentTheme].primaryColorDisabled,
  secondaryColor: theme[currentTheme].secondaryColor,

  blue: theme[currentTheme].primaryColor,
  lightBlue: theme[currentTheme].primaryColorLight,
  red: '#F88379',
  orange: '#FFBF00',

  heckaGray: '#333333',
  heckaGray2: '#444444',
  darkGray: '#616161',
  darkishGray: '#999',
  gray: '#AAA',
  gray2: '#CCC',
  lightGray: '#D3D3D3',
  lightestGray: '#eee',

  navy: '#002E5D',
  maroon: '#831515',

  primaryBackground: theme[currentTheme].primaryBackground,
  secondaryBackground: theme[currentTheme].secondaryBackground,
  tertiaryBackground: theme[currentTheme].tertiaryBackground,
  quaternaryBackground: theme[currentTheme].quaternaryBackground,

  primaryText: theme[currentTheme].primaryText,
  secondaryText: theme[currentTheme].secondaryText,
  tertiaryText: theme[currentTheme].tertiaryText,
  actionText: theme[currentTheme].actionText,
  oppositeText: theme[currentTheme].oppositeText,

  navigationSelected: theme[currentTheme].navigationSelected,
  navigationUnselected: theme[currentTheme].navigationUnselected,

  mediaSeen: theme[currentTheme].mediaSeen,
  mediaUnseen: theme[currentTheme].mediaUnseen,
  modalBackdrop: theme[currentTheme].modalBackdrop,

  primaryBorder: theme[currentTheme].primaryBorder,
}

// export const useTheme = () => {
//   const [currentTheme, setCurrentTheme] = useState('dark');

//   useEffect(() => {
//     const getTheme = async () => {
//       const storedTheme = await AsyncStorage.getItem('theme');
//       if (storedTheme) {
//         setCurrentTheme(storedTheme);
//       }
//     };

//     getTheme();
//   }, []);

//   return theme[currentTheme];
// };
