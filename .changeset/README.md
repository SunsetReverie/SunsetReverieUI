# Changesets

本目录存放「尚未发布」的变更说明。

## 用法

每次提交 PR 前执行：

```bash
pnpm changeset
```

按提示选择受影响的包、版本位（patch / minor / major），并写一句中文说明。
生成的文件（如 `brave-lions-dance.md`）随 PR 一起提交。

发版时执行：

```bash
pnpm version-packages   # 汇总所有 changeset → 升版本号 + 写 CHANGELOG
```

## 约定

- 四个发布包（ui / nuxt / resolver / icons）版本号由 `config.json` 的 `fixed` 锁定，始终一致。
- `internal-tokens` 与 `examples` 为私有包，不参与版本管理。
- 本库不执行 `changeset publish`（不发布 NPM），只用 version 与 changelog 两步。
