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
import {
  ThemeAuthor,
  ThemeDefinition,
  ThemeScopes,
  useThemeProvider
} from "@notesnook/theme";
import { Button, Flex, IconButton, Input, Text } from "@theme-ui/components";
import { useRef, useState } from "react";
import Field from "../field";
import Accordion from "../accordion";
import { Close, Download, Reupload } from "../icons";
import { showToast } from "../../utils/toast";
import { debounce } from "@notesnook/common";
import { useStore } from "../../stores/theme-store";
import FileSaver from "file-saver";
import { showFilePicker } from "../editor/picker";

const ThemeInfoTemplate: Omit<
  ThemeDefinition,
  "authors" | "compatibilityVersion" | "colorScheme" | "codeBlockCSS" | "scopes"
> = {
  name: "",
  id: "",
  version: 0,
  license: "",
  homepage: "",
  description: ""
};

function toTitleCase(value: string) {
  return (
    value.slice(0, 1).toUpperCase() +
    value.slice(1).replace(/([A-Z]+)*([A-Z][a-z])/g, "$1 $2")
  );
}

const ColorNames = [
  "accent",
  "paragraph",
  "background",
  "border",
  "heading",
  "icon",
  "separator",
  "placeholder",
  "hover",
  "shade",
  "backdrop",
  "textSelection"
];

const Variants = [
  "primary",
  "secondary",
  "disabled",
  "selected",
  "error",
  "success"
];
const Scopes = [
  "base",
  "statusBar",
  "list",
  "editor",
  "editorToolbar",
  "dialog",
  "navigationMenu",
  "contextMenu",
  "sheet"
];

const RequiredKeys = [
  "version",
  "id",
  "name",
  "license",
  "authors.0.name",
  "authors.0.email",
  "authors.0.url",
  "description",
  "colorScheme",
  "compatibilityVersion",
  "homepage",
  ...Variants.map((variant) =>
    ColorNames.map((colorName) => `scopes.base.${variant}.${colorName}`)
  ).flat()
];

const flatten = (object: { [name: string]: any }) => {
  const flattenedObject: { [name: string]: any } = {};

  for (const innerObj in object) {
    if (typeof object[innerObj] === "object") {
      if (typeof object[innerObj] === "function") continue;

      const newObject = flatten(object[innerObj]);
      for (const key in newObject) {
        flattenedObject[innerObj + "." + key] = newObject[key];
      }
    } else {
      if (typeof object[innerObj] === "function") continue;
      flattenedObject[innerObj] = object[innerObj];
    }
  }
  return flattenedObject;
};

function unflatten(data: any) {
  const result = {};
  for (const i in data) {
    const keys = i.split(".");
    keys.reduce(function (r: any, e, j) {
      return (
        r[e] ||
        (r[e] = isNaN(Number(keys[j + 1]))
          ? keys.length - 1 == j
            ? data[i]
            : {}
          : [])
      );
    }, result);
  }
  return result;
}

