# examples

Contains some examples of using requete.

```tree
examples
├── index.html
├── cdn.html
├── umd.html
├── middleware.html
├── responseType.html
└── mocks                  # mocks by json-server
    ├── db.json            # json data
    ├── json-server.json   # configs
    └── middlewares.cjs    # middleware for serve static `dist` directory
```

## Startup

```sh
pnpm install
pnpm build
pnpm serve

open http://localhost:3000
```
