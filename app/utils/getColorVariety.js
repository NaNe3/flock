import tinycolor from "tinycolor2"
import { getAttributeFromObjectInLocalStorage, getUserIdFromLocalStorage } from "./localStorage";

export const getColorLight = (color) => {
  const colorObj = tinycolor(color);
  const lightenedColor = colorObj.lighten(25);
  return lightenedColor.toHexString();
}

const getColorDisabled = (color) => {
  const colorObj = tinycolor(color);
  const lightenedColor = colorObj.lighten(20); // Increase the lightness by 30%
  return lightenedColor.toHexString();
};

const getColorShadow = (color) => {
  const colorObj = tinycolor(color);
  const darkenedColor = colorObj.darken(20); // Decrease the lightness by 20%
  return darkenedColor.toHexString();
};

const getColorShadowDisabled = (color) => {
  const colorObj = tinycolor(color);
  const darkened = colorObj.darken(20); // Increase the lightness by 20%
  const lightenedColor = darkened.lighten(30); // Increase the lightness by 20%
  return lightenedColor.toHexString();
}

export default function getColorVariety(color) {
  const primaryColor = color
  const primaryColorDisabled = getColorDisabled(primaryColor)
  const primaryColorShadow = getColorShadow(primaryColor)
  const primaryColorShadowDisabled = getColorShadowDisabled(primaryColor)

  return {
    primaryColor,
    primaryColorDisabled,
    primaryColorShadow,
    primaryColorShadowDisabled,
  }
}

export const getPrimaryColor = async () => {
  return (await getAttributeFromObjectInLocalStorage('user_information', 'color')).color_hex
}

export async function getColorVarietyAsync() {
  const primaryColor = await getPrimaryColor()
  const primaryColorLight = getColorLight(primaryColor)
  const primaryColorDisabled = getColorDisabled(primaryColor)
  const primaryColorShadow = getColorShadow(primaryColor)
  const primaryColorShadowDisabled = getColorShadowDisabled(primaryColor)

  return {
    primaryColor,
    primaryColorLight,
    primaryColorDisabled,
    primaryColorShadow,
    primaryColorShadowDisabled,
  }
}