export default function ThemeBuilder() {
  const { theme: currentTheme } = useThemeProvider();
  const setTheme = useStore((state) => state.setTheme);
  const [loading, setLoading] = useState(false);
  const currentThemeFlattened = flatten(currentTheme);
  const [authors, setAuthors] = useState(
    currentTheme.authors || [
      {
        name: ""
      }
    ]
  );

  const formRef = useRef(null);

  const onChange: React.FormEventHandler<HTMLDivElement> = debounce(() => {
    if (!formRef.current) return;
    const body = new FormData(formRef.current);
    const flattenedThemeRaw = {
      ...Object.fromEntries(body.entries()),
      ...flatten({ authors: [...authors] })
    };

    const flattenedTheme: { [name: string]: any } = {};

    for (const key in flattenedThemeRaw) {
      if (flattenedThemeRaw[key] === "" || !flattenedThemeRaw[key]) continue;
      flattenedTheme[key] = flattenedThemeRaw[key];
    }

    const missingKeys = [];
    for (const key of RequiredKeys) {
      if (!Object.keys(flattenedTheme).includes(key)) {
        missingKeys.push(key);
      }
    }
    if (missingKeys.length > 0) {
      showToast(
        "error",
        `Failed to apply theme, ${missingKeys.join(
          ","
        )} are missing from the theme.`
      );
      return;
    }

    const invalidColors = [];

    for (const key in flattenedTheme) {
      if (!key.startsWith("scopes")) continue;
      const value = flattenedTheme[key];

      const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/g;
      const HEX_COLOR_REGEX_ALPHA =
        /^#(?:(?:[\da-fA-F]{3}){1,2}|(?:[\da-fA-F]{4}){1,2})$/g;

      if (
        !/hover|shade|backdrop|textSelection/g.test(key) &&
        !HEX_COLOR_REGEX.test(value)
      ) {
        invalidColors.push(key);
      } else if (
        /hover|shade|backdrop|textSelection/g.test(key) &&
        !HEX_COLOR_REGEX_ALPHA.test(value)
      ) {
        invalidColors.push(key);
      }
    }

    if (invalidColors.length > 0) {
      showToast(
        "error",
        `Failed to apply theme, ${invalidColors.join(",")} are invalid.`
      );
      return;
    }

    const theme = unflatten(flattenedTheme);
    setTheme({ ...theme } as ThemeDefinition);
  }, 500);

  const loadThemeFile = async () => {
    const file = await showFilePicker({
      acceptedFileTypes: ".nnbackup,application/json,.json"
    });
    if (!file) return;
    const reader = new FileReader();
    const theme = (await new Promise((resolve) => {
      reader.addEventListener("load", (event) => {
        const text = event.target?.result;
        try {
          resolve(JSON.parse(text as string));
        } catch (e) {
          alert(
            "Error: Could not read the backup file provided. Either it's corrupted or invalid."
          );
          resolve(undefined);
        }
      });
      reader.readAsText(file);
    })) as ThemeDefinition | undefined;
    if (
      !theme ||
      !theme.scopes ||
      !theme.compatibilityVersion ||
      !theme.id ||
      !theme.version
    )
      return;
    setLoading(true);
    setTheme(theme);
    setLoading(false);
  };

  const exportTheme = () => {
    const json = JSON.stringify(currentTheme);
    FileSaver.saveAs(
      new Blob([json], {
        type: "text/plain"
      }),
      `${currentTheme.id}.json`
    );
  };

  const onChangeColor = (
    target: HTMLInputElement,
    sibling: HTMLInputElement
  ) => {
    const value = target.value;
    if ((sibling as HTMLInputElement).value !== value) {
      (sibling as HTMLInputElement).value = target.value;
    }
  };

  return loading ? null : (
    <Flex
      sx={{
        display: "flex",
        overflow: "hidden",
        flex: 1,
        flexDirection: "column",
        height: "100%",
        overflowY: "scroll",
        padding: "10px 10px",
        rowGap: "10px"
      }}
    >
      <Flex
        sx={{
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Text
          sx={{
            fontSize: "12px"
          }}
          variant="heading"
        >
          Theme Builder 1.0
        </Text>
      </Flex>

      <Button sx={{ py: "7px" }} variant="secondary" onClick={exportTheme}>
        <Text
          sx={{
            fontSize: "12px"
          }}
        >
          Export theme
        </Text>
      </Button>
      <Button sx={{ py: "7px" }} variant="secondary" onClick={loadThemeFile}>
        <Text
          sx={{
            fontSize: "12px"
          }}
        >
          Load theme file
        </Text>
      </Button>

      <Flex
        as="form"
        id="theme-form"
        ref={formRef}
        onChange={onChange}
        onSubmit={(event) => {
          event?.preventDefault();
        }}
        sx={{
          flexDirection: "column",
          rowGap: "0.5rem"
        }}
      >
        {Object.keys(ThemeInfoTemplate).map((key) => {
          return (
            <Field
              key={key}
              label={toTitleCase(key)}
              name={key}
              defaultValue={currentThemeFlattened[key]}
              styles={{
                label: {
                  fontSize: "12px",
                  fontWeight: "normal",
                  color: "paragraph-secondary"
                },
                input: {
                  marginLeft: "0px",
                  marginRight: "0px",
                  height: "30px",
                  fontSize: "12px"
                }
              }}
            />
          );
        })}

        <SelectItem
          label="Color Scheme"
          options={[
            {
              title: "Light",
              value: "light"
            },
            {
              title: "Dark",
              value: "dark"
            }
          ]}
          defaultValue={currentThemeFlattened["colorScheme"]}
          name="colorScheme"
          key="colorScheme"
        />
        <SelectItem
          label="Compatibility version"
          name="compatibilityVersion"
          options={[
            {
              title: "1.0",
              value: 1.0
            }
          ]}
          defaultValue={currentThemeFlattened["compatibilityVersion"]}
          key="compatibilityVersion"
        />

        {authors.map((author, index) => (
          <Flex
            key={author.name}
            sx={{
              flexDirection: "column"
            }}
          >
            <Flex
              style={{
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <Text
                sx={{
                  fontSize: "12px",
                  color: "paragraph-secondary",
                  flexShrink: 0,
                  flex: 0.5,
                  marginRight: "20px",
                  mb: 1
                }}
              >
                Author {index + 1}
              </Text>

              {authors.length > 1 ? (
                <Button
                  sx={{
                    height: 25
                  }}
                  onClick={() => {
                    if (authors.length === 1) {
                      console.log("Theme must have at least one author");
                      return;
                    }
                    setAuthors((current) => {
                      const authors = [...current];
                      authors.splice(index, 1);
                      return authors;
                    });
                  }}
                >
                  <Close
                    sx={{
                      width: 15,
                      height: 15
                    }}
                  />
                </Button>
              ) : null}
            </Flex>

            {["name", "email", "url"].map((key) => (
              <>
                <Field
                  key={key}
                  label={toTitleCase(key)}
                  name={`authors.${index}.${key}`}
                  required={key === "name"}
                  defaultValue={author[key as keyof ThemeAuthor]}
                  styles={{
                    container: {
                      ml: 1
                    },
                    label: {
                      fontSize: "12px",
                      fontWeight: "normal",
                      color: "paragraph-secondary"
                    },
                    input: {
                      marginLeft: "0px",
                      marginRight: "0px",
                      height: "30px",
                      fontSize: "12px"
                    }
                  }}
                />
              </>
            ))}
          </Flex>
        ))}

        <Button
          onClick={() => {
            setAuthors((current) => {
              const authors = [...current];
              authors.push({
                name: ""
              });
              return authors;
            });
          }}
          variant="secondary"
          type="submit"
        >
          <Text color="accent">Add author</Text>
        </Button>

        {Scopes.map((scopeName) => (
          <>
            <Accordion
              isClosed={false}
              buttonSx={{
                backgroundColor: "transparent",
                borderBottom: "1px solid var(--border)",
                borderRadius: 0,
                p: 0,
                py: 1
              }}
              titleSx={{
                fontSize: "12px",
                color: "paragraph-secondary"
              }}
              title={toTitleCase(scopeName)}
            >
              {Variants.map((variantName) => (
                <>
                  <Accordion
                    isClosed={true}
                    buttonSx={{
                      backgroundColor: "transparent",
                      p: 0,
                      py: 1
                    }}
                    titleSx={{
                      fontSize: "12px",
                      color: "paragraph-secondary",
                      fontWeight: "normal",
                      ml: 1
                    }}
                    title={toTitleCase(variantName)}
                  >
                    {ColorNames.map((colorName) => (
                      <Flex
                        key={colorName}
                        sx={{
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "flex-start",
                          ml: 3
                        }}
                      >
                        <Text
                          sx={{
                            fontSize: "12px",
                            color: "paragraph-secondary",
                            flexShrink: 0,
                            flex: 0.5,
                            marginRight: "20px"
                          }}
                        >
                          {colorName}
                        </Text>
                        <Input
                          sx={{
                            fontSize: "12px",
                            height: "25px",
                            borderRadius: 0,
                            flex: 0.4,
                            borderBottom: "1px solid var(--border)",
                            outline: "none",
                            ":hover": {
                              borderWidth: "0px",
                              outline: "none"
                            }
                          }}
                          title={
                            /hover|shade|backdrop|textSelection/g.test(
                              colorName
                            )
                              ? `Hex RGB & ARGB values both are supported. (e.g. #dbdbdb99)`
                              : `Only Hex RGB values are supported. No Alpha. (e.g. #f33ff3)`
                          }
                          required={scopeName === "base"}
                          name={`scopes.${scopeName}.${variantName}.${colorName}`}
                          defaultValue={
                            currentThemeFlattened[
                              `scopes.${scopeName}.${variantName}.${colorName}`
                            ]
                          }
                          onChange={(event) => {
                            onChangeColor(
                              event.target,
                              event.target
                                .nextElementSibling as HTMLInputElement
                            );
                          }}
                        />
                        <Input
                          type="color"
                          onChange={(event) => {
                            onChangeColor(
                              event.target,
                              event.target
                                .previousElementSibling as HTMLInputElement
                            );
                          }}
                          title={
                            /hover|shade|backdrop|textSelection/g.test(
                              colorName
                            )
                              ? `Only Hex RGB values are supported. No Alpha. (e.g. #f33ff3)`
                              : `Hex RGB & ARGB values both are supported. (e.g. #dbdbdb99)`
                          }
                          defaultValue={
                            currentThemeFlattened[
                              `scopes.${scopeName}.${variantName}.${colorName}`
                            ]
                          }
                          sx={{
                            borderRadius: 0,
                            borderBottom: "1px solid var(--border)",
                            outline: "none",
                            width: "20px",
                            height: "20px",
                            padding: "0px"
                          }}
                        />
                      </Flex>
                    ))}
                  </Accordion>
                </>
              ))}
            </Accordion>
          </>
        ))}
      </Flex>
    </Flex>
  );
}

function SelectItem(props: {
  options: { title: string; value: any }[];
  defaultValue: any;
  onChange?: (value: string) => void;
  label: string;
  name: string;
}) {
  return (
    <Flex
      sx={{
        flexDirection: "column"
      }}
    >
      <Text
        sx={{
          fontSize: "12px",
          fontWeight: "normal",
          color: "paragraph-secondary"
        }}
        mb={1}
      >
        {props.label}
      </Text>
      <select
        style={{
          backgroundColor: "var(--background)",
          outline: "none",
          border: "1px solid var(--border-secondary)",
          borderRadius: "5px",
          color: "var(--paragraph)",
          height: "33px",
          fontSize: "12px"
        }}
        name={props.name}
        defaultValue={props.defaultValue}
        onChange={(e) => {
          const value = (e.target as HTMLSelectElement).value;
          props.onChange?.(value);
        }}
      >
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.title}
          </option>
        ))}
      </select>
    </Flex>
  );
}
