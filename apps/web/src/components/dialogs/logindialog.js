import React, { useState } from "react";
import { Flex, Button, Text } from "rebass";
import * as Icon from "../icons";
import Dialog, { showDialog } from "./dialog";
import { showSignUpDialog } from "./signupdialog";
import { useStore } from "../../stores/user-store";
import Field from "../field";

const requiredValues = ["username", "password"];
function LoginDialog(props) {
  const { onClose } = props;
  const [error, setError] = useState();
  const isLoggingIn = useStore((store) => store.isLoggingIn);
  const login = useStore((store) => store.login);

  return (
    <Dialog
      isOpen={true}
      title={"Sign in to Your Account"}
      description={
        <Flex alignItems="center">
          <Text as="span" fontSize="body" color="gray">
            Don't have an account?{" "}
            <Button
              variant="anchor"
              sx={{ textAlign: "left" }}
              fontSize="body"
              onClick={showSignUpDialog}
            >
              Create an account here.
            </Button>
          </Text>
        </Flex>
      }
      icon={Icon.Login}
      onClose={onClose}
      scrollable
      negativeButton={{ text: "Cancel", onClick: onClose }}
      positiveButton={{
        props: {
          form: "loginForm",
          type: "submit",
        },
        text: "Sign in",
        loading: isLoggingIn,
        disabled: isLoggingIn,
      }}
    >
      <Flex
        id="loginForm"
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          const data = requiredValues.reduce((prev, curr) => {
            prev[curr] = e.target[curr].value;
            return prev;
          }, {});

          setError();

          login(data)
            .then(onClose)
            .catch((e) => setError(e.message));
        }}
        flexDirection="column"
      >
        <Field
          autoFocus
          required
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
        />
        <Field
          required
          id="password"
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          sx={{ mt: 1 }}
        />
        {error && <Text variant="error">{error}</Text>}
      </Flex>
    </Dialog>
  );
}

export const showLogInDialog = () => {
  return showDialog((perform) => <LoginDialog onClose={() => perform()} />);
};
