# Vercel 发布说明

当前项目是纯静态网站，可直接从 GitHub 仓库导入 Vercel。

## 推荐流程

1. 在 GitHub 创建私有仓库 `taidian-property-website`；
2. 将本地 `main` 分支推送到该仓库；
3. 在 Vercel 控制台选择 **New Project**；
4. 导入该 GitHub 仓库；
5. Framework Preset 选择 **Other**；
6. Root Directory 保持仓库根目录；
7. 不设置 Build Command；
8. 不设置环境变量；
9. 点击 Deploy；
10. 发布成功后再绑定自定义域名。

## Git 更新后的发布方式

Vercel 连接仓库后：

- 推送到非生产分支时生成预览部署；
- 合并或推送到生产分支 `main` 时更新正式站点；
- 每次发布均可保留部署记录，便于回滚。

## 上线前检查

- 替换所有演示电话；
- 替换所有演示年限和项目数据；
- 替换案例名称与图片；
- 检查人物肖像和项目图片授权；
- 配置微信分享标题、摘要和封面；
- 手机微信内实测访问速度；
- 检查域名和后续备案策略。
