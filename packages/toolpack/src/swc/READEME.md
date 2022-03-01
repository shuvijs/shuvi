## Development Process

  1. install rust https://www.rust-lang.org/learn/get-started
   
  1. `cd ${current directory}`
      
  1. test command `cargo test`

## build binary

  1. `cd ${toolpack directory}`
     
  1. build dev binary `npx run build-native`

  1. build prod binary `npx run build-native --release`

  1. publish workflows `.github/workflows/swc_binary_deploy.yml`
