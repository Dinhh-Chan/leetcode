import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: ({ index, style, item }: { index: number; style: React.CSSProperties; item: T }) => React.ReactNode;
  className?: string;
}

const VirtualizedList = memo(<T,>({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  className 
}: VirtualizedListProps<T>) => {
  const itemData = useMemo(() => items, [items]);

  return (
    <List
      className={className}
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={itemData}
    >
      {({ index, style, data }) => renderItem({ index, style, item: data[index] })}
    </List>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

export default VirtualizedList;
