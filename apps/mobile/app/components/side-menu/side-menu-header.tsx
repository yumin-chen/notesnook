/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { useThemeColors } from "@notesnook/theme";
import React from "react";
import { View } from "react-native";
import { useThemeStore } from "../../stores/use-theme-store";
import { SIZE } from "../../utils/size";
import { DefaultAppStyles } from "../../utils/styles";
import { IconButton, IconButtonProps } from "../ui/icon-button";
import { SvgView } from "../ui/svg";
import Heading from "../ui/typography/heading";

export const SideMenuHeader = (props: { rightButtons?: IconButtonProps[] }) => {
  const { colors, isDark } = useThemeColors();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: DefaultAppStyles.GAP
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: DefaultAppStyles.GAP_SMALL,
          alignItems: "center"
        }}
      >
        <View
          style={{
            backgroundColor: "black",
            width: 28,
            height: 28,
            borderRadius: 10
          }}
        >
          <SvgView
            width={28}
            height={28}
            src={`<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_24_33)">
<path d="M1024 0H0V1024H1024V0Z" fill="black"/>
<path d="M724.985 682.919C707.73 733.33 673.15 775.984 627.397 803.291C581.645 830.598 527.687 840.787 475.128 832.044C422.568 823.301 374.814 796.194 340.365 755.546C305.916 714.898 287.006 663.347 287 610.064V499.814L366.121 532.867V610.019C366.114 630.798 370.555 651.337 379.145 670.256C387.735 689.176 400.276 706.037 415.925 719.707C418.895 722.294 421.978 724.814 425.161 727.166C448.518 744.554 476.563 754.518 505.655 755.763C506.645 755.763 507.601 755.842 508.58 755.864C509.559 755.887 510.83 755.864 511.955 755.864C513.08 755.864 514.205 755.864 515.33 755.864C516.455 755.864 517.265 755.864 518.255 755.763C547.336 754.515 575.371 744.56 598.726 727.188C601.899 724.837 604.981 722.328 607.963 719.741C628.519 701.761 643.619 678.375 651.545 652.241L724.985 682.919Z" fill="white"/>
<path d="M737 414V610.065C737 612.596 737 615.139 736.842 617.67L657.879 584.651V414C657.866 376.316 643.272 340.099 617.154 312.934C591.035 285.77 555.419 269.766 517.765 268.274C480.11 266.782 443.339 279.918 415.154 304.931C386.968 329.944 369.554 364.893 366.56 402.457C366.279 406.26 366.121 410.119 366.121 414V462.712L287 429.637V189H512C571.674 189 628.903 212.705 671.099 254.901C713.295 297.097 737 354.326 737 414Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_24_33">
<rect width="1024" height="1024" rx="200" fill="white"/>
</clipPath>
</defs>
</svg>
`}
          />
        </View>

        <Heading size={SIZE.lg}>Notesnook</Heading>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: DefaultAppStyles.GAP_SMALL
        }}
      >
        {props.rightButtons?.map((button, index) => (
          <IconButton
            key={index}
            {...button}
            style={{
              width: 28,
              height: 28
            }}
            color={colors.primary.icon}
            size={SIZE.lg}
          />
        ))}

        <IconButton
          onPress={() => {
            useThemeStore.getState().setColorScheme();
          }}
          style={{
            width: 28,
            height: 28
          }}
          color={colors.primary.icon}
          name={isDark ? "weather-night" : "weather-sunny"}
          size={SIZE.lg}
        />
      </View>
    </View>
  );
};
