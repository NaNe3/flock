export const constants = {
  blue: '#0ba3ff',
  lightBlue: '#c9ebff',
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
}

export const classic = {
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

// export const currentTheme = 'light'

export const themes = {
  'light': {...classic, ...constants},
  'dark': {...darkTheme, ...constants}
}
