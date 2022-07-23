> a fork of the [next-swc](https://github.com/vercel/next.js/tree/canary/packages/next-swc)

## Development Process

  1. install rust https://www.rust-lang.org/learn/get-started
   
  1. `cd ${current directory}`
      
  1. test command `cargo test`

## build binary

  1. `cd ${toolpack directory}`
     
  1. build dev binary `npx napi build --platform --cargo-cwd build/swc ${Your Path}`

  1. build prod binary `npx napi build --platform --cargo-cwd build/swc ${Your Path} --release`

  1. push command ``
