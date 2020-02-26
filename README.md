# MultiMC Tokens
Use MultiMC to authenticate for `minecraft-protocol`

## Example Code
```typescript
import {use} from "multimc-tokens";
let client = use({
    multimc_location: "D:\\MultiMC", // Optional on linux.
    username: "Sascha_T",            // Optional.
    host: "localhost",               // You can also add other options as you would normally.
    port: 25565                      // ^
});
```

## `use` function
The main argument is an array and can contain 2 optional things: \
`multimc_location`: Location of the MultiMC installation \
`username`: Username (not email) of the user (if not specified or not found it defaults to the first profile found);

##### Mind you, this was written late at night so it might be a little unpolished.


#### This README will be expanded later
