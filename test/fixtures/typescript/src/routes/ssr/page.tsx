type Props = {
  data: string;
};

export default function Page({ data }: Props) {
  return <h1>{data}</h1>;
}
