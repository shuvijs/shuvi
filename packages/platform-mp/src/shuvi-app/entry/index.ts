// This is the shuvi client-side entry
// IMPORTANT: `setup-env` must be runned before any other codes
import '../../targets/binance/runtime';
import './setup-env';
import { app } from './setup-app';

app.run();
