const runLoadersAttrs = {
  error: {
    name: 'error',
    type: 'boolean'
  },
  errorType: {
    name: 'errorType',
    type: 'string',
    enum: ['redirect', 'userError', 'unexpectedError']
  }
};

/** category SERVER_CREATE_APP */
export const SERVER_CREATE_APP = {
  name: 'SERVER_CREATE_APP',
  events: {
    SHUVI_SERVER_CREATE_APP: {
      name: 'SHUVI_SERVER_CREATE_APP',
      duration: true
    },
    SHUVI_SERVER_APP_INIT: {
      name: 'SHUVI_SERVER_APP_INIT',
      duration: true
    },
    SHUVI_SERVER_RUN_LOADERS: {
      name: 'SHUVI_SERVER_RUN_LOADERS',
      duration: true,
      attrs: runLoadersAttrs
    }
  }
};

/** category SERVER_REQUEST */
export const SERVER_REQUEST = {
  name: 'SERVER_REQUEST',
  events: {
    SHUVI_SERVER_HANDLE_REQUEST_START: {
      name: 'SHUVI_SERVER_HANDLE_REQUEST_START',
      duration: false
    },
    SHUVI_SERVER_RUN_PAGE_MIDDLEWARE: {
      name: 'SHUVI_SERVER_RUN_PAGE_MIDDLEWARE',
      duration: true,
      attrs: {
        error: {
          name: 'error',
          type: 'boolean'
        },
        statusCode: {
          name: 'statusCode',
          type: 'number'
        }
      }
    },
    SHUVI_SERVER_RENDER_TO_STRING: {
      name: 'SHUVI_SERVER_RENDER_TO_STRING',
      duration: true,
      attrs: {
        error: {
          name: 'error',
          type: 'boolean'
        }
      }
    },
    SHUVI_SERVER_RENDER_TO_HTML: {
      name: 'SHUVI_SERVER_RENDER_TO_HTML',
      duration: true
    },
    SHUVI_SERVER_SEND_HTML_HOOK: {
      name: 'SHUVI_SERVER_SEND_HTML_HOOK',
      duration: true
    },
    SHUVI_SERVER_SEND_HTML_ORIGINAL: {
      name: 'SHUVI_SERVER_SEND_HTML_ORIGINAL',
      duration: true
    }
  }
};

/** category CLIENT_ENTRY */
export const CLIENT_ENTRY = {
  name: 'CLIENT_ENTRY',
  events: {
    SHUVI_CLIENT_ENTRY_START: {
      name: 'SHUVI_CLIENT_ENTRY_START',
      duration: false
    },
    SHUVI_CLIENT_SETUP_ENV: {
      name: 'SHUVI_CLIENT_SETUP_ENV',
      duration: true
    },
    SHUVI_CLIENT_CREATE_APP: {
      name: 'SHUVI_CLIENT_CREATE_APP',
      duration: true
    },
    SHUVI_CLIENT_APP_INIT: {
      name: 'SHUVI_CLIENT_APP_INIT',
      duration: true
    },
    SHUVI_CLIENT_RUN_APP: {
      name: 'SHUVI_CLIENT_RUN_APP',
      duration: true
    },
    SHUVI_CLIENT_DO_RENDER: {
      name: 'SHUVI_CLIENT_DO_RENDER',
      duration: true
    }
  }
};

const navigationAttrs = {
  from: {
    name: 'from',
    type: 'string'
  },
  to: {
    name: 'to',
    type: 'string'
  },
  navigationId: {
    name: 'navigationId',
    type: 'string'
  }
};

/** category CLIENT_RENDER */
export const CLIENT_RENDER = {
  name: 'CLIENT_RENDER',
  events: {
    SHUVI_PAGE_READY: {
      name: 'SHUVI_PAGE_READY',
      duration: false
    },
    SHUVI_NAVIGATION_TRIGGERED: {
      name: 'SHUVI_NAVIGATION_TRIGGERED',
      duration: true,
      attrs: navigationAttrs
    },
    SHUVI_NAVIGATION_DONE: {
      name: 'SHUVI_NAVIGATION_DONE',
      duration: true,
      attrs: navigationAttrs
    },
    SHUVI_CLIENT_RUN_LOADERS: {
      name: 'SHUVI_CLIENT_RUN_LOADERS',
      duration: true,
      attrs: runLoadersAttrs
    }
  }
};
