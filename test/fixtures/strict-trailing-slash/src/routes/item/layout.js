import { RouterView } from '@shuvi/runtime';

/**
 * The point of the fixture: a layout below the root, so `/item` becomes an
 * intermediate route that owns part of the pathname and still has children.
 */
export default function ItemLayout() {
  return (
    <div>
      <div id="item-layout">Item Layout</div>
      <RouterView />
    </div>
  );
}
