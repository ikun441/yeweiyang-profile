# 云服务器部署 / Server deployment

正式域名 / Domain: https://yeweiyang.me/

备用入口 / Fallback: http://47.117.149.126:5173/

## 当前部署

- Ubuntu 22.04 + Nginx，5173 提供原 IP 入口，443 提供域名 HTTPS。
- 生产文件：`/var/www/yeweiyang-profile/current`；版本目录：`/var/www/yeweiyang-profile/releases/<commit>`。
- IP 入口配置：`/etc/nginx/sites-available/yeweiyang-profile`，对应本目录 `nginx.conf`。
- 域名配置：`/etc/nginx/sites-available/yeweiyang-domain`，对应 `nginx-domain.conf`。
- Nginx 由 systemd 管理并开机自启；域名源站配置 HTTP → HTTPS 跳转。
- `/revision.json` 提供部署源码版本及部署时间。

## HTTPS 证书与续期

已通过 Let's Encrypt DNS-01 手工验证签发，证书覆盖 `yeweiyang.me`，当前有效期至 **2027-01-17 07:22:27 UTC**。

服务器上的证书文件：

- `/etc/letsencrypt/live/yeweiyang.me/fullchain.pem`
- `/etc/letsencrypt/live/yeweiyang.me/privkey.pem`

**当前不是自动续期。** 手工 DNS 证书不能仅凭定时任务完成续期。后续可以在提供限定域名的 DNS API 授权后配置自动验证，或在备案拦截解除、HTTP 校验确认可达后改为 webroot 自动验证。

到期前手工续期：

```sh
certbot certonly --manual --preferred-challenges dns --cert-name yeweiyang.me -d yeweiyang.me
```

按提示更新阿里云 DNS 的 `_acme-challenge` TXT 记录，确认权威 DNS 已生效后继续。续期成功后，通过服务器 deploy hook 检查并重载 Nginx。

续期重载脚本：`/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh`。

## 备案与公网验证

2026-10-19 部署时，普通 HTTP 请求曾被阿里云返回 `Non-compliance ICP Filing`，导致 HTTP-01 验证失败，因此使用 DNS-01 签发。配置源站跳转不能解除云平台的备案/接入备案拦截；是否已完成备案需由域名持有人核实。

证书安装后，公网 HTTPS 已通过证书可信链、域名匹配和首页 HTTP 200 检查。原 IP:5173 入口保留，未强制转向域名。

## 更新与回退

1. 本地执行 `npm ci`、`npm run check`、`npm run build`。
2. 只上传 `dist/` 生产文件到新的版本目录，不上传凭据、源码或证书私钥。
3. 校验文件完整性及 `nginx -t`。
4. 原子切换 `current` 链接，执行 `systemctl reload nginx`。
5. 检查 HTTPS 首页、JS/CSS/图片和 `/revision.json`。
6. 回退时将 `current` 指回此前验证过的版本。

## English

Nginx serves the production build at **https://yeweiyang.me/** with the original IP:5173 site retained as a fallback. The domain configuration is in `nginx-domain.conf`; `nginx.conf` covers the fallback.

A Let's Encrypt certificate was issued using **manual DNS-01 validation**, valid until **2027-01-17 07:22:27 UTC**. Automatic renewal is **not configured**: it needs scoped DNS API access or a reachable HTTP challenge after the provider's ICP-filing interception is resolved. Renew manually with the Certbot command above and update the DNS TXT record when prompted. A deploy hook reloads Nginx after successful renewal.

Public HTTPS certificate validation and a 200 response were verified after installation. Ordinary HTTP requests were intercepted by Aliyun's ICP-filing system during issuance; an origin redirect does not remove that platform restriction.

Updates use versioned static release directories and the `current` symlink. Credentials and private keys never enter this repository.
