import { Box, Text } from 'grommet';
import { ProductFragment } from '../../../_generated/graphql';

interface ProductTileProps {
  product: ProductFragment;
  onSelect: (product: ProductFragment) => void;
}

export function ProductTile(props: ProductTileProps) {
  const { product, onSelect } = props;

  return (
    <Box
      border={{ color: 'border', size: 'xsmall' }}
      pad="small"
      round="small"
      onClick={() => onSelect(product)}
    >
      <Text size="large">{product.name}</Text>
      <Text>{product.note}</Text>
      <Text>{product.price} €</Text>
    </Box>
  );
}
