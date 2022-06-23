// This is the shuvi client-side entry
// IMPORTANT: `setup-env` must be runned before any other codes
import './setup-env';
import { app, render } from './setup-app';

app.init().then(() => {
  render;
});
