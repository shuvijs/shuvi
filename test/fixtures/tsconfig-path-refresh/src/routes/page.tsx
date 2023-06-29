import { Component1 } from '@comp/component-1';
import { Component2 } from '@/components/component-2';
import { firstData } from '@lib/first-data';

export default function Page() {
  return (
    <>
      <Component1 id="first-component" />
      <Component2 id="second-component" />
      <p id="first-data">{JSON.stringify(firstData)}</p>
    </>
  );
}
