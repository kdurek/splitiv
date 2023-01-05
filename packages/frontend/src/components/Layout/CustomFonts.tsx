import { Global } from "@mantine/core";

import thin from "assets/fonts/poppins-v20-latin-ext-100.woff2";
import extralight from "assets/fonts/poppins-v20-latin-ext-200.woff2";
import light from "assets/fonts/poppins-v20-latin-ext-300.woff2";
import medium from "assets/fonts/poppins-v20-latin-ext-500.woff2";
import semibold from "assets/fonts/poppins-v20-latin-ext-600.woff2";
import bold from "assets/fonts/poppins-v20-latin-ext-700.woff2";
import extrabold from "assets/fonts/poppins-v20-latin-ext-800.woff2";
import black from "assets/fonts/poppins-v20-latin-ext-900.woff2";
import normal from "assets/fonts/poppins-v20-latin-ext-regular.woff2";

export function CustomFonts() {
  return (
    <Global
      styles={[
        {
          "@font-face": {
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: 100,
            src: `url('${thin}') format("woff2")`,
          },
        },
        {
          "@font-face": {
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: 200,
            src: `url('${extralight}') format("woff2")`,
          },
        },
        {
          "@font-face": {
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: 300,
            src: `url('${light}') format("woff2")`,
          },
        },
        {
          "@font-face": {
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: 400,
            src: `url('${normal}') format("woff2")`,
          },
        },
        {
          "@font-face": {
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: 500,
            src: `url('${medium}') format("woff2")`,
          },
        },
        {
          "@font-face": {
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: 600,
            src: `url('${semibold}') format("woff2")`,
          },
        },
        {
          "@font-face": {
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: 700,
            src: `url('${bold}') format("woff2")`,
          },
        },
        {
          "@font-face": {
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: 800,
            src: `url('${extrabold}') format("woff2")`,
          },
        },
        {
          "@font-face": {
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: 900,
            src: `url('${black}') format("woff2")`,
          },
        },
      ]}
    />
  );
}
