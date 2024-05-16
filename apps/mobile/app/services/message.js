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

import React from "react";
import { Platform } from "react-native";
import { verifyUser } from "../screens/settings/functions";
import { useMessageStore } from "../stores/use-message-store";
import {
  eOpenLoginDialog,
  eOpenRateDialog,
  eOpenRecoveryKeyDialog
} from "../utils/events";
import { eSendEvent, presentSheet } from "./event-manager";
import PremiumService from "./premium";
import SettingsService from "./settings";
import { Update } from "../components/sheets/update";

const rateAppMessage = {
  visible: true,
  message: "We would love to know what you think",
  actionText:
    "Rate Notesnook on " +
    `${Platform.OS === "ios" ? "App store" : "Play store"}`,
  onPress: () => {
    eSendEvent(eOpenRateDialog);
  },
  data: {},
  icon: "star",
  type: "normal"
};

export function setRateAppMessage() {
  useMessageStore.getState().setMessage(rateAppMessage);
}

const recoveryKeyMessage = {
  visible: true,
  message: "Keep your data safe",
  actionText: "Save your account recovery key",
  onPress: () => {
    verifyUser(
      null,
      () => {
        eSendEvent(eOpenRecoveryKeyDialog);
      },
      false,
      async () => {
        SettingsService.set({
          recoveryKeySaved: true
        });
        clearMessage();
      },
      "Cancel"
    );
  },
  data: {},
  icon: "key",
  type: "normal"
};

export function setRecoveryKeyMessage() {
  useMessageStore.getState().setMessage(recoveryKeyMessage);
}

const loginMessage = {
  visible: true,
  message: "You are not logged in",
  actionText: "Login to encrypt and sync notes",
  onPress: () => {
    eSendEvent(eOpenLoginDialog);
  },
  data: {},
  icon: "account-outline",
  type: "normal"
};

export function setLoginMessage() {
  useMessageStore.getState().setMessage(loginMessage);
}

const emailMessage = {
  visible: true,
  message: "Email not confirmed",
  actionText: "Please confirm your email to sync notes.",
  onPress: () => {
    PremiumService.showVerifyEmailDialog();
  },
  data: {},
  icon: "email",
  type: "error"
};

export function setEmailVerifyMessage() {
  useMessageStore.getState().setMessage(emailMessage);
}

const noMessage = {
  visible: false,
  message: "",
  actionText: "",
  onPress: null,
  data: {},
  icon: "account-outline"
};

export function clearMessage() {
  useMessageStore.getState().setMessage(noMessage);
}

const autoBackupsOff = {
  visible: true,
  message: "Automatic backups turned off",
  actionText: "Get Notesnook Pro to enable automatic backups",
  onPress: () => {
    clearMessage();
  },
  data: {},
  icon: "backup-restore",
  type: "error"
};

export function setAutobackOffMessage() {
  useMessageStore.getState().setMessage(autoBackupsOff);
}

const updateAvailableMessage = (version) => ({
  visible: true,
  message: "New update available",
  actionText: "Tap here to update to the latest version",
  onPress: () => {
    presentSheet({
      component: (ref) => <Update version={version} fwdRef={ref} />
    });
  },
  data: {},
  icon: "update",
  type: "normal"
});

export function setUpdateAvailableMessage(version) {
  useMessageStore.getState().setMessage(updateAvailableMessage(version));
}
