# s-validator

WASM-валидатор конфигов `sing-box` с мультиверсионным деплоем на GitHub Pages.

## URL-структура

- `https://adam-sizzler.github.io/s-validator/` — всегда `latest`
- `https://adam-sizzler.github.io/s-validator/v/1.11.13/` — фиксированная версия
- `https://adam-sizzler.github.io/s-validator/v/1.12.24/` — фиксированная версия
- `https://adam-sizzler.github.io/s-validator/v/latest/` — алиас `latest`

Список фиксированных версий хранится в [`versions.json`](./versions.json):

```json
{
  "pinnedVersions": ["1.11.13", "1.12.24"],
  "includeLatest": true
}
```

## Как это собирается

- Для каждой версии собирается свой `main.wasm`/`wasm_exec.js`.
- Для каждой версии фронтенд собирается со своим `base` (`/`, `/v/1.11.13/`, `/v/1.12.24/`, `/v/latest/`).
- Готовая структура складывается в `site/` и деплоится в GitHub Pages.

Скрипт сборки: [`scripts/build-pages.sh`](./scripts/build-pages.sh).

## Локальная сборка мультиверсий

```bash
npm ci
./scripts/build-pages.sh
```
