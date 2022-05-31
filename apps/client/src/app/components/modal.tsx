import { BoxTypes, Button, Card, CardBody, CardFooter, CardHeader, Layer, Text } from 'grommet';

interface ModalProps extends BoxTypes {
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
  } = props;

  if (!show) {
    return null;
  }

  return (
    <Layer>
      <Card>
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
