import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import { Button } from '../components/core/Button';
import type { InputProps } from '../components/core/Input';
import { Input } from '../components/core/Input';
import { HStack, VStack } from '../components/core/Stacks';

export interface PromptProps {
  onHide: () => void;
  onResult: (value: string) => void;
  label: InputProps['label'];
  name: InputProps['name'];
  defaultValue: InputProps['defaultValue'];
}

export function Prompt({ onHide, label, name, defaultValue, onResult }: PromptProps) {
  const [value, setValue] = useState<string>(defaultValue ?? '');
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onHide();
      onResult(value);
    },
    [onHide, onResult, value],
  );

  return (
    <form onSubmit={handleSubmit}>
      <VStack space={6}>
        <Input
          hideLabel
          label={label}
          name={name}
          defaultValue={defaultValue}
          onChange={setValue}
        />
        <HStack space={2} justifyContent="end">
          <Button className="focus" color="gray" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" className="focus" color="primary">
            Save
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}