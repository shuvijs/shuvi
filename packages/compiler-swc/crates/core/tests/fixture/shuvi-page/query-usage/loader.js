export async function loader({ query  }) {
  return {
      props: {
          prop: query.prop
      }
  };
}