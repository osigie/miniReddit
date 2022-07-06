import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";

type Props = {
  name: string;
  label: string;
  placeholder?: string;
  type: string
};

export default function InputField(Props: Props) {
  const { name, label, placeholder, type } = Props;
  const [field, { error }] = useField(name);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Input {...field} id={name}  placeholder={placeholder} type = {type} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
}
