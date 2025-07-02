// These should be kept when pagePickLoader is false
export function keepFunction() {
    return 'keep function';
}
export const keepConst = 'keep const';
export class KeepClass {
    method() {
        return 'keep class method';
    }
}
export default function KeepPage() {
    return 'keep page';
};
// Re-exports should be kept
const internal = 'internal';
export { internal as external }; 