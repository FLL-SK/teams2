import { BoxTypes, Button, Card, CardBody, CardFooter, CardHeader, Layer } from 'grommet';

interface ModalProps extends BoxTypes {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  show?: boolean;
}

export function Modal(props: ModalProps) {
  const { onClose, children, title, footer, show = true } = props;

  if (!show) {
    return null;
  }

  return (
    <Layer>
      <Card pad="small">
        <CardHeader title={title} />
        <CardBody>{children}</CardBody>
        <CardFooter>
          {footer}
          {!footer && <Button label="Close" onClick={onClose} />}
        </CardFooter>
      </Card>
    </Layer>
  );
}
