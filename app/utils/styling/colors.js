const lightTheme = {
  primaryBackground: '#fff', 
  secondaryBackground: '#eee',
  tertiaryBackground: '#eee',

  primaryText: '#000',
  secondaryText: '#999',
  tertiaryText: '#D3D3D3',
  actionText: '#616161',

  primaryBorder: '#D3D3D3',

  navigationSelected: '#444',
  navigationUnselected: '#BBB',

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
  primaryColorDisabledShadow: '#70878f',
  primaryColorDisabled: '#c9ebff',
  secondaryColor: '#FFBF00',
}

const darkTheme = {
  primaryBackground: '#3A3A3A', 
  secondaryBackground: '#222',
  tertiaryBackground: '#616161',

  primaryText: '#fff',
  secondaryText: '#D3D3D3',
  tertiaryText: '#999',
  actionText: '#fff',

  primaryBorder: '#555',

  navigationSelected: '#fff',
  navigationUnselected: '#999',

  primaryColor: '#0ba3ff',
  primaryColorLight: '#c9ebff',
  primaryColorShadow: '#005591',
  primaryColorDisabledShadow: '#70878f',
  primaryColorDisabled: '#c9ebff',
  secondaryColor: '#FFBF00',
}

export const currentTheme = 'dark'

const theme = {
  'light': lightTheme,
  'dark': darkTheme,
}

export const gen = {
  // orange: '#FFBF00',
  // lightOrange: '#fff2cc',
  // shadowOrange: '#ba7700',
  // orangeDisabled: '#ffecb2',
  primaryColor: theme[currentTheme].primaryColor,
  primaryColorLight: theme[currentTheme].primaryColorLight,  
  primaryColorShadow: theme[currentTheme].primaryColorShadow,
  primaryColorDisabledShadow: theme[currentTheme].primaryColorDisabledShadow,
  primaryColorDisabled: theme[currentTheme].primaryColorDisabled,
  secondaryColor: theme[currentTheme].secondaryColor,

  blue: theme[currentTheme].secondaryColor,
  red: '#F88379',
  orange: '#FFBF00',
  blue: '#05D5FA',

  heckaGray: '#333',
  heckaGray2: '#444',
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

  primaryText: theme[currentTheme].primaryText,
  secondaryText: theme[currentTheme].secondaryText,
  tertiaryText: theme[currentTheme].tertiaryText,
  actionText: theme[currentTheme].actionText,

  navigationSelected: theme[currentTheme].navigationSelected,
  navigationUnselected: theme[currentTheme].navigationUnselected,

  primaryBorder: theme[currentTheme].primaryBorder,
}
