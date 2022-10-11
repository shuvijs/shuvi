export const revalidateInSeconds = 5 * 60;
export const loader = async ()=>{
    return {
        props: {},
        revalidate: revalidateInSeconds
    };
};