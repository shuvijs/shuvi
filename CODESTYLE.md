# Style Guide

In order to maintain a project's simplicity  in the long term, these rules should be followed.


## Every file should have it's own type file

```
// bad
types.js
a.js
b.js

// good
a.js
a.type.js
b.js
b.type.js
types.js // re-export a.types.js & b.types.js
```

### why

If `a.js` has been deleted, it will be easier to delete it's type.



## Don't access module with subpath

```
// bad
|- a
  |- a1.js
  |- a2.js

import a1 from 'a/a1';

// good
|- a
  |- a1.js
  |- a2.js
  |- index.js // re-export a1.js & a2.js

import { a1 } from 'a';
```

### why

Every folder is aslo module, only exports what are necessary and hide everything esle.
