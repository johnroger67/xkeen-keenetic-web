# xkeen-keenetic-web

[![GitHub Release](https://img.shields.io/github/release/johnroger67/xkeen-keenetic-web?style=flat&color=green)](https://github.com/johnroger67/xkeen-keenetic-web/releases)
[![License](https://img.shields.io/github/license/johnroger67/xkeen-keenetic-web.svg?style=flat&color=orange)](LICENSE)

Веб-интерфейс для управления конфигурацией [`xkeen`](https://github.com/Corvus-Malus/XKeen) на маршрутизаторах Keenetic с Entware.

Основан на [nfqws-keenetic-web](https://github.com/nfqws/nfqws-keenetic-web).

<img src='https://raw.githubusercontent.com/johnroger67/xkeen-keenetic-web/master/screenshot.jpg' />

### Установка на Keenetic и другие системы с Entware

1. Установите необходимые зависимости
   ```bash
   opkg update
   opkg install ca-certificates wget-ssl
   opkg remove wget-nossl
   ```

2. Установите opkg-репозиторий в систему
   ```bash
   mkdir -p /opt/etc/opkg
   echo "src/gz xkeen-keenetic-web https://johnroger67.github.io/xkeen-keenetic-web/all" > /opt/etc/opkg/xkeen-keenetic-web.conf
   ```

3. Установите пакет
   ```bash
   opkg update
   opkg install xkeen-keenetic-web
   ```

##### Обновление

```bash
opkg update
opkg upgrade xkeen-keenetic-web
```

##### Удаление

```bash
opkg remove --autoremove xkeen-keenetic-web
```

##### Информация об установленной версии

```bash
opkg info xkeen-keenetic-web
```

---

> [!NOTE]
> Адрес веб-интерфейса `http://<router_ip>:91` (например http://192.168.1.1:91)<br/>
> Для авторизации введите имя пользователя и пароль пользователя entware (по умолчанию root и keenetic если не меняли при установке)<br/>
> Авторизацию можно отключить в конфиге `/opt/etc/xkeen_web.conf` установив настройку `enabled = false`

> [!TIP]
> По-умолчанию php использует только 8Мб памяти. Из-за этого ограничения, могут не загружаться большие файлы.
> Вы можете изменить конфигурацию php самостоятельно:<br/>
> Откройте файл `/opt/etc/php.ini` и измените следующие значения
> ```ini
> memory_limit = 32M
> post_max_size = 32M
> upload_max_filesize = 16M
> ```
