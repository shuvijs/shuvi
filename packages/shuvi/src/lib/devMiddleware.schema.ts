// Schema without writeToDisk and publicPath
export default {
  type: 'object',
  properties: {
    mimeTypes: {
      type: 'object'
    },
    methods: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    headers: {
      type: 'object'
    },
    outputFileSystem: {
      type: 'object'
    },
    logLevel: {
      type: 'string'
    },
    logTime: {
      type: 'boolean'
    },
    reporter: {
      type: 'object'
    },
    watchOptions: {
      description: 'Options for the watcher.',
      type: 'object',
      additionalProperties: false,
      properties: {
        aggregateTimeout: {
          description:
            'Delay the rebuilt after the first change. Value is a time in ms.',
          type: 'number'
        },
        ignored: {
          type: 'array',
          description:
            'Ignore some files from watching (glob pattern or regexp).',
          items: {
            anyOf: [
              {
                type: 'array',
                items: {
                  description:
                    'A glob pattern for files that should be ignored from watching.',
                  type: 'string',
                  minLength: 1
                }
              },
              {
                instanceof: 'RegExp',
                tsType: 'RegExp'
              },
              {
                description:
                  'A single glob pattern for files that should be ignored from watching.',
                type: 'string',
                minLength: 1
              }
            ]
          }
        },
        poll: {
          description: 'Enable polling mode for watching.',
          anyOf: [
            {
              description: '`number`: use polling with specified interval.',
              type: 'number'
            },
            {
              description: '`true`: use polling.',
              type: 'boolean'
            }
          ]
        },
        stdin: {
          description: 'Stop watching when stdin stream has ended.',
          type: 'boolean'
        }
      }
    }
  },
  additionalProperties: false
};
