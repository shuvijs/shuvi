// Schema without writeToDisk and publicPath
export default {
  type: 'object',
  properties: {
    mimeTypes: {
      description:
        'Allows a user to register custom mime types or extension mappings.',
      type: 'object'
    },
    methods: {
      description:
        'Allows to pass the list of HTTP request methods accepted by the middleware.',
      type: 'array',
      items: {
        type: 'string',
        minlength: '1'
      }
    },
    headers: {
      type: 'object'
    },
    stats: {
      description: 'Stats options object or preset name.',
      anyOf: [
        {
          enum: [
            'none',
            'summary',
            'errors-only',
            'errors-warnings',
            'minimal',
            'normal',
            'detailed',
            'verbose'
          ]
        },
        {
          type: 'boolean'
        },
        {
          type: 'object',
          additionalProperties: true
        }
      ]
    },
    serverSideRender: {
      description:
        'Instructs the module to enable or disable the server-side rendering mode.',
      type: 'boolean'
    },
    outputFileSystem: {
      description:
        'Set the default file system which will be used by webpack as primary destination of generated files.',
      type: 'object'
    },
    index: {
      description: 'Allows to serve an index of the directory.',
      anyOf: [
        {
          type: 'boolean'
        },
        {
          type: 'string',
          minlength: '1'
        }
      ]
    }
  },
  additionalProperties: false
};
