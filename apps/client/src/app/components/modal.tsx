import React from 'react';
import { BoxTypes, Button, Card, CardBody, CardFooter, CardHeader, Layer, Text } from 'grommet';
import { HeightType, WidthType } from 'grommet/utils';

interface ModalProps extends BoxTypes {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showButton?: boolean;
  buttonLabel?: string;
  show?: boolean;
  width?: WidthType;
  height?: HeightType;
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
          <Text size="medium" weight="bold">
            {title}
          </Text>
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
