import React from 'react';
import {
  Box,
  BoxExtendedProps,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Layer,
  Text,
} from 'grommet';
import { Close } from 'grommet-icons';

interface ModalProps extends BoxExtendedProps {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showButton?: boolean;
  buttonLabel?: string;
  show?: boolean;
}

export function Modal(props: ModalProps) {
  const {
    onClose,
    children,
    title,
    footer,
    show = true,
    showButton = false,
    buttonLabel = 'Ok',
    width,
    height,
  } = props;

  if (!show) {
    return null;
  }

  return (
    <Layer onEsc={onClose}>
      <Card width={width} height={height}>
        <CardHeader background={'light-3'} pad="small">
          <Box width="100%" justify="between" direction="row">
            <Text size="medium" weight="bold">
              {title}
            </Text>
            <Button plain icon={<Close />} onClick={onClose} />
          </Box>
        </CardHeader>
        <CardBody pad="small">{children}</CardBody>
        {(footer || showButton) && (
          <CardFooter pad="small">
            {footer}
            {showButton && <Button label={buttonLabel} onClick={onClose} />}
          </CardFooter>
        )}
      </Card>
    </Layer>
  );
}
