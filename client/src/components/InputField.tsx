import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";

type Props = {
  name: string;
  label: string;
  placeholder?: string;
  type: string;
  isTextArea?: boolean;
};

export default function InputField(Props: Props) {
  const { name, label, placeholder, type, isTextArea } = Props;
  const [field, { error }] = useField(name);

  let InputOrTextArea;
  if (isTextArea) {
    InputOrTextArea = Textarea;
  } else {
    InputOrTextArea = Input;
  }
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <InputOrTextArea
        {...field}
        id={name}
        placeholder={placeholder}
        type={type}
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
}
