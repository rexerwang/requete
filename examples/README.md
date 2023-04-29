# examples

Contains some examples of using requete, such as importing by `UMD`, `CDN`, or `ES module`.

```tree
examples/
├── README.md
├── imports
│   ├── cdn.html
│   ├── es.html
│   └── umd.html
├── index.html
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
```
