import { trace } from '@shuvi/service/lib/trace';
import { CLIENT_ENTRY, CLIENT_RENDER } from '@shuvi/shared/constants/trace';

export const clientEntryTrace = trace(CLIENT_ENTRY.name);
export const clientRenderTrace = trace(CLIENT_RENDER.name);
