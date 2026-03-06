# s-validator

WASM-валидатор конфигов `sing-box` на теге `v1.11.13`.

## Что делает

- Загружает `main.wasm` в браузере.
- Экспортирует `window.SingboxParseConfig(config: string)`.
- Валидирует конфиг через нативный парсер `sing-box`:
  1. Парсинг `option.Options` (с `DisallowUnknownFields`).
  2. Проверка встроенных ограничений/типов из `option`-структур.

Из-за несовместимости ряда runtime-зависимостей `sing-box` с `js/wasm`
браузерная сборка не выполняет полный `box.New(...)` как в CLI-команде `sing-box check`.

## Локальная сборка

```bash
cd go
go mod tidy
make build
cd ..
npm ci
npm run build
```

`make build` кладет в `public/`:

- `main.wasm`
- `wasm_exec.js`
- `singbox.schema.json`
