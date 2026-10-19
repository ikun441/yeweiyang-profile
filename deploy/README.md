# 云服务器部署 / Server deployment

访问地址 / Site URL: http://47.117.149.126:5173/

## 当前部署

- Ubuntu 22.04 + Nginx，监听 TCP 5173。
- 只上传 Vite 的 `dist/` 生产文件，不运行 Vite 开发服务器。
- Nginx 由 systemd 管理，配置开机自启。
- 站点配置：`/etc/nginx/sites-available/yeweiyang-profile`。
- 生效配置链接：`/etc/nginx/sites-enabled/yeweiyang-profile`。
- 版本目录：`/var/www/yeweiyang-profile/releases/<commit>`。
- 当前版本：`/var/www/yeweiyang-profile/current`，通过符号链接切换。
- `/revision.json` 提供部署源码版本与部署时间。
- 访问日志：`/var/log/nginx/yeweiyang-profile.access.log`。

## 更新流程

1. 本地执行 `npm ci`、`npm run check`、`npm run build`。
2. 将 `dist/` 打包，只上传静态产物到新的版本目录。
3. 校验文件完整性，执行 `nginx -t`。
4. 将 `current` 链接切换到新的版本目录，执行 `systemctl reload nginx`。
5. 检查公网首页、JS/CSS/图片和 `/revision.json`。

首次安装使用系统包管理器安装 Nginx，将本目录 `nginx.conf` 复制为站点配置。不要覆盖其他站点配置。首次部署的服务器原先没有 Web 服务，系统默认站点链接已停用。

## 回退

将 `current` 链接重新指向此前验证过的版本目录，再执行 `nginx -t && systemctl reload nginx`。保留旧版本直到新版验证通过。

## English

The production Vite build is served by Nginx on port 5173, managed by systemd with startup enabled. Release directories live under `/var/www/yeweiyang-profile/releases/`; the `current` symlink selects the active version.

To update, check and build locally, upload a new static release, verify checksums and Nginx configuration, switch the symlink and reload Nginx. Verify public HTML, scripts, styles, images and `revision.json`. To roll back, point the symlink at a previously verified release.

Credentials are never stored in this repository. Authentication uses the interactive SSH prompt.
